# DT Shape v.3.x.x

![version](https://img.shields.io/github/package-json/v/peterNaydenov/dt-shape)
![license](https://img.shields.io/github/license/peterNaydenov/dt-shape)

Build data structures by using data-shapes. The data-shape should looks like that:

```js
const dtShape = require ( 'dt-shape' )
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








## Examples 

### Simple example

```js
const 
        dtShape = require ( 'dt-shape' )
     ,  dtbox   = dtShape.getDTtoolbox ()
     ;

let source = {
                firstName : 'Peter'
              , familyName : 'Naydenov'
           };

// convert object to DT
let dtSource = dtbox.init ( source );

// Prepare the shape
let userShape = {
        'userName'         : [ 'firstName' ]
        'profile/name'     : [ 'firstName' ]
      , 'profile/lastName' : [ 'familyName']
    }

let user = dtShape ( dtSource, userShape ).model ( () => ({as:'std'}))

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










## Release History



### 3.0.3 ( 2024-01-14)
- [x] Dependency update. `dt-toolbox` to ver. 7.4.1;
- [x] Dev dependencies update. Chai@5.0.0;
- [x] Dev dependencies update. C8@9.1.0;



### 3.0.2 ( 2023-11-03)
- [x] Update `dt-toolbox` to ver. 7.4.0;



### 3.0.1 ( 2023-10-10)
- [x] Update `dt-toolbox` to ver. 7.2.0;



### 3.0.0 ( 2023-06-02)
- [x] Update `dt-toolbox` to ver. 6.0.0;
- [x] Result is coming as a dt-object;



### 2.0.5 ( 2022-05-29)
- [x] Update `dt-toolbox` to ver. 4.0.7;



### 2.0.3 (2022-03-07)
- [x] Update `dt-toolbox` to ver. 4.0.6;



### 2.0.1 (2021-03-25)
- [x] Update `dt-toolbox` to ver. 3.1.0;



### 2.0.0 (2021-03-01)
 - [x] Works with v.3.x.x of `dt-toolbox`;
 - [x] Changes in DT objects according v.3.x.x of dt-toolbox;
 - [x] Documentation for old version v.1.x.x is available [here](https://github.com/PeterNaydenov/dt-shape/blob/master/README_v.1.x.x.md);
 - [x] Library is using a 'generator functions'. If support for old browsers is required, add a polyfill for 'generators' or get back to version 1.x.x of the library;





### 1.0.2 (2019-06-02)
 - [x] Update dependencies: Dt-toolbox v.2.1.0;
 - [x] Upgrade dependencies: Webpack v.4.32.2;
 - [x] Browser version update;
 - [x] Documentation update;



### 1.0.0 (2017-12-28)
 - [x] Project folder reorganization;
 - [x] Test coverage. Istanbul;
 - [x] Test coverage on 100%;
 - [x] Version for browsers. Dt-toolbox included;
 - [x] Documentation update;



### 0.1.6 (2017-04-22)
 - [x] Update dependency dt-toolbox to 1.6.0;



### 0.1.5 (2017-03-28)
 - [x] Update dependency dt-toolbox to 1.4.0;



### 0.1.4 (2017-02-24)
 - [x] Documentation update only;



### 0.1.2 (2017-02-21)
 - [x] Fix: Problematic updates with wrong values;



### 0.1.0 (2017-02-20)
 - [x] Prefix `load!` loads data from external source;
 - [ ] Error: Problematic updates with wrong values;



### 0.0.3 (2017-02-17)
 - [x] Just documentation update;



### 0.0.1 (2017-02-05)
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;





## Credits
'dt-shape' was created by Peter Naydenov.





## License
'dt-shape' is released under the [MIT License](http://opensource.org/licenses/MIT).




