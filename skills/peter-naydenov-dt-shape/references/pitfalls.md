# Pitfalls — silent failure modes and surprising behaviours

> Each section names the trap, shows a minimal repro, and gives the
> safe pattern. Read this before shipping code that uses dt-shape
> in production.

## 1. Forgetting `.model(...)` returns a dt-object

```js
const source = dtbox.init({ profile: { name: 'Peter' } })
const shape  = { firstName: [ 'profile/name' ] }
const result = dtShape(source, shape)   // ← this is a dt-object, not a plain object
String(result)
// → '[object Object]'
JSON.stringify(result)
// → '{}'
```

**Why this is bad**: the dt-object has no `.toJSON()`, so
`JSON.stringify` gives `'{}'` — the data is lost without an error.
You almost always want the plain JS value.

**Safe pattern**:

```js
const source = dtbox.init({ profile: { name: 'Peter' } })
const shape  = { firstName: [ 'profile/name' ] }
const result = dtShape(source, shape).model(() => ({ as: 'std' }))
// result → { firstName: 'Peter' }
// ← plain JS object
```


## 2. Forgetting `dtbox.init(...)` makes `dtShape` throw

```js
let message
try { dtShape({ name: 'Peter' }, { firstName: ['name'] }) } catch (e) { message = e.message }
// message → 'dt-shape: The source must be a dt-object. Create it with dtShape.getDTtoolbox().init ( data ).'
```

**Why this is bad**: the source is a plain JS object, but dt-shape
reads the source with `source.query(...)`. A plain object does not
have a `.query` method, so dt-shape checks the source and throws.

**Safe pattern**:

```js
const dtbox = dtShape.getDTtoolbox()
dtShape(dtbox.init({ name: 'Peter' }), { firstName: ['name'] }).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
```


## 3. Priority is reversed: LAST element wins, not first

```js
const source = dtbox.init({ firstName: 'Peter', profile: { name: 'Pit' } })
dtShape(source, { firstName: [ 'profile/name', 'firstName' ] }).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
// BOTH paths resolve: profile/name (the EARLIER one) is overwritten
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
const shape = {
  // preference: 'profile/name'. Fallback: 'firstName' (only used
  // if profile/name is missing).
  firstName: [ 'firstName', 'profile/name' ]
}
dtShape(dtbox.init({ firstName: 'Peter', profile: { name: 'Pit' } }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Pit' }
dtShape(dtbox.init({ firstName: 'Peter' }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
```


## 4. `load!` and a plain key on the same output slot

```js
const shape = {
  'load!firstName' : [ 'Peter' ],
  firstName        : [ 'profile/name' ]
}
dtShape(dtbox.init({ profile: { name: 'Ivan' } }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Ivan' }
dtShape(dtbox.init({ name: 'Ivan' }), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Peter' }
```

**What happens**: the second declaration (`firstName`) wins, because
dt-shape stores both rules under the same output key
(`'firstName'`) and applies shape keys in order. The `load!` result
is overwritten whenever `profile/name` has a real value; it stays
only when `profile/name` finds nothing.

**Why this is bad**: it looks like the prefixes give you independent
output slots. They do not — the prefix is consumed during parsing;
the output slot is whatever comes after `prefix!`.

**Safe pattern**: pick one mode per output key. If you need a
conditional override, use a `load!` function that reads the plain
source data (a dt-object has no `.profile` property) and decides:

```js
const data  = { profile: { name: 'Ivan' } }
const shape = {
  'load!firstName': [
    () => data.profile?.name ?? 'Anonymous'
  ]
}
dtShape(dtbox.init(data), shape).model(() => ({ as: 'std' }))
// → { firstName: 'Ivan' }
```


## 5. Missing paths are silently dropped

```js
const source = dtbox.init({ a: 1 })
const shape  = { a: ['a'], b: ['b'] }
const out    = dtShape(source, shape).model(() => ({ as: 'std' }))
// out → { a: 1 }
// 'b' is absent — no null, no undefined, no warning.
```

