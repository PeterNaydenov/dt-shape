---
name: peter-naydenov-dt-shape
description: |
  Build JavaScript data structures by applying a "shape" — a plain-object
  recipe that maps each desired output key to a list of candidate source
  paths — to a source object using the `dt-shape` library. Load this skill
  when the user asks to "reshape data", "project an object", "pick fields
  from an object", "rename properties", "build a DTO/view-model", "map
  one schema onto another", or mentions `dt-shape`, `data shape`, "shape
  object", "view model from raw data". Use it for any task that turns a
  heterogeneous source object into a stable, well-known output structure
  with priority-ordered fallbacks. Do NOT use for full DOM rendering
  (use a templating skill), for in-place mutation of the source object
  (dt-shape is read-only), or for general-purpose object traversal
  (use plain JS or `lodash.get`-style helpers). Do NOT confuse with
  `@peter.naydenov/dim` (invisible DOM markers) or `@peter.naydenov/morph`
  (DOM diffing / templates) — those handle the DOM, dt-shape handles data.
---

# peter.naydenov/dt-shape

A tiny data-projection library. You describe the output you want as a plain
object — the **shape** — and dt-shape walks a **dt-object** (a wrapper
created by `dt-toolbox` around any plain JS object) and returns a new
dt-object with the result.

```js
import dtShape from 'dt-shape'
const dtbox = dtShape.getDTtoolbox()

const source  = dtbox.init({ profile: { name: 'Peter', sirname: 'Naydenov' } })
const shape   = { firstName: ['profile/name'], lastName: ['profile/sirname'] }
const result  = dtShape(source, shape).model(() => ({ as: 'std' }))
// result === { firstName: 'Peter', lastName: 'Naydenov' }
```

The result is a dt-object — call `.model(...)` to get a plain JS value.

For the source to be readable by dt-shape, it must first be converted via
`dtShape.getDTtoolbox().init(plainObject)`. The same toolbox instance is
also what you can reach into for higher-level dt-toolbox operations later.


## Mental model — read this before writing code

- **The shape is a recipe, not a query.** Keys are output property names;
  values are arrays of candidate source paths. The shape does not run
  arbitrary code; it just maps paths to output slots.
- **Priority is on the LAST element of the array.** `[ 'a', 'b' ]` means
  "try `a` first, fall back to `b` if `a` is missing" — and if both
  exist, `b` wins. This is opposite of the usual "first non-null"
  convention, so always double-check before adding fallbacks.
- **Path strings use `/` as the segment separator.** `profile/name` means
  `source.profile.name`. There is no escaping; `/` is not allowed in
  source keys. For output nesting, use the same `/` in the shape KEY:
  `'a/b'` produces `{ a: { b: value } }`.
- **Missing sources are silently dropped.** If none of the listed paths
  resolve, the output key is absent — no `null`, no `undefined`, no
  empty string. The same applies to a `load!` function returning
  `undefined`/`null`. Build your output defensively, or check the result
  before serialising.
- **Result is a dt-object, not a plain object.** The return value of
  `dtShape(dt, shape)` is a dt-object. To get a plain JS value, call
  `.model(() => ({ as: 'std' }))` (or `as: 'keep'`, `as: 'object'` —
  see `references/dt-object-integration.md`).
- **Three prefixes change the collection mode:** `fold!` collects
  resolved values into an object, `list!` collects them into an array,
  `load!` evaluates items as functions/values and skips the dt-object
  entirely. Unprefixed keys collect the FIRST non-null value.
- **The shape is also a record of intent.** Because the same shape can
  be applied to many different source objects (test fixture, production
  data, mock), the shape is a stable contract between systems — keep it
  in a shared file, not inlined per call site.
- **dt-shape is read-only.** It never mutates the source dt-object. The
  returned dt-object is also independent of the source.


## Procedure

### 1. Resolve the toolbox and convert the source

```js
import dtShape from 'dt-shape'
const dtbox = dtShape.getDTtoolbox()       // always go through dtShape

// Source may be a plain object, an array, or an existing dt-object
const source = dtbox.init(plainData)        // returns a dt-object
```

Why: `dtShape` reads through dt-toolbox query/store APIs. A raw JS
object will not work. Always import the toolbox via `dtShape.getDTtoolbox()`
so version drift between `dt-shape` and a separately-installed
`dt-toolbox` does not break the result.

