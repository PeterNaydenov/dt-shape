# Migration Guides

## From v.3.x.x  - v.4.x.x

### Why a major version?
There are three reasons:

1. **dt-shape works only with real values.** `null`, `undefined`, empty objects and empty arrays are not values anymore. They never overwrite a found value, they are not collected by `list!` and `fold!`, and they are removed from copied objects. Arrays keep their positions. In v.3 they could replace a real value and remove the key from the result, or appear as `null` in lists. See "Only real values" below.
2. **Objects and arrays are copied completely.** In v.3 only the first level of a copied object was kept: nested objects and arrays were lost, or became `null` inside arrays. Shape keys that write to the same output path are now merged in a predictable way. See "Copy of nested data" and "Output paths" below.
3. **`dt-toolbox` v.8.** dt-shape returns its own copy of `dt-toolbox` with `dtShape.getDTtoolbox()`, and the documentation recommends using it to create the source data. Version 4 updates `dt-toolbox` from v.7 to v.8. Version 8 has breaking changes, so code that uses `getDTtoolbox()` directly may need changes. See the sections below.

Version 4 also adds TypeScript type declarations. They don't change runtime behavior, but TypeScript projects will see new type errors if a shape has wrong values.


### Only real values
`null`, `undefined`, empty objects `{}` and empty arrays `[]` are ignored everywhere. `0`, `''` and `false` are real values.

**Default mode** - the last source with a real value wins. A source without a real value doesn't overwrite:

```js
const dt = dtbox.init ({ a: 1, b: undefined, c: {} })

dtShape ( dt, { x: [ 'a', 'b' ] })
// was:    {}
// become: { x: 1 }

dtShape ( dt, { x: [ 'a', 'c' ] })
// was:    {}
// become: { x: 1 }
```

A source with value `null` works the same way. In v.3 it threw an error.

**`list!` and `fold!`** - values without a real value are not collected:

```js
const dt = dtbox.init ({ a: 1, b: null, obj: {} })

dtShape ( dt, { 'list!l': [ 'a', 'b', 'obj' ] })
// was:    { l: [ 1, null, null ] }
// become: { l: [ 1 ] }

dtShape ( dt, { 'fold!f': [ 'a', 'b', 'obj' ] })
// was:    { f: { a: 1, b: null, null: null } }
// become: { f: { a: 1 } }
```

**Copied objects** - `null` and `undefined` properties are removed. **Copied arrays keep their positions**, see "Arrays" below:

```js
const dt = dtbox.init ({ profile: { age: 42, phone: null }, scores: [ 1, null, 3 ] })

dtShape ( dt, { p: [ 'profile' ], s: [ 'scores' ] })
// was:    { p: { age: 42, phone: null }, s: [ 1, null, 3 ] }
// become: { p: { age: 42 }, s: [ 1, null, 3 ] }
```

**`load!`** - the last real value wins. Functions that return `null` or `undefined` are skipped:

```js
dtShape ( dt, { 'load!x': [ 'default', () => process.env.VALUE ] })
// VALUE is not set
// was:    {}
// become: { x: 'default' }
```

If no source has a real value, the key is not in the result. That is the same as in v.3.


### Arrays
Array positions are data. There are three tools for arrays:

| You need | Use | Source `[ 1, null, 3 ]` gives |
| --- | --- | --- |
| Positions kept (coordinates, table rows) | plain key `coords: [ 'coords' ]` | `[ 1, null, 3 ]` |
| Positions kept, empty places filled | defaults `{ coords: [ 0, 0, 0, 0 ] }` or `{ 'coords/1': 0 }` | `[ 1, 0, 3, 0 ]` or `[ 1, 0, 3 ]` |
| Dynamic list without empty places | `'list!coords': [ 'coords' ]` | `[ 1, 3 ]` |

- A copied array keeps its length. A position without a real value is `null`. This is the only place where `null` appears in a result;
- An array with only `null` values (e.g. `[ null, null ]`) is not a value, like `[]`;
- An array default is a template: it fills the empty positions and the missing end of the array. A longer source array is not cut;
- A default for a specific position (`'coords/2': 0`) wins over a whole-array default (`coords: [ 0, 0, 0, 0 ]`), in any order.

**A number in an output path creates an array.** This is a change from v.3, where it created an object:

```js
const dt = dtbox.init ({ lat: 42, lng: 23 })

dtShape ( dt, { 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] })
// was:    { coords: { 0: 42, 1: 23 } }
// become: { coords: [ 42, 23 ] }
```

