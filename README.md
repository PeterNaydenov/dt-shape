# DT Shape v.3.x.x

![version](https://img.shields.io/github/package-json/v/peterNaydenov/dt-shape)
![license](https://img.shields.io/github/license/peterNaydenov/dt-shape)

Build data structures by using data-shapes. The data-shape should looks like that:

```js
import dtShape from 'dt-shape'

let shape  = {
                'name' : [ 'firstName' , 'name' ] // -> list of possible sources
/*                ^            ^            ^
                  |            |            +---> top priority is always in the end
                  |            +---> search for values in these keys
                  |
      Create property with this name
                     
*/
                 }
     // Important! Data should be provided as dt-object. If is not - convert it first.
     // dt-shape contains compatible version of dt-box.
     const dtbox = dtShape.getDTtoolbox ()
     // Use dt-toolbox library:
     let dt = dtbox.init(data)
     
     // Build data according shape. Result will be a dt-object.
     let resultDT = dtShape ( dt , shape )
     // If you need a standard JS object, dt-object has a convertor by calling a 'model' function:
     let jsObject = dtShape ( dt, shape ).model (()=>({'as':'std'}))
```



## What is DT?

DT object is an object created by library `dt-toolbox`. It's a tool for handle a heavy javascript structures. You can manipulate, reshape or/and extract the information of it. Immutability is taken as consideration by this library.
Read more about DT on [dt-toolbox page](https://github.com/PeterNaydenov/dt-toolbox).




## Installation

### Node
Install node package:
```
npm install dt-shape --save
```

Once it has been installed, it can be used by writing this line of JavaScript code:

```js
import dtShape from 'dt-shape'
```

or, in a CommonJS project:

```js
const dtShape = require('dt-shape')
```

### TypeScript
Type declarations are included in the package. Shapes are type-checked: source paths must be strings, `load!` keys accept any values and functions.

```ts
import dtShape, { type Shape, type DTObject } from 'dt-shape'

const dt: DTObject = dtShape.getDTtoolbox ().init ({ profile: { name: 'Peter' } })
const shape: Shape = { firstName: [ 'profile/name' ] }
const result = dtShape ( dt, shape ).model ( () => ({ as: 'std' }) )
```

In CommonJS projects the types are available as `dtShape.Shape`, `dtShape.Defaults`, `dtShape.DTObject` and `dtShape.DtBox`.



## Migration
Upgrading from an older version? Read the [Migration guide](https://github.com/PeterNaydenov/dt-shape/blob/master/Migration.guide.md).


## How it works?
`dtShape` is simple function that have two arguments - (`source data`, `data shape`) and returns a result as it explained in the data shape.



### Source Data
Source data should be dt-object. Any standard javascript structure can be converted to DT by single row of code.

```js
// Always load dt-toolbox from dtShape library
// This will preserve compatibility among library versions
// dt-shape needs a dt-object from dt-toolbox 8.1 or newer. Older ones throw an error
let 
      dtbox = dtShape.getDTtoolbox ()
    , dt    = dtbox.init( jsObject )
    ;
```



### Data Shape
`Data shape` represents connection between `source data` and result object. Keys will become a result property names. Values are `source data` keys where dtShape function will search for data. Values of the shape object are always **array**. Simple example:

``` js
let shape = { 'newName' : ['firstName']}

``` 
This shape creates object with property 'newName'. Value for 'newName' is taken from  `source data` object, property 'firstName' . Shape values can contain more than one member.

```js
let shape = { 'newName' : ['firstName','name'] }
```
This example says that result should have property 'newName' and value should be in keys 'firstName' or 'name' of the `source data`. This make possible to use same `data shape` with large variety of `source data` structures and result will be the same. Priority is always on last member of the array.

Source paths use `/` as a separator. A path with a parent (`'profile/name'`, `'coords/0'`) reads exactly that place, array positions too. If the parent doesn't exist, the value is not found. A key without a path (`'name'`) searches the whole source data, and the last match wins.

dt-shape works only with real values. Missing keys, `null`, `undefined`, empty objects and empty arrays are ignored: they never overwrite a found value and are not collected by `list!` or `fold!`. Copied arrays keep their positions: `[ 1, null, 3 ]` stays as it is (use `list!` to get `[ 1, 3 ]`). `0`, `''` and `false` are real values. If no source has a real value, the property is not in the result.

```js
let dt = dtbox.init ({ firstName: 'Peter', name: null })
dtShape ( dt, { newName: [ 'firstName', 'name' ] }).model ( () => ({ as: 'std' }) )
// -> { newName: 'Peter' }
```



### Data Shape - Key Prefixes
Keys can contain prefixes like `list!`, `fold!`, and `load!`.

- `fold!` prefix will search for properties and will fold them inside object. Example:

```js

// shape with fold
let shape = { 'fold!name' : ['firstName','lastName']}
/*
 expected result should have
      {
          name : {
                      firstName : 'someValue'
                    , lastName : 'someOtherValue'
                }
      }
*/
 
```

- `list!` prefix will return list of values
```js

// shape with fold
let shape = { 'list!family' : ['spouse','wife','kid']}
/*
 expected result should have
 {
    family : [ 'spouseName', 'wifeName', 'eventualKidName' , 'OtherKidName' ]
 }
*/
 
```


- `load!` prefix loads data from external source. Source could be function, primitive or object.
```js
const
      dtbox = dtShape.getDTtoolbox ()
    , name = 'Peter'
    , shape = { 'load!firstName' : [ name ] }
    ;

let sourceData = dtbox.init ({ 'root/name' : 'Ivo' });
let result = dtShape ( sourceData, shape ).model(()=>({as:'std'}));
/*
 ->
      {
         firstName : 'Peter'
      }
 */
```


## Skills for AI agents

The `dt-shape` package ships with a **skill** that teaches AI coding
agents the right way to use `dt-shape` — the data-shape syntax, the priority rules, the most common silent failures, and the canonical patterns.

The skill is bundled at `skills/peter-naydenov-dt-shape/` and is
included in the published npm tarball. After `npm install dt-shape`,
copy the skill into your agent's skill directory.

PRs that improve the skill or add more agent install recipes to the
README are welcome.






### Default values
Properties without a real value are not in the result. To keep the shape of the data (no missing keys), provide default values as a third argument:

```js
const shape    = { name: [ 'firstName' ], 'profile/age': [ 'age' ], 'list!tags': [ 'tags' ], nick: [ 'nick' ] }
const defaults = { name: 'Unknown', 'profile/age': 0, tags: [], nick: null }

dtShape ( dtbox.init ({}), shape, defaults ).model ( () => ({ as: 'std' }) )
// -> { name: 'Unknown', nick: null, profile: { age: 0 }, tags: [] }

dtShape ( dtbox.init ({ firstName: 'Peter', tags: [ 'a' ] }), shape, defaults ).model ( () => ({ as: 'std' }) )
// -> { name: 'Peter', nick: null, profile: { age: 0 }, tags: [ 'a' ] }
```

- Default keys are output paths. Prefixes are ignored: use `tags`, not `list!tags`;
- Defaults are used as they are: `null`, `[]` and `{}` are valid defaults;
- Defaults fill only the places without a value. A real value from the shape is never replaced. Default objects add their missing properties;
- The defaults object is not changed.

Defaults work for arrays too. A whole array is a template that fills the empty positions. A specific position can have its own default:

```js
const shape = { coords: [ 'coords' ] }

dtShape ( dtbox.init ({ coords: [ 1, null, 3 ] }), shape, { coords: [ 0, 0, 0, 0 ] })   // -> { coords: [ 1, 0, 3, 0 ] }
dtShape ( dtbox.init ({ coords: [ 1, null, 3 ] }), shape, { 'coords/1': 0 })            // -> { coords: [ 1, 0, 3 ] }
dtShape ( dtbox.init ({}), shape, { 'coords/2': 0 })                                    // -> { coords: [ null, null, 0 ] }
```

A number in an output path creates an array. Build a fixed-size array from separate fields:

```js
dtShape ( dtbox.init ({ lng: 23 }), { 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] }, { coords: [ 0, 0 ] })
// -> { coords: [ 0, 23 ] }
```



## Examples 

### Simple example

```js
import dtShape from 'dt-shape'

const dtbox = dtShape.getDTtoolbox()

const source = {
    firstName : 'Peter',
    familyName : 'Naydenov'
}

// convert object to DT
const dtSource = dtbox.init(source)

// Prepare the shape
const userShape = {
    userName           : [ 'firstName' ],
    'profile/name'     : [ 'firstName' ],
    'profile/lastName' : [ 'familyName' ]
}

const user = dtShape(dtSource, userShape).model(() => ({ as: 'std' }))

/*
  user should be:
  { 
      userName: 'Peter'
    , profile: { 
                   name: 'Peter'
                 , lastName: 'Naydenov' 
               } 
  }
*/


```

Find some examples in `./test` folder.






## Known bugs
_(Nothing yet)_


## Links
- [dt-toolbox](https://github.com/peter-naydenov/dt-toolbox)
- [@peter.naydenov/dt-query](https://www.npmjs.com/package/@peter.naydenov/dt-query)



## Credits
'dt-shape' was created by Peter Naydenov.



## License
'dt-shape' is released under the [MIT License](http://opensource.org/licenses/MIT).


