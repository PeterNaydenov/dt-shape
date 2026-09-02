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


## How it works?
`dtShape` is simple function that have two arguments - (`source data`, `data shape`) and returns a result as it explained in the data shape.



### Source Data
Source data should be dt-object. Any standard javascript structure can be converted to DT by single row of code.

```js
// Always load dt-toolbox from dtShape library
// This will preserve compatibility among library versions
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


