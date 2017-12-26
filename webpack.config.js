"use strict";

const 
        path    = require ( 'path'    )
      , webpack = require ( 'webpack' )
      ;

const uglifyOptions = { 
                          minimize : true
                        , mangle   : true
                      };



module.exports = {
    entry: './src/index.js',
    output: {
          path: path.resolve(__dirname, 'dist')
        , filename: 'dt-shape.min.js'
        , library: 'dtShape'
        , libraryTarget : 'umd'
        , umdNamedDefine : true
    },
    module: {
        rules: [{ 
                  test: /\.js$/                
                , use : {
                              loader: 'babel-loader'
                            , options : {
                                              presets : ['env']                                            
                                        }
                        }
               }]
    },
    plugins:  [
                new webpack.optimize.UglifyJsPlugin ( uglifyOptions )
              ] 
               
};