Together with defaults, it builds a fixed-size array from separate fields:

```js
dtShape ( dtbox.init ({ lng: 23 }), { 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] }, { coords: [ 0, 0 ] })
// -> { coords: [ 0, 23 ] }
```

This applies to containers that dt-shape creates. If the source has an object with number-like keys (e.g. `{ codes: { 404: 'Not found' } }`), it stays an object.


### Source paths
A source path with a parent reads exactly that place. If the parent doesn't exist, the value is not found. In v.3 dt-shape then searched the last name in the whole source, and could find an unrelated value:

```js
const dt = dtbox.init ({ name: 'Peter', profile: { email: 'p@x.com' }, coords: [ 42, 23 ] })

dtShape ( dt, { email: [ 'contact/email' ] })   // There is no 'contact' in the source
// was:    { email: 'p@x.com' }   found profile/email
// become: {}
```

Array positions can be read from the source:

```js
dtShape ( dt, { lat: [ 'coords/0' ], lng: [ 'coords/1' ] })
// was:    {}
// become: { lat: 42, lng: 23 }
```

A key without a path (e.g. `'name'`) searches the whole source, as in v.3. The last match wins.


### Clear errors for wrong arguments
Wrong arguments throw an error with a clear message. In v.3 they threw a `TypeError` from inside the library, or were silently accepted:

| Argument | v.3.x.x | v.4.x.x |
| --- | --- | --- |
| Source is not a dt-object | `t.query is not a function` | `The source must be a dt-object. Create it with dtShape.getDTtoolbox().init ( data ).` |
| Shape value is not a list (`{ v: 'name' }`) | `l.forEach is not a function` | `Shape key 'v' must have a list of sources` |
| Unknown prefix (`'lsit!names'`) | silently treated as a key without prefix | `Unknown prefix 'lsit!' in shape key 'lsit!names'` |
| Source path is not a string (`{ v: [ 1 ] }`) | `e.split is not a function` | `Shape key 'v' - source paths must be strings. Use 'load!v' for values and functions.` |
| Defaults are not an object | - | `Defaults must be an object` |


### Copy of nested data
When a source path points to an object or array, the result has the full copy, with all nested objects and arrays:

```js
const dt = dtbox.init ({ profile: { name: 'Peter', address: { city: 'Sofia' } }, items: [ 'a', { id: 1 }, [ 2, 3 ] ] })

dtShape ( dt, { user: [ 'profile' ], items: [ 'items' ] })
// was:    { user: { name: 'Peter' }, items: [ 'a' ] }
// become: { user: { name: 'Peter', address: { city: 'Sofia' } }, items: [ 'a', { id: 1 }, [ 2, 3 ] ] }
```

`list!` and `fold!` collect the values of a copied object or array. Nested objects and arrays are now among the values:

```js
dtShape ( dt, { 'list!l': [ 'profile' ] })
// was:    { l: [ 'Peter' ] }
// become: { l: [ 'Peter', { city: 'Sofia' } ] }
```


### Output paths
Shape keys are applied in order. When a key writes an object to an output path that already has an object, the two objects are merged. Any other value replaces the existing value: the later shape key wins.

```js
const dt = dtbox.init ({ name: 'Peter', age: 42, meta: { a: 1 } })

dtShape ( dt, { 'profile/name': [ 'name' ], 'profile': [ 'meta' ] })
// was:    { profile: { name: 'Peter' } }
// become: { profile: { name: 'Peter', a: 1 } }

dtShape ( dt, { 'v/a': [ 'name' ], 'v': [ 'age' ] })
// was:    { v: { a: 'Peter' } }
// become: { v: 42 }
```

Output paths with the same name in different places don't mix anymore:

```js
dtShape ( dt, { 'x/name': [ 'name' ], 'y/x/age': [ 'age' ] })
// was:    { x: { name: 'Peter', age: 42 }, y: {} }
// become: { x: { name: 'Peter' }, y: { x: { age: 42 } } }
```


### Data that threw an error in v.3 works now

| Source data                                           | v.3.x.x                                  | v.4.x.x |
| ----------------------------------------------------- | ---------------------------------------- | ------- |
| Property with value `null`                            | `TypeError: Cannot convert undefined or null to object` | Works. `null` is ignored |
| `load!` list with `null` member                       | `TypeError`                              | Works. `null` is ignored |
| `Date` or `RegExp` values                             | `Circular reference detected in data`    | Works. They are values, like strings and numbers |
| Same object used twice (`{ a: shared, b: shared }`)   | `Circular reference detected in data`    | Works. Only real cycles throw |
| Keys with RegExp special characters (`'a(b'`, `'k$'`) | `Invalid regular expression`             | Works |