### 2. Write the shape as an object literal

```js
const userShape = {
  // simple rename + fallback
  firstName       : [ 'firstName', 'profile/name' ],
  // nested output: produces { profile: { lastName } }
  'profile/lastName': [ 'sirname', 'familyName' ],
  // collect several sources into an array
  'list!tags'     : [ 'tags', 'labels' ],
  // collect sources into an object keyed by their path tail
  'fold!meta'     : [ 'meta', 'profile/meta' ],
  // bring in a constant or a function result (no source lookup)
  'load!version'  : [ '1.0.0' ],
  'load!timestamp': [ () => Date.now() ]
}
```

For the full precedence rules and edge cases (slash segments, mixed
prefixes in one key, function evaluation order, what counts as "missing")
see `references/shape-syntax.md`.

### 3. Call `dtShape` and convert the result

```js
const out = dtShape(source, userShape)
const js  = out.model(() => ({ as: 'std' }))   // plain JS object
// or, for a JSON-safe value, the `as: 'std'` policy is the right pick
```

`.model(() => ({ as: 'std' }))` is the canonical "give me a normal JS
object" call. Other policies are available; see
`references/dt-object-integration.md` for the full list.

### 4. Reuse, don't rebuild

Define the shape once (typically at module top level) and call
`dtShape(source, shape)` per request. The shape is plain data and is
safe to share across sources, threads, and tests. If two call sites
need slightly different shapes, compose them with spread — the keys
that appear later overwrite earlier ones, so the priority order is
the merge order.

```js
const baseShape = { firstName: ['name'] }
const viewShape = { ...baseShape, fullName: ['firstName','lastName'] }
```


## Output contract

When the task is "apply dt-shape to X", produce code that:

- Imports `dtShape` (ESM `import dtShape from 'dt-shape'`; CJS
  `const dtShape = require('dt-shape')`; UMD `window.dtShape`).
- Calls `dtShape.getDTtoolbox()` once per file and reuses the result
  (do NOT `import 'dt-toolbox'` directly — version drift will break you).
