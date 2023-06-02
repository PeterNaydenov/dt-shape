'use strict'

import dtbox   from 'dt-toolbox'
import load    from './load.js'
import keyAnalyzer from './keyAnalyzer.js'



function dtShape ( dt , shape ) {
            const 
                  shapeEntries = Object.entries ( shape )
                , isShapeArray = shape instanceof Array
                ;

            return dt.query ( store => {
                                const 
                                      objectNames = [ 'root' ]
                                    , cache = {}
                                    ;

                                if ( isShapeArray )   store.set ( 'root', [])
                                else                  store.set ( 'root', {})

                                shapeEntries.forEach ( ([k, list ]) => {
                                                let 
                                                      result
                                                    , [ keyList, action ] = keyAnalyzer ( k )
                                                    , hasAction = ( action != null )
                                                    ;
                                                // actions - list, fold, load;
                                                if ( action === 'list' )   result = []
                                                if ( action === 'fold' )   result = {}
                                                if ( action === 'load' )   result = load ( list )

                                                if ( action !== 'load' ) {
                                                list.forEach ( el => {
                                                            let 
                                                                  container = null
                                                                , hasLine = ( dt.index(`root/${el}`) != null )
                                                                ;

                                                            if ( hasLine ) {
                                                                    store.get ( `root/${el}` )
                                                                         .look ( ({key, value, flatData}) => {
                                                                                        if      ( action === 'list' )   result.push (value) 
                                                                                        else if ( action === 'fold' )   result[key] = value
                                                                                        else {                        
                                                                                                result = flatData
                                                                                                return 'next'
                                                                                            }
                                                                                })
                                                                }
                                                            else {
                                                                    const 
                                                                          searchList = el.split ( '/' )
                                                                        , prop = searchList.pop ()
                                                                        ;
                                                                    if ( searchList.length > 0 ) {
                                                                                container = `root/${searchList.join('/') }`
                                                                                hasLine = ( dt.index ( container ) != null )
                                                                        }
                                                                    store.look ( ({key, value, breadcrumbs }) => {
                                                                                        // If container is specified - check name or breadcrumbs first
                                                                                        if ( hasLine && breadcrumbs != container )   return 'next'
                                                                                        if ( key === prop ) {
                                                                                                 if      ( action === 'list' )   result.push ( value )
                                                                                                 else if ( action === 'fold' )   result[key] = value
                                                                                                 else                            result = value
                                                                                            }
                                                                                    })
                                                                }
                                                    }) // forEach list
                                                } // if action != 'load'

                                                if ( typeof(result)==='object' && Object.entries(result).length === 0 )   return
                                                if ( result != null )   cache[keyList.join('/')] = result
                                                
                                        }) // forEach shapeEntry


                                
                                const cacheEntries = Object.entries ( cache );
                                cacheEntries.forEach ( ([k,r]) => {
                                                        const 
                                                              keyList = k.split('/')
                                                            , spot = keyList.pop ()
                                                            ;
                                                        let parent = 'root';
                                                        keyList.forEach ( k => {   // Setup the container objects needed
                                                                    if ( !objectNames.includes(k)) {
                                                                                store.set ( k, {} )
                                                                                store.connect ( [`${parent}/${k}`])
                                                                                objectNames.push ( k )
                                                                        }
                                                                    parent = k
                                                            })
                                                        if ( r == null )   return
                                                        else if ( typeof(r) === 'object' ) {   // Create a new structure
                                                                    store.set ( spot, r )
                                                                    store.connect ([`${parent}/${spot}`])                
                                                            }
                                                        else {  // Save a property
                                                                    store.save ( parent, spot, r )
                                                            }
                                        }) // cacheEntries forEach
                        }) // dt.query
} // dtShape func.



dtShape.getDTtoolbox = () => dtbox;



export default dtShape


