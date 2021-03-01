# DT Shape

Build data structures by using data-shapes. The data-shape should looks like that:

```js
const dtShape = require ( 'dt-shape' )
let shape  = {
                'name' : [ 'firstName' , 'name' ]
/*                ^            ^            ^
                  |            |            +---> top priority is always in the end
                  |            +---> search for values in these keys
                  |
      Create property with this name
                     
*/
                 }
     // Important! Data should be in DT format. If is not - convert it first.
     // Use dt-toolbox library.:
     let dt = dtbox.init(data).value
     
     // Build data according shape. Result will be in DT format.
     let resultDT = dtShape ( dt , shape )

     // If want result as a standard javascript object:
     let result = dtShape ( dt, shape ).build ()

```



## What is DT?

DT format is a flatten version of the standard javascript object. 
Read more about DT on [dt-toolbox page](https://github.com/PeterNaydenov/dt-toolbox).




## Installation

### Node
Install node package:
```
npm install dt-shape --save
```

Once it has been installed, it can be used by writing this line of JavaScript code:
```js

let dtShape = require ( 'dt-shape' )

```

### Browsers
Copy 'dt-shape.min.js' from 'dist/' folder. Add script tag

```html
<script src='js/dt-shape.min.js'></script>
// -> dtShape is available

// dt-toolbox is part of this script file.
dtbox = dtShape.getDTtoolbox ()

```



## How it works?
`dtShape` is simple function that have two arguments - (`source data`, `data shape`) and returns a result DT object.
Methods available for DT object are described in [exportAPI of dt-toolbox](https://github.com/PeterNaydenov/dt-toolbox).

### Source Data
Source data should be DT object. Any standard javascript structure can be converted to DT by single row of code.

```js
// use dt-toolbox
let dt = dtbox.init( jsObject ).value

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
let name = 'Peter'
let shape = { 'load!firstName' : [ name ] }
let sourceData = { 'root/name' : 'Ivo' }
let result = dtShape ( sourceData, shape )
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
let dtSource = dtbox.init(source).value;

// Prepare the shape
let userShape = {
        'userName'         : [ 'firstName' ]
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




