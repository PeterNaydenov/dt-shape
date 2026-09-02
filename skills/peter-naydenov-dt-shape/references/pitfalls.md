# Pitfalls — silent failure modes and surprising behaviours

> Each section names the trap, shows a minimal repro, and gives the
> safe pattern. Read this before shipping code that uses dt-shape
> in production.

## 1. Forgetting `.model(...)` returns a dt-object

```js
const result = dtShape(source, shape)
console.log(result)
// [object Object]   ← this is a dt-object, not a plain object
JSON.stringify(result)   // works, but is not what you want — see below
```

**Why this is bad**: the dt-object's `.toJSON()` exists but the
serialised form is the dt-toolbox internal shape, not the result
you wanted. You almost always want the plain JS value.

**Safe pattern**:

```js
const result = dtShape(source, shape).model(() => ({ as: 'std' }))
console.log(result)
// { firstName: 'Peter', … }   ← plain JS object
```


## 2. Forgetting `dtbox.init(...)` makes `dtShape` throw

```js
dtShape({ name: 'Peter' }, { firstName: ['name'] })
// TypeError: dt.query is not a function
```

**Why this is bad**: the source is a plain JS object, but dt-shape
calls `source.query(...)` on it. A plain object does not have a
`.query` method.

**Safe pattern**:

```js
const dtbox = dtShape.getDTtoolbox()
dtShape(dtbox.init({ name: 'Peter' }), { firstName: ['name'] })
```


## 3. Priority is reversed: LAST element wins, not first

```js
{ firstName: [ 'profile/name', 'firstName' ] }
// If BOTH paths resolve, profile/name (the EARLIER one) is overwritten
// by firstName (the LATER one). This is the opposite of "first
// non-null wins".
```

**Why this trips people up**: most mapping languages (lodash's
`_.get` with a list, `??`-chaining, etc.) treat the array as
"fallback chain, first one wins". dt-shape treats the array as
"candidate list, last one wins". The shape key has the same
left-to-right reading order as the array, but the resolution order
is right-to-left.

**Safe pattern**: write the shape so the preferred path is at the
END of the array, and put fallbacks BEFORE it. Comment it:

```js
{
  // preference: 'profile/name'. Fallback: 'firstName' (only used
  // if profile/name is missing).
  firstName: [ 'firstName', 'profile/name' ]
}
```


## 4. `load!` and a plain key on the same output slot

```js
{
  'load!firstName' : [ 'Peter' ],
  firstName        : [ 'profile/name' ]
}
```

**What happens**: the second declaration (`firstName`) wins, because
dt-shape stores both rules under the same output key
(`'firstName'`). The `load!` result is overwritten — or, depending
on the internal cache order, you get a flicker where the first
visible result is the loaded one, then it gets replaced.

**Why this is bad**: it looks like the prefixes give you independent
output slots. They do not — the prefix is consumed during parsing;
the output slot is whatever comes after `prefix!`.

**Safe pattern**: pick one mode per output key. If you need a
conditional override, use a `load!` function that reads the source
and decides:

```js
{
  'load!firstName': [
    () => source.profile?.name ?? 'Anonymous'
  ]
}
```


## 5. Missing paths are silently dropped

```js
const source = dtbox.init({ a: 1 })
const shape  = { a: ['a'], b: ['b'] }
const out    = dtShape(source, shape).model(() => ({ as: 'std' }))
// out === { a: 1 }
// 'b' is absent — no null, no undefined, no warning.
```

**Why this is bad**: it can mask schema mismatches. You ship a
contract that promises a `b` field; the consumer sees no `b`; you
debug for an hour.

**Safe patterns (pick one)**:

1. Always provide a `load!` fallback for fields the consumer
   requires:

   ```js
   { b: ['b'], 'load!b': ['default-value'] }
   // last declaration wins, so 'load!b' guarantees 'b' is present
   ```

2. Validate the result after the call:

   ```js
   const out = dtShape(source, shape).model(() => ({ as: 'std' }))
   if (!('b' in out)) throw new Error('shape contract violated: missing b')
   ```

3. Use a typed schema (Zod, etc.) to validate the final object.


## 6. Nested output paths do not deep-merge with sibling rules

```js
{
  'profile/name': [ 'name' ],
  'profile'     : [ 'meta' ]    // ← this REPLACES profile
}
```

**What happens**: `'profile'` as an output path says "store a value
under the key `profile`". When the second rule tries to store its
result there, the dt-toolbox internal storage layer replaces
`profile` (with the new value), losing the `name` child.

**Safe pattern**: if you need a flat sibling to be merged INTO a
nested output, use `fold!` to collect the contributions explicitly:

```js
{
  'profile/name': [ 'name' ],
  'fold!profile': [ 'meta' ]
  // result === { profile: { name: '…', …metaChildren } }
}
```

