"use strict";

const lib = {
     getIterator : list => Object.getOwnPropertyNames ( list )
   , getType     : function notObject ( str ) {
                        let result = false;
                        if ( str == null               ) { result = 'undefined' }
                        if ( typeof str == 'string'    ) { result = 'string'    }
                        if ( typeof str == 'number'    ) { result = 'number'    }
                        if ( typeof str == 'boolean'   ) { result = 'boolean'   }
                        if ( typeof str == 'function'  ) { result = 'function'  }
                        if ( result === false          ) { result = 'object'    } 
                        return result
                  } // notObject func.
   , length     : data => Object.keys ( data ).length
} // lib



module.exports = lib