# Shape Syntax — full reference for `dt-shape` v3.x

> A shape is a plain JS object. Every key in it becomes a key in the
> result (when a value is found). Every value in it is an **array** of
> candidate source paths. The array nature is non-negotiable: a value
> of `'name'` is a bug; `[ 'name' ]` is the rule.

## Anatomy of a shape key

```
<optional-prefix>!<output-path> : [ <source-path-1>, <source-path-2>, … ]
```

| Part           | Required | Notes                                                        |
| -------------- | -------- | ------------------------------------------------------------ |
| `prefix!`      | optional | One of `fold!`, `list!`, `load!`. Omit for default (last source wins) mode. |
| `output-path`  | required | Either `key` (flat) or `parent/child/...` (nested output).   |
| Source array   | required | Always an array, even for a single source. Last element wins. |

The prefix sits on the SHAPE KEY; it does not modify the source paths
inside the array. `'fold!meta'` is parsed as
`prefix = 'fold'`, `output-path = 'meta'`.

The output-path uses `/` as the segment separator, both for the shape
key and for source paths. There is no escape syntax for `/` in keys
or paths. See "Edge cases" below.


## Default mode (no prefix)

dt-shape applies last-wins semantics: each subsequent path that
resolves OVERWRITES the result. The LAST element that resolves is the
winner. A path resolves only if it has a REAL value (see below).

```js
const shape = { firstName: [ 'firstName', 'profile/name', 'name' ] }
dtShape(dtbox.init({ firstName: 'Peter' }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
dtShape(dtbox.init({ firstName: 'Peter', profile: { name: 'Pit' } }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Pit' }
```

- If `name` resolves → it's the result (it is listed last). `name` has
  no path, so it is searched in the whole source and also matches
  `profile.name` (see "Source paths" below).
- If it doesn't, but `source.profile.name` resolves → that becomes the
  result.
- Only if neither resolves, `source.firstName` is the result.
- If both `firstName` and `profile/name` resolve, `profile/name`
  (the later one) wins — even if `firstName` is "valid".

This is why priority is "last wins, but only if it resolves".

### What counts as "resolves" — only real values

dt-shape works only with real values. A path resolves if it EXISTS in
the source AND its value is a real value:

- Real values: any primitive except `null`/`undefined` — including
  `0`, `''` and `false` — plus `Date`, `RegExp`, and non-empty objects
  and arrays.
- NOT values: missing paths, `null`, `undefined`, `{}`, `[]`. They are
  skipped everywhere and never overwrite a found value.

```js
const shape = { x: [ 'a', 'b' ] }
dtShape(dtbox.init({ a: 1, b: null }), shape).model(() => ({ as: 'std' }))
// → { x: 1 }
dtShape(dtbox.init({ a: 1, b: {} }), shape).model(() => ({ as: 'std' }))
// → { x: 1 }
dtShape(dtbox.init({ a: 1, b: 0 }), shape).model(() => ({ as: 'std' }))
// → { x: 0 }
```

When a path points to an object, the copy has no `null` or
`undefined` properties: `{ age: 42, phone: null }` is copied as
`{ age: 42 }`. Arrays keep their positions — `[ 1, null, 3 ]` is
copied as it is, because positions are data (coordinates, rows). For
a compact list use `list!`: `{ 'list!s': [ 's' ] }` gives `[ 1, 3 ]`.
An array with only `null` values (`[ null, null ]`) is not a value.

```js
const src = dtbox.init({ person: { age: 42, phone: null }, s: [ 1, null, 3 ] })
dtShape(src, { person: [ 'person' ], s: [ 's' ], 'list!compact': [ 's' ] }).model(() => ({ as: 'std' }))
// → { person: { age: 42 }, s: [ 1, null, 3 ], compact: [ 1, 3 ] }
```


## `list!` prefix — collect into an array

```js
const src = dtbox.init({ email: 'peter@example.com', phone: null, twitter: '@peter' })
dtShape(src, { 'list!contacts': [ 'email', 'phone', 'twitter' ] }).model(() => ({ as: 'std' }))
// → { contacts: [ 'peter@example.com', '@peter' ] }
```

`list!` walks the source array and pushes every value that resolves
into a result array. Only real values are pushed — missing paths,
`null`, `undefined` and empty objects/arrays are skipped. The
result is always an array, in the order of the source array. If no
source resolves, the entire key is dropped.

When the source path points at an object or array, `list!` pushes
its VALUES (one level deep). Nested objects and arrays inside it are
pushed as whole values.

```js
const out = dtShape(dtbox.init({ phone: '+1…', meta: { tag: 'admin', geo: { lat: 42 } } }),
                    { 'list!xs': [ 'phone', 'meta', 'email' ] })
              .model(() => ({ as: 'std' }))
// out → { xs: [ '+1…', 'admin', { lat: 42 } ] }
```