### Source dt-object from dt-toolbox 8.1 or newer
dt-shape builds the result with `store.set` by path, a feature of dt-toolbox 8.1. A source dt-object created by an older dt-toolbox throws an error:

```
dt-shape: The source dt-object needs dt-toolbox 8.1 or newer. Create it with dtShape.getDTtoolbox().init ( data ).
```

Create the source data with the dt-toolbox that comes with dt-shape:

```js
const dt = dtShape.getDTtoolbox ().init ( data )
```


### `getDTtoolbox().init` throws on an unsupported model name
Before, `init` logged an error and returned `null`. Omitting `model` still defaults to `'std'`.

```js
const dtbox = dtShape.getDTtoolbox ()

// was:
const dt = dtbox.init ( data, { model: userChoice } )
if ( dt === null ) {
        // handle the unsupported model
    }

// become:
let dt;
try {
        dt = dtbox.init ( data, { model: userChoice } )
    }
catch ( err ) {
        // handle the unsupported model. `err.message` lists the supported models
    }
```


### `dt.copy()` key order
dt-objects don't keep a second copy of the original data anymore. `dt.copy()` rebuilds the data, so object keys come in this order: primitive values first, then nested objects and arrays. Values are the same. This matters only if your code depends on key order, e.g. compares `JSON.stringify` results.

```js
const dt = dtShape.getDTtoolbox ().init ({ a: { x: 1 }, b: 2 })
dt.copy ()
// was:    { a: { x: 1 }, b: 2 }
// become: { b: 2, a: { x: 1 } }
```

The result of `dtShape ( dt, shape ).model ( () => ({ as: 'std' }) )` had this key order in v.3 too.


### `getDTtoolbox().getWalk()` returns walk v.7
In walk callbacks, `IGNORE` is now a function:

```js
const walk = dtShape.getDTtoolbox ().getWalk ();

// was:
walk ({ data, keyCallback: ({ key, value, IGNORE }) => key === 'password' ? IGNORE : value })

// become:
walk ({ data, keyCallback: ({ key, value, IGNORE }) => key === 'password' ? IGNORE () : value })
```

If you don't use `getWalk`, no changes are needed.

All `dt-toolbox` changes are described in the [dt-toolbox migration guide](https://github.com/PeterNaydenov/dt-toolbox/blob/master/Migration.guide.md).


### TypeScript
Type declarations come with the package. No `@types` package is needed.

- If your project has its own `declare module 'dt-shape'` declaration, remove it.
- Shapes are type-checked. Source paths must be strings. `load!` keys accept any values and functions:

```ts
import dtShape from 'dt-shape'

dtShape ( dt, { name: [ 'profile/name' ] })            // OK
dtShape ( dt, { 'load!version': [ 4, () => 'v4' ] })   // OK
dtShape ( dt, { name: [ 1 ] })                         // Type error: source paths must be strings
dtShape ( dt, { name: 'profile/name' })                // Type error: shape values must be lists
```

- Shapes built at runtime can use the `Shape` type:

```ts
import dtShape, { type Shape } from 'dt-shape'

const shape: Shape = buildShape ()
dtShape ( dt, shape )
```

CommonJS projects use the same types from the namespace: `dtShape.Shape`, `dtShape.Defaults`, `dtShape.DTObject`, `dtShape.DtBox`.


### New: default values
`dtShape` has an optional third argument - default values by output path. Use it to keep all keys in the result:

```js
dtShape ( dt, { name: [ 'firstName' ], 'list!tags': [ 'tags' ] }, { name: 'Unknown', tags: [] })
```

If you used a `load!` key before the real key to get a default value, you can replace it:

```js
// was:
dtShape ( dt, { 'load!name': [ 'Unknown' ], name: [ 'firstName' ] })

// become:
dtShape ( dt, { name: [ 'firstName' ] }, { name: 'Unknown' })
```

The `load!` way still works, but it can't give `null`, `[]` or `{}` as default values.

Defaults also work for arrays: a whole array as a template (`{ coords: [ 0, 0, 0, 0 ] }`) or a specific position (`{ 'coords/2': 0 }`). See "Arrays" above.
