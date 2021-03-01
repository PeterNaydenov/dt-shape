"use strict";

const 
          dtbox = require ( 'dt-toolbox' )
        , help  = require ( './help' )
        ;





const lib = {

    fold ( inData ) {
        let 
              { data, search, prefix } = inData
            , source = dtbox.init ( data, { type: 'breadcrumbs'})
            , folder = null
            ;
        search.forEach ( str => {
                    source
                        .select ()
                        .find ( `/${str}` )
                        .withSelection ()
                        .flatten ()
                        .spread ( 'files', x => {
                                        let update = [];
                                        x.forEach ( file => {
                                                    let 
                                                          dir = file.split ( '/' )
                                                        , val = dir.pop ()
                                                        , prop = dir.pop ()
                                                        ;
                                                    update.push ( `root/${prefix}/${prop}/${val}`)
                                              })
                                        dtbox
                                           .init ( update, {type:'file'})
                                           .spreadAll ( 'file', x => folder = x )
                              })
            })
       return folder
    } // fold func.
    
    
    
    
    
    , list ( inData ) {
        let 
              { data, search, prefix } = inData
            , source = dtbox.init ( data, { type: 'breadcrumbs' })
            , folder = {}
            ;

        search.forEach ( str => {
                      source
                         .select ()
                         .find ( `/${str}` )
                         .spread ( 'value', x => {
                                        let ln = x.length;
                                        if ( ln > 0 )   folder = x.map ( y => `root/${prefix}/${y}`)
                              })
              })
       return folder
    } // list func.
    
    
    
    
    
    , load ( inData ) {
        let
               { search, prefix } = inData
             , folder = []
             ;        
        search.forEach ( item => {
                      let type = help.getType ( item )                      
                      folder = []
                      if ( type === 'function' ) {
                                                   item = item ()
                                                   type = help.getType ( item )
                          }
                      if ( type === 'undefined' ) return
                      if ( type === 'object' ) {
                                                dtbox
                                                   .init ( item )
                                                   .spreadAll ( 'files', x => {
                                                              let temp = {};
                                                              temp [ prefix ] = x
                                                              dtbox
                                                                .init ( temp )
                                                                .spreadAll ( 'files', x =>  folder = x.map ( y => `root/${y}` ))
                                                          })
                            }
                      else  {
                                                folder.push ( `root/${prefix}/${item}` )
                            }
              }) // for each search
        return folder
    } // load func.
} // lib



module.exports = lib


