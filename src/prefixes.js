"use strict";

const 
          dtbox = require ( 'dt-toolbox' )
        , help  = require ( './help' )
        ;





const lib = {

    fold ( inData ) {
        let result;
        const
               data    = inData.data
             , prefix  = inData.prefix
             , search  = inData.search
             ;
    
        result = search.reduce ( (res,item) => {
                     let fragment;
    
                     dtbox
                         .load   ( data )
                         .select ()
                         .folder ( item )
                         .spread ( 'dt', dt => { 
                                                   fragment = dt
                                                               .assemble ()
                                                               .map ( l => l.replace ( 'root', `${prefix}`)   )
                                      })
                     return Object.assign ( res, fragment )
                   }, {})
    
       return result
    } // fold func.
    
    
    
    
    
    , list ( inData ) {
        let result;
        const
               data    = inData.data
             , prefix  = inData.prefix
             , search  = inData.search
             ;
        
        result = search.reduce ( (res,item) => {
                     let fragment;
    
                     dtbox
                         .load ( data )
                         .select ()
                         .folder ( item )
                         .spread ( 'dt', dt => { 
                                                  fragment = dt
                                                              .assemble ()
                                                              .map ( (l,i) => l.replace(l,`${prefix}/${i}`)   )
                                         })
                     
                     return Object.assign ( res, fragment )
                   }, {})
       return result
    } // list func.
    
    
    
    
    
    , load ( inData ) {
        let result = {};
        const
               data    = inData.data
             , prefix  = inData.prefix
             , search  = inData.search
             ;
        
        search.forEach ( item => {
                         let fragment;
                         let type = help.getType ( item )
                      
                      if ( type === 'function' ) {
                                                   item = item ()
                                                   type = help.getType ( item )
                          }
    
                      if ( type === 'undefined' ) return
                      if ( type === 'object' ) {
                                                result = dtbox.init(item).value.map ( el => el.replace('root',prefix)   )
                            }
                      else  {
                                                let obj = {}
                                                obj[prefix] = item
                                                result = dtbox.init(obj).value
                            }
    
                        
              }) // for each search
       return result
    } // load func.
} // lib



module.exports = lib


