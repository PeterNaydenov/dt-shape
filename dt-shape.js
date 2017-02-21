'use strict';

let dtbox = require ( 'dt-toolbox' );


let simple = {
     getIterator : list => Object.getOwnPropertyNames ( list )
   , getType     : function notObject ( str ) {
                        let result = false
                        if ( typeof str == 'undefined' ) { result = 'undefined' }
                        if ( typeof str == 'string'    ) { result = 'string'    }
                        if ( typeof str == 'number'    ) { result = 'number'    }
                        if ( typeof str == 'boolean'   ) { result = 'boolean'   }
                        if ( typeof str == 'function'  ) { result = 'function'  }
                        if ( result === false          ) { result = 'object'    } 
                        return result
                  } // notObject func.
   , length     : data => Object.keys ( data ).length
} // simple




function sanitize ( res, key ) {
  let result;

  let healthy = Object.keys(res).every ( el => !el.includes(key)   ) 
  if ( !healthy ) {
                     dtbox.loadFast(res)
                          .select ()
                          .folder ( key )
                          .invert ()
                          .spread ( 'dt', dt =>  result = dt  )
      }
  else               result = res
  return result;
}




















function shape ( dt , maps ) {
  let 
       result
     , replaceKeys = simple.getIterator ( maps )
     ;

  result = replaceKeys.reduce ( (res,rKey) => {
                   let 
                          newRes
                        , update
                        , count = simple.length
                        ;

                   if ( rKey.includes('!') ) {
                                              let 
                                                    keyData = rKey.split('!')
                                                  , action = keyData[0]
                                                  , newKey = keyData[1]
                                                  , inData
                                                  ;

                                              newRes = sanitize ( res, newKey )
                                              
                                              inData = { 
                                                            data   : dt 
                                                          , search : maps[rKey]
                                                          , prefix : newKey 
                                                       }

                                              switch ( action ) {
                                                    case 'fold' :
                                                                       update = fold ( inData )
                                                                       if ( count(update) !== 0 )   res = Object.assign ( res, update )
                                                                       break
                                                    case 'list'   :
                                                                       update = list ( inData )
                                                                       if ( count(update) !== 0 )  res = Object.assign ( res, update )
                                                                       break
                                                    case 'load'   :
                                                                      update = load ( inData )
                                                                      if ( count(update) !== 0 )   res = Object.assign ( res, update )
                                                                      break
                                                  } // switch action
                        } 
                   else {
                          newRes = sanitize ( res, rKey )

                          update = maps[rKey].reduce ( (r,findKey) => {
                                                            if ( dt[`root/${findKey}`] ) r[`root/${rKey}`] = dt[`root/${findKey}`]
                                                            return r   
                                                  },{})
                          if ( count(update) !== 0 )   res = Object.assign ( newRes, update )
                   }
                   return res;
              }, dtbox.empty() )

  return result
} // shape func.




















// -------------------------------------------------    PREFIXES

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

   return result
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
   return result
   // return dtbox.init(result).value
} // fold func.





function load ( inData ) {
    let result = {};
    let
           data    = inData.data
         , prefix  = inData.prefix
         , search  = inData.search
         ;

    
    search.forEach ( item => {
        
       let fragment;
       let type = simple.getType ( item )
    
    if ( type === 'function' ) {
                                 item = item()
                                 type = simple.getType ( item )
        }

    if ( type !== 'undefined' ) {
          if ( type === 'object' ) {
                                       result = dtbox.init(item).value.map(el => el.replace('root',prefix))
                  }
          else    {
                                      let obj = {}
                                      obj[prefix] = item
                                      result = dtbox.init(obj).value
                  }

      }
  }) // for each search
     
   return result
} // fold func.


module.exports = shape




