"use strict";

const		 
		  dtbox   = require ( 'dt-toolbox'   )
        , help    = require ( '../src/help'  )
        , getType = help.getType
		, chai    = require ( 'chai'         )
		, expect  = chai.expect
		;





describe ( 'module Help', () => {



it ( 'getType: string', () => {
   const 
          test   = 'test text'
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'string' )
}) // it getType: string



it ( 'getType: number', () => {
   const 
          test   = 12
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'number' )
}) // it getType: number



it ( 'getType: boolean', () => {
   const 
          test   = false
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'boolean' )
}) // it getType: boolean



it ( 'getType: function', () => {
   const 
          test   = () => 'test function'
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'function' )
}) // it getType: function



it ( 'getType: undefined', () => {
   const 
          test   = undefined
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'undefined' )
}) // it getType: undefined



it ( 'getType: null', () => {
   const 
          test   = null
        , result = getType ( test )
        ;
   expect ( result ).to.be.equal ( 'undefined' )
}) // it getType: null


}) // describe


