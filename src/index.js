'use strict';

let 
      dtbox    = require ( 'dt-toolbox' )
    , prefixes = require ( './prefixes' )
    , help     = require ( './help'     )
    ;



function keyRemover ( res, key ) {
    let result;
    const healthy = Object.keys(res).every ( el => !el.includes(key)   );
    if ( !healthy ) {
                      dtbox.loadFast(res)
                            .select ()
                            .folder ( key )
                            .invert ()
                            .spread ( 'dt', dt =>  result = dt  )
        }
    else              result = res
    return result
} // keyRemover func.





function dtShape ( dt , shape ) {
  let 
       result
     , replaceKeys = help.getIterator ( shape )
     ;

  result = replaceKeys.reduce ( (res,rKey) => {
                   let 
                          update
                        , count = help.length
                        ;

                   if ( rKey.includes('!') ) {  // We have prefix
                                                let 
                                                      keyData = rKey.split('!')
                                                    , action = keyData[0]
                                                    , theKey = keyData[1]
                                                    , inData
                                                    ;
    
                                                  
                                                inData = { 
                                                              data   : dt 
                                                            , search : shape[rKey]
                                                            , prefix : theKey 
                                                         }
    
                                                switch ( action ) {
                                                        case 'fold' :
                                                                       update = prefixes.fold ( inData )
                                                                       break
                                                        case 'list' :
                                                                       update = prefixes.list ( inData )
                                                                       break
                                                        case 'load' :
                                                                       update = prefixes.load ( inData )
                                                                       break
                                                      } // switch action
                                                if ( count(update) !== 0 ) {
                                                                       res = keyRemover ( res, theKey )
                                                                       res = Object.assign ( res, update )
                                                   }  
                        } 
                   else {
                           update = shape[rKey].reduce ( (r,findKey) => {
                                                            if ( dt[`root/${findKey}`] ) r[`root/${rKey}`] = dt[`root/${findKey}`]
                                                            return r   
                                                  },{})
                           if ( count(update) !== 0 ) {
                                                            res = keyRemover ( res, rKey )
                                                            res = Object.assign ( res, update )
                              }   
                        }
                 return res;
              }, dtbox.empty() )

  return result
} // shape func.


dtShape.getDTtoolbox = () => dtbox;

module.exports = dtShape