**Why this is bad**: it can mask schema mismatches. You ship a
contract that promises a `b` field; the consumer sees no `b`; you
debug for an hour.

**Safe patterns (pick one)**:

1. Pass `defaults` (third argument) for fields the consumer
   requires. Defaults are used only when the shape finds no real
   value, and can be `null`, `[]` or `{}`:

   ```js
   const source = dtbox.init({ a: 1 })
   dtShape(source, { a: ['a'], b: ['b'] }, { b: 'default-value' }).model(() => ({ as: 'std' }))
   // → { a: 1, b: 'default-value' }
   ```

   Don't use `{ b: ['b'], 'load!b': ['default-value'] }` — the later
   `load!b` always wins and replaces a real `b`.

2. Validate the result after the call:

   ```js
   const source = dtbox.init({ a: 1, b: 2 })
   const shape  = { a: ['a'], b: ['b'] }
   const out = dtShape(source, shape).model(() => ({ as: 'std' }))
   if (!('b' in out)) throw new Error('shape contract violated: missing b')
   ```

3. Use a typed schema (Zod, etc.) to validate the final object.


## 6. Shape keys that write to the same output path

```js
const source = dtbox.init({ name: 'Peter', meta: { age: 42 } })
const shape  = {
  'profile/name': [ 'name' ],
  'profile'     : [ 'meta' ]    // ← merged with profile/name
}
dtShape(source, shape).model(() => ({ as: 'std' }))
// → { profile: { name: 'Peter', age: 42 } }
```

**What happens**: shape keys are applied in order. When a key writes
an object to a path that already holds an object, the two are
deep-merged. Any other value REPLACES what is there — the later
shape key wins:

```js
const source = dtbox.init({ name: 'Peter', age: 42 })
const shape  = {
  'v/a' : [ 'name' ],
  'v'   : [ 'age' ]      // ← replaces v
}
dtShape(source, shape).model(() => ({ as: 'std' }))
// → { v: 42 }
```

**Safe pattern**: keep output paths disjoint when you can. When a
key must contribute to an existing object, make sure both values are
objects, so they merge instead of replacing each other:

```js
const source = dtbox.init({ name: 'Peter', age: 42 })
const shape  = {
  'profile/name': [ 'name' ],
  'profile/age' : [ 'age' ]
}
dtShape(source, shape).model(() => ({ as: 'std' }))
// → { profile: { name: 'Peter', age: 42 } }
```


## 7. `list!` collects values one level deep

```js
const source = dtbox.init({ tags: ['a','b','c'], labels: ['x'], meta: { tag: 'admin' } })
dtShape(source, { 'list!tags': [ 'tags', 'labels', 'meta' ] }).model(() => ({ as: 'std' }))
// → { tags: [ 'a', 'b', 'c', 'x', 'admin' ] }
```

**What happens**: when a source path points to an array or object,
`list!` pushes its VALUES (array items / object property values),
not the container itself. Nested objects and arrays inside it are
pushed as whole values:

```js
const out = dtShape(dtbox.init({ list: [ 1, [ 2, 3 ], { id: 4 } ] }), { 'list!xs': [ 'list' ] })
  .model(() => ({ as: 'std' }))
// out → { xs: [ 1, [ 2, 3 ], { id: 4 } ] }
```

**Safe pattern**: if you want each container as ONE element of the
list, use a `load!` function that reads the plain data:

```js
const data  = { tags: [ 'a', 'b', 'c' ], labels: [ 'x' ] }
const shape = {
  'load!groups': [ () => [ data.tags, data.labels ] ]
}
dtShape(dtbox.init(data), shape).model(() => ({ as: 'std' }))
// → { groups: [ [ 'a', 'b', 'c' ], [ 'x' ] ] }
```


## 8. `fold!` merges shallowly — last source wins per top-level key