## `fold!` prefix — collect into an object

```js
const src = dtbox.init({ name: 'Peter', meta: { role: 'admin' }, profile: { age: 42, meta: { tier: 'gold' } } })
dtShape(src, { 'fold!meta': [ 'profile/meta', 'meta' ] }).model(() => ({ as: 'std' }))
// → { meta: { tier: 'gold', role: 'admin' } }
dtShape(src, { 'fold!person': [ 'name', 'profile/age' ] }).model(() => ({ as: 'std' }))
// → { person: { name: 'Peter', age: 42 } }
```

`fold!` walks the source array and, for every real value,
MERGES it into the result object. An object source adds its
properties; a primitive value is stored under the last segment of its
path (`'profile/age'` → `age`). The merge is **last-wins** at the
top level only — nested objects from earlier sources are NOT deep-
merged; the later source's value REPLACES the earlier source's value
at the same key.

```js
const out = dtShape(dtbox.init({
  meta:      { a: 1, b: 2 },
  otherMeta: { b: 99, c: 3 }
}), { 'fold!all': [ 'meta', 'otherMeta' ] })
  .model(() => ({ as: 'std' }))
// out → { all: { a: 1, b: 99, c: 3 } }
```

`b` came from `otherMeta` because that path was listed later.

The merge is "shallow overlay". If you need deep merge, walk the
result and merge yourself, or use a dedicated library.

The output key (`fold!` strips the prefix) is a single property in
the result; the collection always becomes a plain object under that
key.

If no source resolves, the key is dropped — `fold!` does NOT create
an empty `{}`.


## `load!` prefix — inject values, no source lookup

```js
const shape = {
  'load!version'   : [ '1.0.0' ],
  'load!timestamp' : [ () => Date.now() ],
  'load!appName'   : [ 'fallback', () => process.env.APP_NAME ]
}
const out = dtShape(dtbox.init({}), shape).model(() => ({ as: 'std' }))
out.version
// → '1.0.0'
typeof out.timestamp
// → 'number'
// out.appName is process.env.APP_NAME when it is set, 'fallback' otherwise
```

`load!` skips the dt-object entirely. The value array is evaluated
left-to-right:
- If the current element is a function, it is called with no
  arguments, and the return value replaces the element.
- The LAST real value wins, like in default mode. `null`,
  `undefined`, `{}` and `[]` are skipped, so a default goes FIRST:
  `[ 'fallback', () => process.env.APP_NAME ]` gives the env value
  when it is set, and `'fallback'` otherwise. Note that
  `[ process.env.APP_NAME, 'fallback' ]` always gives `'fallback'`.

If no element has a real value, the key is dropped.

### Mixing `load!` with other modes on the same key

Don't. Two shape keys with the same output path (after stripping
their prefixes) share the same output slot. The last one in
declaration order that finds a real value wins, regardless of
prefix. This is true even when the prefixes are different.

```js
const shape = { 'load!firstName':  [ 'Ivan' ], 'firstName': [ 'profile/name' ] }
// 'firstName' is the SAME output slot as 'load!firstName'.
dtShape(dtbox.init({ profile: { name: 'Peter' } }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
dtShape(dtbox.init({ profile: {} }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Ivan' }
// profile/name wins because it is declared later — when it has a value.
```

Pick one mode per output key. If you need a conditional override,
use a `load!` function that reads the plain source data (not the
dt-object) and decides what to return.


## Source paths — the `/` segment syntax

A source path WITH a parent reads exactly that place:

- `'profile/name'` reads `source.profile.name`. You can chain any
  number of segments.
- A number segment reads an array position: `'coords/0'`,
  `'list/1/id'`.
- If the parent does not exist, the value is not found. There is no
  fallback search.

A key WITHOUT a path (`'name'`) searches the whole source. If it
matches in several places, the last match wins — top-level data is
checked first, nested data after it. `list!` collects all matches.
This search finds primitive values; objects and arrays are found by
their full path (`'meta'` at the top level, `'profile/meta'` nested).

```js
const src = dtbox.init({
  name   : 'Peter',
  profile: { name: 'Ivan' },
  coords : [ 42, 23 ],
  list   : [ { id: 1 }, { id: 2 } ]
})
dtShape(src, { top: [ 'profile/name' ], lat: [ 'coords/0' ], second: [ 'list/1/id' ], miss: [ 'user/name' ] }).model(() => ({ as: 'std' }))
// → { top: 'Ivan', lat: 42, second: 2 }
dtShape(src, { any: [ 'name' ], 'list!all': [ 'name' ] }).model(() => ({ as: 'std' }))
// → { any: 'Ivan', all: [ 'Peter', 'Ivan' ] }
```

There is no escaping. If a key in your source really contains `/`,
normalise it before passing to dt-shape.


