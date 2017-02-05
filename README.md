# DT Shape

Build data structures by using data maps. The data map can look like that:

```js

let dataShape  = {
                   'name' : [ 'firstName' , 'name' ]
/*                   ^            ^
                     |            |---> search for values in these keys
                     |
        Create key with this name
                     
*/
                 }
     // Important! Data should be converted first in DT format.
     // Use dt-toolbox library:
     let dt = dtbox.init(data).value
     
     // Build data according dataShape
     let resultDT = shape ( dt , dataShape )

     // Result will be in DT format. If want it back to standard object:
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

let shape = require ( 'dt-shape')

```




## API
Shape function returns a DT object. Methods available are described in [exportAPI of dt-toolbox](https://github.com/PeterNaydenov/dt-toolbox).




# How it works?

1. First: Create dataShape

2. Send to `shape` function data in DT format and dataShape












## Examples 
Find some examples in `./test` folder.










## Tips

- DT format not depends on `dt-toolbox`! Building data directly in DT format can save time for format conversion operations;








## Known bugs
_(Nothing yet)_










## Release History

### 1.0.0 (2017-02-05)
 
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;





## Credits
'dt-shape' was created by Peter Naydenov.





## License
'dt-shape' is released under the [MIT License](http://opensource.org/licenses/MIT).