```js
const source = dtbox.init({
  metaA: { x: 1, y: { a: 1 } },
  metaB: { y: { b: 2 }, z: 3 }
})
dtShape(source, { 'fold!meta': [ 'metaA', 'metaB' ] }).model(() => ({ as: 'std' }))
// → { meta: { x: 1, y: { b: 2 }, z: 3 } }
// 'y' came from metaB because it was listed later, even though
// metaA had it first. The two 'y' objects are NOT merged.
```

**Why this is bad**: deep-merge semantics are what people expect
for "collect sources into one object". dt-shape gives you
shallow-overlay semantics.

**Safe pattern**: list the most-specific source LAST. Or implement
deep-merge yourself by passing each value through a custom function
and folding the result:

```js
// any deep-merge helper works here (e.g. lodash.merge)
const deepMerge = (a, b) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const both = v && typeof v === 'object' && out[k] && typeof out[k] === 'object'
    out[k] = both ? deepMerge(out[k], v) : v
  }
  return out
}
const data  = { metaA: { x: 1, y: { a: 1 } }, metaB: { y: { b: 2 }, z: 3 } }
const shape = {
  'load!meta': [
    () => deepMerge(data.metaA ?? {}, data.metaB ?? {})
  ]
}
dtShape(dtbox.init(data), shape).model(() => ({ as: 'std' }))
// → { meta: { x: 1, y: { a: 1, b: 2 }, z: 3 } }
```


## 9. Slash in source key names is not supported

```js
const source = dtbox.init({ 'content/type': 'article' })
dtShape(source, { contentType: ['content/type'] }).model(() => ({ as: 'std' }))
// → {}
// 'content/type' is interpreted as a 2-segment path:
// source.content does not exist, so the key is silently dropped
```

**Why this is bad**: there is no escape syntax. The slash is the
segment separator, full stop.

**Safe patterns**:

1. Normalise the source before passing to dt-shape:

   ```js
   const raw = { 'content/type': 'article', id: 7 }
   const normalised = Object.fromEntries(
     Object.entries(raw).map(([k, v]) => [k.replace(/\//g, '.'), v])
   )
   dtShape(dtbox.init(normalised), { contentType: [ 'content.type' ] }).model(() => ({ as: 'std' }))
   // → { contentType: 'article' }
   ```

2. Read the value from the plain data yourself and inject it with
   `load!`:

   ```js
   const raw   = { 'content/type': 'article', id: 7 }
   const shape = { id: [ 'id' ], 'load!contentType': [ () => raw['content/type'] ] }
   dtShape(dtbox.init(raw), shape).model(() => ({ as: 'std' }))
   // → { id: 7, contentType: 'article' }
   ```


## 10. Empty value arrays are silently ignored

```js
dtShape(dtbox.init({ a: 1 }), { a: [ 'a' ], key: [] }).model(() => ({ as: 'std' }))
// → { a: 1 }
// 'key' is dropped. No warning.
```

**Why this is bad**: a typo or a programmatic shape-builder that
produces an empty array for one rule will silently lose that field.

**Safe pattern**: when building shapes programmatically, assert
that every value array has at least one element. Or, if a key is
optional, use `load!` with an explicit `undefined` fallback so
the absence is intentional and visible:

```js
const shape = { a: [ 'a' ], 'load!key': [ undefined ] }   // explicit: "key may be missing"
dtShape(dtbox.init({ a: 1 }), shape).model(() => ({ as: 'std' }))
// → { a: 1 }
```


## 11. Functions in `load!` are called every shape application

```js
const shape = {
  'load!timestamp': [ () => Date.now() ]
}
const out = dtShape(dtbox.init({ id: 1 }), shape).model(() => ({ as: 'std' }))
typeof out.timestamp
// → 'number'
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
getUserView({ name: 'Peter', sirname: 'Naydenov' })
// → { firstName: 'Peter', lastName: 'Naydenov' }
```

**Why this matters**: the shape is a record of what the consumer
expects from the source. If it's scattered across call sites, a
schema change becomes a grep-and-pray. Hoist it, freeze it, and
export it. Tests should import the same shape.
