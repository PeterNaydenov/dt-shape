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
| `prefix!`      | optional | One of `fold!`, `list!`, `load!`. Omit for default (first-non-null) mode. |
| `output-path`  | required | Either `key` (flat) or `parent/child/...` (nested output).   |
| Source array   | required | Always an array, even for a single source. Last element wins. |

The prefix sits on the SHAPE KEY; it does not modify the source paths
inside the array. `'fold!meta'` is parsed as
`prefix = 'fold'`, `output-path = 'meta'`.

The output-path uses `/` as the segment separator, both for the shape
key and for source paths. There is no escape syntax for `/` in keys
or paths. See "Edge cases" below.


## Default mode (no prefix)

The first non-null value in the source array wins, BUT dt-shape applies
last-wins semantics: each subsequent path that resolves OVERWRITES the
result. So in practice the LAST element that resolves is the winner.

```js
{ firstName: [ 'firstName', 'profile/name', 'name' ] }
```

- If `source.firstName` resolves → it's the result.
- If it doesn't, but `source.profile.name` resolves → that becomes the
  result.
- If `source.name` resolves (and the earlier ones don't), that's the
  result.
- If both `firstName` and `profile/name` resolve, `profile/name`
  (the later one) wins — even if `firstName` is "valid".

This is why priority is "last wins, but only if it resolves" — and
why `null`/`undefined`/missing paths are skipped silently while
non-null paths overwrite.

### What counts as "resolves"

The path resolves if the value at that location is anything other than
`null` or `undefined`. That includes `0`, `''`, `false`, `[]`, `{}`.
For most projects this is the right behaviour; if you need a stricter
"only if truthy" semantic, filter the source first or use a `load!`
function that returns `undefined` to skip.


## `list!` prefix — collect into an array

```js
{ 'list!contacts': [ 'email', 'phone', 'twitter' ] }
```

`list!` walks the source array and pushes every value that resolves
into a result array. Missing/null/undefined values are skipped. The
result is always an array, in the order of the source array. If no
source resolves, the entire key is dropped.

When the source path points at a complex value (an object or array),
the whole thing is pushed as a single element — `list!` does not
flatten.

```js
dtShape(dtbox.init({ phone: '+1…', meta: { tag: 'admin' } }),
        { 'list!xs': [ 'phone', 'meta', 'email' ] })
  .model(() => ({ as: 'std' }))
// { xs: [ '+1…', { tag: 'admin' } ] }
```


## `fold!` prefix — collect into an object

```js
{ 'fold!meta': [ 'profile/meta', 'meta' ] }
```

`fold!` walks the source array and, for every value that resolves,
MERGES it into the result object. The merge is **last-wins** at the
top level only — nested objects from earlier sources are NOT deep-
merged; the later source's value REPLACES the earlier source's value
at the same key.

```js
dtShape(dtbox.init({
  meta:      { a: 1, b: 2 },
  otherMeta: { b: 99, c: 3 }
}), { 'fold!all': [ 'meta', 'otherMeta' ] })
  .model(() => ({ as: 'std' }))
// { all: { a: 1, b: 99, c: 3 } }
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
{
  'load!version'   : [ '1.0.0' ],
  'load!timestamp' : [ () => Date.now() ],
  'load!appName'   : [ process.env.APP_NAME, 'fallback' ]
}
```

`load!` skips the dt-object entirely. The value array is evaluated
left-to-right:
- If the current element is a function, it is called with no
  arguments, and the return value replaces the element.
- The FIRST non-`undefined`, non-`null` value wins and is stored.
- Subsequent values that resolve do NOT overwrite — only the first
  resolver is used. (This differs from default mode where later
  resolvers overwrite.)

If every element resolves to `undefined` or `null`, the key is
dropped. (Compare to default mode, which would also drop in that
case.)

### Mixing `load!` with other modes on the same key

Don't. Two shape keys with the same output path (after stripping
their prefixes) share the same output slot. The last one in
declaration order wins, regardless of prefix. This is true even
when the prefixes are different.

```js
{ 'load!firstName':  [ 'Ivan' ], 'firstName': [ 'profile/name' ] }
// 'firstName' is the SAME output slot as 'load!firstName'.
// profile/name wins because it is declared later.
```

Pick one mode per output key. If you need a conditional override,
use a `load!` function that reads the source dt-object and decides
what to return.


## Source paths — the `/` segment syntax

```js
{ 'profile/name': [ 'profile/name' ] }
```

The path `profile/name` means "look under `source.profile` for
`source.profile.name`". You can chain any number of segments.

There is no array index syntax. If you need a specific element of
an array, use `dt-toolbox` directly and pass the result back into
dt-shape as a pre-extracted source.

There is no escaping. If a key in your source really contains `/`,
normalise it before passing to dt-shape.


## Output paths — `/` builds nested output

```js
{
  'profile/name'    : [ 'name' ],          // result.profile.name
  'a/b/c'           : [ 'x' ]              // result.a.b.c
}
```

Output paths and source paths use the same syntax; they are
independent strings. You can rename AND nest in one rule.

If two shape keys share a parent output path, the parent's children
are merged. The merge is shallow at each level (last-wins at the
direct child of the parent).

```js
{
  'profile/name'    : [ 'name' ],
  'profile/age'     : [ 'age' ]
}
// result === { profile: { name: '…', age: 42 } }
```

If two shape keys target the same leaf output key, the later
declaration wins (same as a plain object literal).

If a shape key targets a path whose parent is itself another shape
key, behaviour depends on whether the parent's value is a primitive
or an object — see "When a leaf becomes a branch" in
`pitfalls.md`.


## Empty arrays, missing keys, and what "dropped" means

```js
{ 'load!maybe': [ null, undefined, () => undefined ] }
```

- Empty value array `[]` → key is dropped (nothing to evaluate).
- All values are `null` / `undefined` → key is dropped (no value
  found). This applies to all four modes.
- All values are missing paths in default / `list!` / `fold!` mode
  → key is dropped.

There is no way to force an empty value into the output. If you
need a guaranteed-present key (e.g., a "loading" placeholder), use
`load!` with a non-nullable default at the END of the value array.

```js
{ 'load!status': [ 'unknown' ] }   // always present
```


## Array shape (top-level array)

If the shape itself is an array, dt-shape initialises the result as
an empty array `[]` instead of `{}`. The rules above still apply
per key. This is useful when you want a list-of-objects output:

```js
// shape is an array — uncommon, but supported
dtShape(dtbox.init({ a: 1, b: 2 }), [ /* shape keys */ ])
```

In practice, almost every real-world shape is an object. The array
form is a niche escape hatch.


## Quick-decision table

| You want to…                                   | Shape pattern                                             |
| ---------------------------------------------- | --------------------------------------------------------- |
| Rename a single field                          | `{ newKey: [ 'oldKey' ] }`                                |
| Rename with a fallback                         | `{ newKey: [ 'a', 'b' ] }` (b wins if both resolve)       |
| Output a nested object                         | `{ 'a/b': [ 'x' ] }`                                      |
| Collect values from several sources into a list | `{ 'list!xs': [ 'a', 'b', 'c' ] }`                       |
| Collect sources into one object                | `{ 'fold!all': [ 'a', 'b' ] }`                            |
| Always provide a default                       | `{ 'load!k': [ 'fallback' ] }`                            |
| Compute a value at call time                   | `{ 'load!k': [ () => compute() ] }`                       |
| Mix sources with a constant                    | `{ 'load!k': [ sourceValue, 'literal' ] }` (first non-null wins) |