- Wraps the source with `dtbox.init(plainData)` before passing to
  `dtShape` (skipping this is the #1 silent failure mode — see below).
- Defines the shape as a plain object literal at the top of the module
  or as an exported constant; do not construct it inside a hot loop.
- Calls `dtShape(source, shape).model(() => ({ as: 'std' }))` to get
  a plain JS value back; do not assume the return value of `dtShape`
  is directly JSON-serialisable.
- Treats the shape as a contract: every key in the shape is a
  guarantee the result will have IF the source provides any of the
  listed paths. Document that contract in code comments.
- Does NOT mutate the source dt-object (dt-shape won't, but downstream
  code that holds a reference to it might).
- Does NOT depend on iteration order beyond what `Object.entries`
  guarantees — dt-shape evaluates shape keys in declaration order
  and uses last-wins priority INSIDE each value array, but the order
  between independent keys does not affect the result.


## Failure handling

- **"I got `[object Object]` instead of my data"** — the call site
  returned a dt-object and forgot `.model(...)`. Append
  `.model(() => ({ as: 'std' }))` to get a plain object.
- **"My output is empty / keys are missing"** — every listed path
  returned `undefined`, `null`, or didn't exist. dt-shape drops the
  key silently. Either add more fallback paths in the value array or
  check the result before use.
- **"dtShape(source, shape) is throwing `TypeError: ... is not a
  function`"** — `source` is a plain JS object, not a dt-object. Run
  it through `dtbox.init(plainData)` first.
- **"Priority is the wrong way around"** — the array order is
  `[fallback, preferred]`, not `[preferred, fallback]`. Last element
  wins. Move the preferred path to the END of the value array.
- **"A `fold!` key is producing `{ key: undefined }`"** — the source
  path resolves but the value at the leaf is `undefined` (not
  missing). dt-shape's `fold!` puts whatever the leaf is, including
  `undefined`, into the result. Skip the path with a `load!` filter
  or guard the source data.
- **"Adding `load!firstName` removed an existing `firstName` from
  the result"** — keys with the same suffix (after stripping `prefix!`)
  share the same output slot. The order in the shape decides who wins,
  not the prefix. Put the rule you want to win LAST in the shape
  object. See `references/pitfalls.md` for a worked example.
- **"A path that contains `/` is breaking the lookup"** — slash is
  the segment separator in dt-shape. You cannot match a source key
  that itself contains `/`. If the source uses a different separator,
  normalise first; if the source really is `{ 'a/b': 1 }`, use
  `dt-toolbox` directly instead of dt-shape.
- **"I'm getting an empty object when my shape value is `[]`"** — an
  empty array means "look in no source paths", so the key is dropped.
  Always list at least one path.
- **"Source has the data but my nested key `profile/name` produces
  nothing"** — the path is interpreted as "look under `profile` for
  `name`". If your source has `name` at the top level and you want
  the output to nest it under `profile`, the shape key should be
  `'profile/name'` AND the source path should be `'name'` (or
  `'profile/name'` if it's already nested in the source).


## Quick API map

| Need                                          | Call                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| Import                                        | `import dtShape from 'dt-shape'`                                     |
| Get the matching dt-toolbox                   | `const dtbox = dtShape.getDTtoolbox()`                               |
| Wrap a plain value as a dt-object             | `const dt = dtbox.init(value)`                                       |
| Apply a shape, get a dt-object back           | `const out = dtShape(dt, shape)`                                     |
| Convert the dt-object to plain JS             | `out.model(() => ({ as: 'std' }))` (or `as: 'keep'`, `as: 'object'`) |
| Single-key rename                             | `{ newKey: ['oldKey'] }`                                             |
| Rename with fallback priority                 | `{ newKey: ['a', 'b', 'c'] }` (last wins)                            |
| Nested output                                 | `'a/b/c': ['x/y/z']` (key and path use `/`)                          |
| Collect values into an array                  | `'list!key': ['a','b','c']`                                          |
| Collect values into an object                 | `'fold!key': ['a','b','c']` (keys = path tail or leaf keys)          |
| Inject a constant / function result           | `'load!key': [value, () => otherValue]` (last non-undefined wins)    |
| Apply the same shape to many sources          | Reuse the shape object across calls; it is plain data                |

For the full semantics of each prefix, priority edge cases, and how
shape keys interact with each other, see
`references/shape-syntax.md`. For how dt-shape integrates with
`dt-toolbox`, the `.model()` policies, and `.query()` access patterns,
see `references/dt-object-integration.md`. For the most common silent
failures, see `references/pitfalls.md`.


## Examples

### Example 1 — Same shape, two different sources

```js
import dtShape from 'dt-shape'
const dtbox = dtShape.getDTtoolbox()

const shape = {
  firstName       : [ 'firstName', 'profile/name' ],
  lastName        : [ 'lastName', 'sirname', 'familyName' ],
  'profile/age'  : [ 'age', 'profile/age' ]
}

const a = dtShape(dtbox.init({ firstName: 'Peter', sirname: 'Naydenov', age: 42 }),
                  shape).model(() => ({ as: 'std' }))
// a === { firstName: 'Peter', lastName: 'Naydenov', profile: { age: 42 } }

const b = dtShape(dtbox.init({ profile: { name: 'Peter', sirname: 'Naydenov' } }),
                  shape).model(() => ({ as: 'std' }))
// b === { firstName: 'Peter', lastName: 'Naydenov' }
// (profile/age is dropped because neither source path resolves)
```

This is the canonical use case: one shape, many heterogeneous inputs,
stable output contract.

### Example 2 — fold, list, load side by side

```js
import dtShape from 'dt-shape'
const dtbox = dtShape.getDTtoolbox()

const config = { env: 'production', region: 'eu-west-1' }

const shape = {
  // simple
  firstName : [ 'profile/name', 'name' ],
  // collect every value under 'profile/meta.*' into a sub-object
  'fold!meta'  : [ 'profile/meta', 'meta' ],
  // collect values from several sibling sources into a list
  'list!contacts' : [ 'email', 'phone', 'twitter' ],
  // inject a constant and a function result; last non-undefined wins
  'load!env'      : [ 'dev', config.env, () => process.env.NODE_ENV ]
}

const out = dtShape(
  dtbox.init({
    profile: { name: 'Peter', meta: { role: 'admin', tier: 'gold' } },
    email: 'peter@example.com', phone: '+359…'
  }),
  shape
).model(() => ({ as: 'std' }))

/*
  out === {
    firstName: 'Peter',
    meta: { role: 'admin', tier: 'gold' },
    contacts: [ 'peter@example.com', '+359…' ],
    env: 'production'
  }
*/
```
