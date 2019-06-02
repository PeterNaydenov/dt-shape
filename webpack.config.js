"use strict";

const path = require ( 'path' );
      


module.exports = {
    entry: './src/index.js',
    output: {
          path: path.resolve(__dirname, 'dist')
        , publicPath: '/'
        , filename: 'dt-shape.min.js'
        , library: 'dtShape'
    },
    module: {
        rules: [
           { test: /\.js$/, use : ['babel-loader'], exclude: /node-modules/ }
          ]
    }
};