## Output paths — `/` builds nested output

```js
const shape = {
  'profile/name'    : [ 'name' ],          // result.profile.name
  'a/b/c'           : [ 'x' ]              // result.a.b.c
}
dtShape(dtbox.init({ name: 'Peter', x: 1 }), shape).model(() => ({ as: 'std' }))
// → { profile: { name: 'Peter' }, a: { b: { c: 1 } } }
```

Output paths and source paths use the same syntax; they are
independent strings. You can rename AND nest in one rule. A number
in an output path creates an array (`'coords/0'`).

If two shape keys share a parent output path, the parent's children
are merged. Shape keys apply in order: an object written to a path
that already holds an object is deep-merged; any other value
replaces what is there.

```js
const shape = {
  'profile/name'    : [ 'name' ],
  'profile/age'     : [ 'age' ]
}
dtShape(dtbox.init({ name: 'Peter', age: 42 }), shape).model(() => ({ as: 'std' }))
// → { profile: { name: 'Peter', age: 42 } }
```

If two shape keys target the same leaf output key, the later
declaration with a real value wins.

If a shape key targets a path whose parent is itself another shape
key, behaviour depends on whether the parent's value is a primitive
or an object — see "6. Shape keys that write to the same output
path" in `pitfalls.md`.


## Empty arrays, missing keys, and what "dropped" means

```js
const shape = { 'load!maybe': [ null, undefined, () => undefined ], empty: [], gone: [ 'missing' ] }
dtShape(dtbox.init({ a: 1 }), shape).model(() => ({ as: 'std' }))
// → {}
```

- Empty value array `[]` → key is dropped (nothing to evaluate).
- No member has a real value (all are `null`, `undefined`, `{}`,
  `[]`, or missing) → key is dropped. This applies to all four modes.
- All values are missing paths in default / `list!` / `fold!` mode
  → key is dropped.

To keep a key in the output, pass `defaults` — the third argument of
`dtShape`. Keys are output paths (prefixes are ignored), values are
used as they are, including `null`, `[]` and `{}`. Defaults fill only
the places without a value — a real value from the shape is never
replaced, and default objects add only their missing properties.

Array defaults fill empty positions (`null` or missing). A whole array
is a template; a specific position can have its own default, which
wins over the template:

```js
const dt = dtbox.init({ coords: [ 5, null ] })
dtShape(dt, { coords: [ 'coords' ] }, { coords: [ 0, 0, 0, 0 ], 'coords/3': 1 }).model(() => ({ as: 'std' }))
// → { coords: [ 5, 0, 0, 1 ] }
```

A number in an output path creates an array, so a fixed-size array can
be built from separate fields:

```js
const dt = dtbox.init({ lng: 23 })
dtShape(dt, { 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] }, { coords: [ 0, 0 ] }).model(() => ({ as: 'std' }))
// → { coords: [ 0, 23 ] }
```

```js
const dt  = dtbox.init({})
const out = dtShape(dt,
        { status: [ 'status' ], 'list!tags': [ 'tags' ], 'profile/age': [ 'age' ] },
        { status: 'unknown', tags: [], 'profile/age': 0 })
  .model(() => ({ as: 'std' }))
// out → { status: 'unknown', tags: [], profile: { age: 0 } }
```


## Array shape (top-level array)

If the shape itself is an array, dt-shape initialises the result as
an empty array `[]` instead of `{}`. The rules above still apply
per key — each position of the shape is a list of source paths:

```js
// shape is an array — uncommon, but supported
dtShape(dtbox.init({ a: 1, b: 2 }), [ [ 'b' ], [ 'a' ] ]).model(() => ({ as: 'std' }))
// → [ 2, 1 ]
```

In practice, almost every real-world shape is an object. The array
form is a niche escape hatch.


## Quick-decision table

| You want to…                                   | Shape pattern                                             |
| ---------------------------------------------- | --------------------------------------------------------- |
| Rename a single field                          | `{ newKey: [ 'oldKey' ] }`                                |
| Rename with a fallback                         | `{ newKey: [ 'a', 'b' ] }` (b wins if both resolve)       |
| Output a nested object                         | `{ 'a/b': [ 'x' ] }`                                      |
| Read an array position                         | `{ lat: [ 'coords/0' ] }`                                 |
| Collect values from several sources into a list | `{ 'list!xs': [ 'a', 'b', 'c' ] }`                       |
| Collect sources into one object                | `{ 'fold!all': [ 'a', 'b' ] }`                            |
| Always provide a default                       | `{ 'load!k': [ 'fallback' ] }`                            |
| Compute a value at call time                   | `{ 'load!k': [ () => compute() ] }`                       |
| Value with a default                           | `{ 'load!k': [ 'default', () => maybeValue ] }`           |
