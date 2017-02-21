# DT Shape



**WARNING: Experimental stage**

Build data structures by using data shape. The data shape can look like that:

```js

let shape  = {
                'name' : [ 'firstName' , 'name' ]
/*                ^            ^
                  |            |
                  |            +---> search for values in these keys
                  |
      Create key with this name
                     
*/
                 }
     // Important! Data should be converted first in DT format.
     // Use dt-toolbox library:
     let dt = dtbox.init(data).value
     
     // Build data according dataShape. Result will be in DT format.
     let resultDT = shape ( dt , dataShape )

     // If want it back as a standard javascript object:
     let result = shape ( dt, dataShape ).build()

```



## What is DT?

DT format is a flatten version of the standard javascript object. 
Read more about DT on [dt-toolbox page](https://github.com/PeterNaydenov/dt-toolbox).




## Installation

Install by writing in your terminal:
```
npm install dt-shape --save
```

Once it has been installed, it can be used by writing this line of JavaScript:
```js

let dtShape = require ( 'dt-shape' )

```




## How it works?
Shape is simple function that receives two arguments - (`source data`, `data shape`) and returns as a result DT object.
Methods available for DT object are described in [exportAPI of dt-toolbox](https://github.com/PeterNaydenov/dt-toolbox).

### Source Data
Source data should be DT object. Any standard javascript structure can be converted to DT by using dt-toolbox library.

```js

let dt = dtbox.init( jsObject ).value

```

### Data Shape
`Data shape` represents connection between `source data` and result object. Keys will become a result property names. Values are `source data` keys where shape function will search for data. Values of shape object are always **array**. Simple example:

``` js
let shape = { newName : ['firstName']}

``` 
This shape will build object where we will have property 'newName' with the value contained in 'firstName' key of the `source data`. Shape values can contain more than one member. 

```js
let shape = { newName : ['firstName','name'] }
```
This example says that result should have property 'newName' and value should be in key 'firstName' or 'name' of the `source data`. This make possible to use same `data shape` with large variety of `source data` objects and result will be the same.

### Data Shape - Key Prefixes
Keys can contain prefixes like `list!` and `fold!`.

- `fold!` prefix will search for properties and will fold them inside object. Example

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
    family : [ 'manName', 'wifeName', 'eventualKidName' , 'OtherKid' ]
 }
*/
 
```


- `load!` prefix loads data from external source. Source could be function, primitive or object.
```js
let name = 'Peter'
let shape = { 'load!firstName' : [ name ] }
let dt = dtbox.init ({ name : 'Ivo' }).value
let result = dtShape ( dt, shape )
/*
 expected result
 {
   firstName : 'Peter'
 }
 */
```










## Examples 

### Simple example

```js
const 
       dtbox = require ('dt-toolbox')
     , dtShape = require ( 'dt-shape' )
     ;

let source = {
                firstName : 'Peter'
              , familyName : 'Naydenov'
           };

// convert object to DT
let dtSource = dtbox.init(source).value;

// Prepare the map
let userShape = {
        'userName' : ['firstName'  ]
        'profile/name'     : [ 'firstName' ]
      , 'profile/lastName' : [ 'familyName']
    }

let user = dtShape ( dtSource, userShape ).build()

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










## Tips

- DT format not depends on `dt-toolbox`! Building data directly in DT format can save time for format conversion operations;








## Known bugs
_(Nothing yet)_










## Release History

### 0.1.2 (2017-02-21)
 - [x] Fix: Problematic updates with wrong values



### 0.1.0 (2017-02-20)
 - [x] Prefix `load!` loads data from external source;
 - [ ] Error: Problematic updates with wrong values



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