Or, more commonly, just keep the children disjoint:

```js
{
  'profile/name': [ 'name' ],
  'profile/age' : [ 'age' ]
}
```


## 7. `list!` does not flatten — it pushes the whole value

```js
{
  'list!tags': [ 'tags', 'labels' ]
}
// If source.tags is ['a','b','c'], result.list.tags is ['a','b','c'].
// It is NOT flattened into the outer list.
```

**What you probably wanted**:

```js
const source = dtbox.init({ tags: ['a','b','c'], labels: ['x'] })
dtShape(source, { 'list!tags': [ 'tags', 'labels' ] })
  .model(() => ({ as: 'std' }))
// { tags: [ ['a','b','c'], ['x'] ] }
```

If you want a flat list, flatten the source first, or pre-process
with `dt-toolbox` directly.

**Safe pattern**: pick the level of nesting intentionally. If a
source value is itself a list and you want its elements in the
output list, build a `load!` that flattens:

```js
{
  'list!tags': [
    () => [...(source.tags ?? []), ...(source.labels ?? [])]
  ]
}
```


## 8. `fold!` merges shallowly — last source wins per top-level key

```js
{
  'fold!meta': [ 'metaA', 'metaB' ]
}
// If source.metaA === { x: 1, y: 2 } and source.metaB === { y: 99, z: 3 },
// result.meta === { x: 1, y: 99, z: 3 }.
// 'y' came from metaB because it was listed later, even though
// metaA had it first.
```

**Why this is bad**: deep-merge semantics are what people expect
for "collect sources into one object". dt-shape gives you
shallow-overlay semantics.

**Safe pattern**: list the most-specific source LAST. Or implement
deep-merge yourself by passing each value through a custom function
and folding the result:

```js
{
  'load!meta': [
    () => deepMerge(source.metaA ?? {}, source.metaB ?? {})
  ]
}
```


## 9. Slash in source key names is not supported

```js
const source = dtbox.init({ 'content/type': 'article' })
dtShape(source, { contentType: ['content/type'] })
// 'content/type' is interpreted as a 2-segment path:
//   source.content → undefined (not an object)
// → silently dropped
```

**Why this is bad**: there is no escape syntax. The slash is the
segment separator, full stop.

**Safe patterns**:

1. Normalise the source before passing to dt-shape:

   ```js
   const normalised = Object.fromEntries(
     Object.entries(raw).map(([k, v]) => [k.replace(/\//g, '.'), v])
   )
   dtShape(dtbox.init(normalised), shape)
   ```

2. Use `dt-toolbox` directly for the lookup, then pass the result
   into dt-shape as a pre-extracted value:

   ```js
   const raw = dtbox.init(source)
   // dt-toolbox supports dot-notation; if you pre-resolve, dt-shape
   // only sees a flat object.
   ```


## 10. Empty value arrays are silently ignored

```js
{ key: [] }
// → key is dropped. No warning.
```

**Why this is bad**: a typo or a programmatic shape-builder that
produces an empty array for one rule will silently lose that field.

**Safe pattern**: when building shapes programmatically, assert
that every value array has at least one element. Or, if a key is
optional, use `load!` with an explicit `undefined` fallback so
the absence is intentional and visible:

```js
{ 'load!key': [ undefined ] }   // explicit: "key may be missing"
```


## 11. Functions in `load!` are called every shape application

```js
{
  'load!timestamp': [ () => Date.now() ]
}
```

Each call to `dtShape(source, shape)` will RE-EVALUATE this function
and produce a new timestamp. This is usually what you want, but if
you cache the shape, the function reference is the same — the
function body is what runs. If the function depends on
`process.env`, current time, or a request-specific value, that's
fine. If the function depends on a captured value from when the
shape was built, you have a stale-closure bug. Closures created
during module load are the most common cause.

**Safe pattern**: keep `load!` functions pure and self-contained.
Read external state inside the function, not in the surrounding
scope.


## 12. The shape is a contract — keep it shared

```js
// BAD: rebuilt per request
function getUserView(user) {
  const shape = { firstName: ['name'], lastName: ['sirname'] }
  return dtShape(dtbox.init(user), shape).model(() => ({ as: 'std' }))
}

// GOOD: defined once, reused
const userViewShape = Object.freeze({
  firstName: ['name'],
  lastName : ['sirname']
})
function getUserView(user) {
  return dtShape(dtbox.init(user), userViewShape).model(() => ({ as: 'std' }))
}
```

**Why this matters**: the shape is a record of what the consumer
expects from the source. If it's scattered across call sites, a
schema change becomes a grep-and-pray. Hoist it, freeze it, and
export it. Tests should import the same shape.
