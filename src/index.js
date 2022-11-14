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
                      dtbox
                            .load( res, {type:'breadcrumbs'})
                            .select ()
                            .find ( `/${key}` )
                            .invert ()
                            .spread ( 'breadcrumbs', dt =>  result = dt  )
        }
    else              result = res
    return result
} // keyRemover func.





function dtShape ( dt , shape ) {
  let 
       newKeys = help.getIterator ( shape )
     , breadcrumbsData
     , justData = {}
     , prefixData = []
     , mixer = dtbox.init ()
     , cleanItems = []
    //  , shapeDT
     ;

  dt.spreadAll ( 'breadcrumbs', x => breadcrumbsData = x )
  newKeys.forEach ( k => {
            let 
                  list = shape[k]
                , hasPrefix = k.includes ('!')
                ;
            
            if ( hasPrefix ) {
                  let 
                        [ action, theKey ] = k.split ( '!' )
                      , inData = {
                                      prefix : theKey
                                    , data : breadcrumbsData 
                                    , search : [...list]
                                  }
                      , update = prefixes[action] ( inData )
                      ;
                      if ( update.length > 0 ) {  
                                cleanItems.push ( `root/${theKey}` )
                                prefixData = prefixData.concat ( update )
                          }
                } // if hasPrefix
            else {
                    list.forEach ( el => {
                                let 
                                      id  = `root/${el}`
                                    , val = breadcrumbsData [ id ]
                                    ;
                                if ( val ) {   
                                          cleanItems.push ( `root/${k}` )
                                          justData[`root/${k}`] = val
                                  }
                            })
                } // else hasPrefix
                
            cleanItems.forEach ( prop => {
                      mixer
                        .select ()
                        .find ( prop )
                        .invert ()
                        .spread ( 'files', x => mixer = dtbox.init (x,{type:'files'}) )
                })
                
            cleanItems = []
            if ( prefixData.length > 0 ) {  
                      mixer.add ( prefixData, {type:'files'} )
                      prefixData = []
                }
            mixer.overwrite ( justData, {type:'breadcrumbs'})                
            justData = {}
    }) // forEach k
    let flatResult;
    mixer.spreadAll ( 'std', x => flatResult = x ) 
    return flatResult
} // shape func.


dtShape.getDTtoolbox = () => dtbox;

module.exports = dtShape


