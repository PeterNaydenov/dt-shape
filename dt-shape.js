'use strict';

let dtbox = require ( 'dt-toolbox' );


let simple = {
   getIterator : list => Object.getOwnPropertyNames ( list )
} // simple




function shape ( dt , maps ) {
  let 
       result
     , replaceKeys = simple.getIterator ( maps )
     ;

  result = replaceKeys.reduce ( (res,rKey) => {

                   if ( rKey.includes('!') ) {
                                              let 
                                                    keyData = rKey.split('!')
                                                  , action = keyData[0]
                                                  , newKey = keyData[1]
                                                  , inData
                                                  ;

                                              inData = { 
                                                            data   : dt 
                                                          , search : maps[rKey]
                                                          , prefix : newKey 
                                                       }

                                              switch ( action ) {
                                                    case 'fold' :
                                                                       res = Object.assign ( res, fold(inData) )
                                                                       break;
                                                    case 'list'   :
                                                                       res = Object.assign ( res, list(inData) )
                                                                       break;
                                                  } // switch action
                        } 
                   else {
                          maps[rKey].forEach ( findKey => {
                                                            if ( dt[`root/${findKey}`] )   
                                                                 res[`root/${rKey}`] = dt[`root/${findKey}`]   
                                    })
                    
                   }
                   return res;
              }, dtbox.empty() )

  return result
} // shape func.







// -------------------------------------------------    ACTIONS

function fold ( inData ) {
    let result;
    let
           data    = inData.data
         , prefix  = inData.prefix
         , search  = inData.search
         ;
    
    result = search.reduce ( (res,item) => {
                 let fragment;

                 dtbox
                     .load(data)
                     .select ()
                     .folder ( item )
                     .spread ( 'dt', dt => { 
                                              fragment = dt
                                                          .assemble()
                                                          .map(l => l.replace('root',`${prefix}`)  )
                                     })
                 return Object.assign ( res, fragment )
               }, {})
   return dtbox.init(result).value
} // fold func.






function list ( inData ) {
    let result;
    let
           data    = inData.data
         , prefix  = inData.prefix
         , search  = inData.search
         ;
    
    result = search.reduce ( (res,item) => {
                 let fragment;

                 dtbox
                     .load(data)
                     .select ()
                     .folder ( item )
                     .spread ( 'dt', dt => { 
                                              fragment = dt
                                                          .assemble()
                                                          .map ( (l,i) => l.replace(l,`${prefix}/${i}`)   )
                                     })
                 
                 return Object.assign ( res, fragment )
               }, {})
   return dtbox.init(result).value
} // fold func.



module.exports = shape




