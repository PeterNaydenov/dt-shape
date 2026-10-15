# DT-object integration — how `dt-shape` sits on top of `dt-toolbox`

> dt-shape is a thin layer over `dt-toolbox`. Understanding a few
> `dt-toolbox` concepts avoids the most common dt-shape bugs.

## The toolbox and the dt-object

`dt-toolbox` provides:
- A `dtbox.init(value)` that wraps any plain JS value into a `dt-object`
  (a lazy, internally-shredded representation of the original).
- A `dt.query(fn)` API on dt-objects that lets you walk the data.
- A `.model(policy)` API on dt-objects that converts the result back
  to a plain value.

`dt-shape` does:
- Owns its own `dtbox` import (a pinned compatible version of
  dt-toolbox, declared in `dt-shape`'s `dependencies`).
- Re-exports it via `dtShape.getDTtoolbox()`.
- Uses `dt.query` internally to walk the source and assemble the
  result.

This is why you must go through `dtShape.getDTtoolbox()` rather than
importing `dt-toolbox` directly: the two packages can drift, and
dt-shape's internal calls assume its own pinned version.


## When to convert, and when to skip

**Convert with `dtbox.init(plainValue)`** when the value is a plain
JS object / array coming from JSON, an API response, a fixture, a
test, or user input. This is 99% of the cases.

**Skip the conversion** when you already have a dt-object — pass it
to `dtShape` as it is. Re-init is not needed: `dtbox.init(dtObject)`
only makes a copy (dt-toolbox 8.1.2 and newer). dt-toolbox 8.1.1 and
older returned an EMPTY dt-object, so every key was dropped.

```js
const shape = { firstName: [ 'profile/name' ] }
const a = dtbox.init({ profile: { name: 'Peter' } })   // plain data → dt-object
const c = dtShape(a, shape)         // dt-object in, dt-object out
c.model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
const d = dtShape(dtbox.init(a), shape)   // Not needed: works on a copy of `a`
d.model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
```

If you have a chain of dt-shapes where the output of one is the input
to the next, just pass the dt-object through:

```js
const raw    = dtbox.init({ profile: { name: 'Peter' } })
const shapeA = { firstName: [ 'profile/name' ] }
const shapeB = { 'user/name': [ 'firstName' ] }
const step1 = dtShape(raw, shapeA)            // dt-object
const step2 = dtShape(step1, shapeB)          // dt-object
const js    = step2.model(() => ({ as: 'std' }))
// js → { user: { name: 'Peter' } }
```


## The `.model()` policies

The return of `dtShape(...)` is a dt-object. To get a plain JS value
back, call `.model(policyFn)` on it. The policy function takes no
arguments and returns a policy object. The most common policies:

| Policy                            | Output                                       |
| --------------------------------- | -------------------------------------------- |
| `() => ({ as: 'std' })`           | Plain object / array / primitive. JSON-safe for primitives, objects, and arrays of those. |
| `() => ({ as: 'breadcrumbs' })`   | Flat object with path keys: `{ 'profile/name': 'Peter' }`. |
| `() => ({ as: 'tuples' })`        | List of `[ path, value ]` pairs. |
| `() => ({ as: 'dt-object' })`     | A new dt-object (same as omitting `as`). |

```js
const out = dtShape(dtbox.init({ profile: { name: 'Peter' } }), { profile: [ 'profile' ] })
out.model(() => ({ as: 'std' }))
// → { profile: { name: 'Peter' } }
out.model(() => ({ as: 'breadcrumbs' }))
// → { 'profile/name': 'Peter' }
out.model(() => ({ as: 'tuples' }))
// → [ [ 'profile/name', 'Peter' ] ]
```

dt-toolbox 8 has a few more (`'files'`, `'flat'`, `'midFlat'`,
`'dt-model'`). An unknown `as` value (e.g. `'keep'`, `'object'`)
throws, and the error lists the supported ones.

For most consumers — `JSON.stringify`, `res.json`, `console.log`,
passing to a renderer — use `as: 'std'`. If you need the dt-object
itself (because you want to call `.query()` on the result, or pass
it to another dt-toolbox call), skip `.model()` entirely.

`as: 'std'` is the right default. Switch only when you know the
consumer wants dt-object semantics.


## Reusing a single toolbox across many calls

`dtbox.init`, `dtShape`, and the dt-object's `.model()` are all
stateless operations. You can call them from inside request handlers,
workers, or test cases without worrying about cleanup. There is no
`.destroy()`, no internal cache that needs to be cleared, and no
memory leak you need to defend against.

The one thing you SHOULD keep stable is the toolbox instance itself.
Create it once at module top level:

```js
// fragment — module top-level code (uses `export`)
// at the top of the file
import dtShape from 'dt-shape'
export const dtbox = dtShape.getDTtoolbox()
```

Then `dtbox.init(...)` everywhere else.


## What `dt.query` looks like under the hood

If you ever need to read directly from a dt-object (most projects
don't), the API is:

```js
const dt = dtbox.init({ profile: { name: 'Peter' } })
dt.query(store => {
  // store.get, store.set, store.look, store.connect, store.save
  // — these are dt-toolbox internals, not part of the dt-shape
  //   public surface.
})
```

dt-shape uses this internally. You should not need to call it
yourself; if you do, you probably want to use `dt-toolbox` directly
instead of routing through `dt-shape`.


## Quick mental check before shipping

Before you call `dtShape` in production, ask:

1. Is the source a dt-object? If not, did I run it through
   `dtbox.init` first?
2. Did I import the toolbox via `dtShape.getDTtoolbox()` and NOT via
   `import 'dt-toolbox'`?
3. Does every value in the shape have at least one path that is
   likely to resolve? (Otherwise the key will be silently absent.)
4. Did I append `.model(() => ({ as: 'std' }))` if the consumer
   wants a plain JS value?
5. Are any path segments using `/` in a way that conflicts with
   nesting syntax?
6. Is the shape shared as a contract (good) or rebuilt per call
   site (bad)?

If yes to all six, ship it.
