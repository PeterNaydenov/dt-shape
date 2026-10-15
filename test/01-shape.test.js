'use strict'

import dtShape from '../src/main.js'
import { expect } from 'chai'

const	dtbox    = dtShape.getDTtoolbox ();



describe ( 'DT shape', () => {





it ( 'Shallow structure', () => {
  let result; 
  let test = {
			      'name' : 'Peter'
			    , 'sirname' : 'Naydenov'
			    , 'age' : 42
			  };
  
  let newStructure = {
                      'firstName' : ['name']
                    , 'lastName'  : ['sirname', 'lastName' ] // array of possible data sources. Last overwrites previous.
                    //   ^-------  new key name
                  };
  let dt = dtbox.init ( test );
      result = dtShape ( dt, newStructure ).model ( () => ({as:'std'}))
       /*
          Expected result:
            {
                firstName : 'Peter'
              , lastName  : 'Naydenov'
            } 
      */
      expect ( result ).to.have.property ( 'firstName' )
      expect ( result ).to.have.property ( 'lastName'  )
      
      expect ( result ).to.not.have.property ( 'age' )
      expect ( result ).to.not.have.property ( 'name' )
      expect ( result ).to.not.have.property ( 'sirname' )
  }) // it simple structure





it ( 'Deep structure' , () => {
    let result;
    let test = {
                profile : {
                              name    : 'Peter'
                            , sirname : 'Naydenov'
                            , age     : 42
                        }
              }
    let structure = {
                          'firstName'          : ['profile/name']
                        , 'lastName'          : ['profile/sirname']
                        , 'personal-data/age' : ['profile/age']
                    }

    let dt = dtbox.init ( test )
    result = dtShape ( dt, structure ).model ( () => ({as:'std'}))
/*
    Expected result:
    {
        firstName : 'Peter'
      , lastName : 'Naydenov'
      , personal-data : { age : 42 }
    }  
*/
      expect ( result ).to.have.property ( 'firstName' )
      expect ( result ).to.have.property ( 'personal-data' )
      expect ( result['personal-data'] ).to.have.property ( 'age' )
      expect ( result['personal-data']['age'] ).to.be.equal ( 42 )
}) // it Deep structure





it ( 'Apply structure on different data sources', () => {
	let result1,result2;
	let 
      st1 = { 
                profile : {
                              'name'    : 'Peter'
                            , 'sirname' : 'Naydenov'
                          }
	          }

	let st2 = {
                   firstName : 'Peter'
                , familyName : 'Naydenov'
	          }

   let structure = {
                        'firstName'         :  [ 'profile/name', 'firstName' ]
                      , 'lastName'          : [ 'profile/sirname' , 'familyName' ]
                      , 'personal-data/age' : [ 'profile/age']
                   }
let
     data1 = dtbox.init ( st1 )
   , data2 = dtbox.init ( st2 )
   ;

  
  result1 = dtShape ( data1, structure ).model ( () => ({as:'std'}))
  result2 = dtShape ( data2, structure ).model ( () => ({as:'std'}))

/*
    Expected result for both should be:
    {
        firstName : 'Peter'
      , lastName  : 'Naydenov'
      , 'personal-data' : {}
    }
  
  It's because key 'profile/age' does not exist
*/
    expect ( result1 ).to.have.property ( 'firstName' ) 
    expect ( result1 ).to.have.property ( 'lastName'  ) 
    expect ( result1 ).to.not.have.property ( 'personal-data' ) 

    expect ( result2 ).to.have.property ( 'firstName' ) 
    expect ( result2 ).to.have.property ( 'lastName'  ) 
    expect ( result2 ).to.not.have.property ( 'personal-data' ) 
     
}) // it Different sources





it ( 'Prefix Fold' , () => {
  // * Fold will collect sources in an object 
    let result;
    let st1 = { 
                profile : {
                              'name'    : 'Peter'
                            , 'sirname' : 'Naydenov'
                            , 'age'     : 42
                          }
            }

    let structure = {
                        'name/firstName' : [ 'profile/name', 'firstName' ]
                      , 'name/lastName'  : [ 'profile/sirname' , 'familyName' ]
                      , 'fold!hidden'    : [ 'age' ]
                   }

    let dt = dtbox.init ( st1 )
    result = dtShape ( dt, structure ).model ( () =>({as:'std'}))
  
/*
    Expected result:
    {
       name : {
                  firstName : 'Peter'
                , lastName  : 'Naydenov'
              }
       hidden : { age : 42 }
    }
*/

   expect ( result ).to.have.property ( 'name' )

   expect ( result['name'] ).to.have.property ( 'firstName' )
   expect ( result['name'] ).to.have.property ( 'lastName' )
   expect ( result['name']['firstName'] ).to.be.equal ( 'Peter' )

   expect ( result['hidden'] ).to.be.an ( 'object' )
   expect ( result['hidden'] ).to.have.property ( 'age' )
   expect ( result['hidden']['age'] ).to.be.equal ( 42 )

}) // it fold






it ( 'Prefix List' , () => {
    let result;
    let st1 = { 
                profile : {
                              'name'    : 'Peter'
                            , 'sirname' : 'Naydenov'
                            , 'age'     : 42
                          }
            }

    let structure = {
                        'firstName' : [ 'profile/name', 'firstName' ]
                      , 'lastName'  : [ 'profile/sirname' , 'familyName' ]
                      , 'list!hidden'    : [ 'profile' ]
                   }

   let dt = dtbox.init( st1 )
   result = dtShape ( dt, structure ).model ( () => ({as:'std'}))
      
/*
    Expected result:
    {
        firstName : 'Peter'
      , lastName  : 'Naydenov'
      , hidden    : [ 'Peter', 'Naydenov', 42 ]
    }
*/   
   
   expect ( result ).to.have.property ( 'firstName' )
   expect ( result ).to.have.property ( 'lastName'  )

   expect ( result['hidden'] ).to.be.an ( 'array' )
   expect ( result['hidden'] ).to.contain ( 'Peter' )
   expect ( result['hidden'] ).to.contain ( 'Naydenov' )
   expect ( result['hidden'] ).to.contain ( 42 )

}) // it list





it ( 'Prefix Load: Primitives and Objects', () => {
    let result;
    let st1 = { 
                profile : {
                              'name'    : 'Peter'
                            , 'sirname' : 'Naydenov'
                            , 'age'     : 42
                          }
            }

    let gender = 'male'
    let name = [ 'List', 'of', 'items' ]
    let structure = {
                        'lastName'       : [ 'profile/sirname' , 'familyName' ]
                      , 'load!firstName' : [ name ]
                      , 'list!hidden'    : [ 'profile' ]
                      , 'load!gender'    : [ gender ]
                   }

let dt = dtbox.init ( st1 )
result = dtShape ( dt, structure ).model ( () => ({as:'std'}))

/*
    Expected result:
    {
        lastName  : 'Naydenov'
      , firstName : [ 'List', 'of', 'items' ]
      , hidden    : [ 'Peter', 'Naydenov', 42 ]
      , gender    : 'male'
    }
*/

    expect ( result['firstName'] ).to.be.an    ( 'array' )
    expect ( result['firstName'] ).to.contain  ( 'List'  )
    expect ( result['gender']    ).to.be.equal ( 'male'  )
}) // it load: primitives and objects




it ( 'Prefix Load: Function', () => {
  const
       st1 = { 
              profile : {
                            'name'    : 'Peter'
                          , 'sirname' : 'Naydenov'
                          , 'age'     : 42
                        }
          }
      , dtst1 = dtbox.init ( st1 )
      ;

  let gender = () => undefined
  let name = function () { return 'Peter Naydenov' }
  let structure = {
                      'lastName'       : [ 'profile/sirname' , 'familyName' ]
                    , 'load!fullname' : [ name ]
                    , 'list!hidden'    : [ 'profile' ]
                    , 'load!gender'    : [ gender ]
                 }

  const result = dtShape ( dtst1, structure ).model ( () => ({as:'std'}))

  expect ( result.fullname ).to.be.a.equal ( 'Peter Naydenov' )
  expect ( result ).to.not.have.property ( 'gender' )
}) // it load: function





it ( 'Prefix Load: Overwrite values', () => {
  // TODO: Need atention after extend 'dt-toolbox' with 'storage.cancel'
      let result;
      let st1 = { 
                  profile : {
                                'name'    : 'Peter'
                              , 'sirname' : 'Naydenov'
                              , 'age'     : 42
                            }
              }

      let gender = 'male';
      let name = ['list','of','items'];
      
      let structure = {
                           'lastName'       : [ 'profile/sirname' , 'familyName' ]
                         , 'load!firstName'  : [ name ]
                         , 'firstName'       : [ 'profile/name', 'firstName' ]
                         , 'list!hidden'    : [ 'profile' ]
                         , 'load!gender'    : [ ['strange','value'], gender ]
                    }

      let dt = dtbox.init ( st1 );

      result = dtShape ( dt, structure ).model ( () => ({as:'std'}))
      expect ( result ).to.have.property ( 'lastName' )
      expect ( result ).to.have.property ( 'firstName' )
      expect ( result['firstName'] ).to.be.equal ( 'Peter' )
      expect ( result ).to.have.property ( 'gender' )
      expect ( result['gender'] ).to.be.equal ('male')
}) // it load





it ( 'Update value failure' , () => {
   // * If update requested but there is no new data
  let result;

  let st1 = { 
                profile : {
                              'name'    : 'Peter'
                            , 'sirname' : 'Dimitrov'
                            , 'age'     : 42
                          }
            }

    let n = 'Yordan';

    let structure = {
                        'name/lastName'  : [ 'profile/sirname' , 'familyName' ]
                      , 'load!name/firstName' : [ n ]
                      , 'fold!name/firstName' : [ 'fail' ]
                      , 'fold!hidden'    : [ 'age'  ]
                   }
  let dt = dtbox.init ( st1 );
  result = dtShape ( dt, structure ).model ( () => ({as:'std'}))

  expect ( result['name'] ).to.have.property( 'firstName' )
  expect ( result['name'] ).to.have.property( 'lastName'  )

  expect ( result['name']['firstName'] ).to.be.equal ( 'Yordan'   )
  expect ( result['name']['lastName']  ).to.be.equal ( 'Dimitrov' )
  expect ( result['hidden']['age']  ).to.be.equal ( 42 )

}) // it update failure




it ( 'Update value succeed', () => {
      let result;
      let 
          st1 = { 
                    profile : {
                                  'name'    : 'Peter'
                                , 'sirname' : 'Dimitrov'
                                , 'age'     : 42
                              }
                }
        , n = ['Yordan','Ivan']
        , structure = {
                             'name/lastName'  : [ 'profile/sirname' , 'familyName' ]
                           , 'load!name/firstName' : [ n ]
                           , 'fold!name/firstName' : [ 'profile/name' ]
                           , 'fold!hidden'    : [ 'age'  ]
                      }
        ;

      let dt = dtbox.init ( st1 );
      result = dtShape ( dt, structure ).model ( () => ({as:'std'}))

      expect ( result['name'] ).to.have.property( 'firstName' )
      expect ( result['name'] ).to.have.property( 'lastName'  )

      expect ( result['name']['firstName']['name'] ).to.be.equal ( 'Peter'   )
      expect ( result['name']['lastName']  ).to.be.equal ( 'Dimitrov' )
      expect ( result['hidden']['age']  ).to.be.equal ( 42 )
}) // it update succeed



it ( 'getDTtoolbox', () => {
  const box = dtShape.getDTtoolbox();
  expect ( box ).is.deep.equal ( dtbox )
}) // it getDTtoolbox



it ( 'Only real values: null, undefined and empty structures are ignored', () => {
  const dt = dtbox.init ({
                            name    : 'Peter'
                          , nick    : null
                          , alias   : undefined
                          , obj     : {}
                          , arr     : []
                          , profile : { age: 42, phone: null }
                          , scores  : [ 1, null, 3 ]
                          , zero    : 0
                      });
  const result = dtShape ( dt, {
                                  'name'      : [ 'name', 'nick', 'alias', 'obj', 'arr' ]   // Not overwritten by non-values
                                , 'missing'   : [ 'nick', 'alias', 'obj', 'arr' ]           // No real value: key is dropped
                                , 'zero'      : [ 'name', 'zero' ]                          // 0 is a real value
                                , 'list!all'  : [ 'name', 'nick', 'alias', 'obj', 'arr' ]
                                , 'fold!f'    : [ 'name', 'nick', 'alias' ]
                                , 'profile'   : [ 'profile' ]                               // Copy without null properties
                                , 'scores'    : [ 'scores' ]
                                , 'load!last' : [ 'value', null, undefined, () => null, {}, [] ]
                                , 'load!none' : [ null, () => undefined ]
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({
                                      name    : 'Peter'
                                    , zero    : 0
                                    , all     : [ 'Peter' ]
                                    , f       : { name: 'Peter' }
                                    , profile : { age: 42 }
                                    , scores  : [ 1, null, 3 ]   // Arrays keep positions
                                    , last    : 'value'
                                })
}) // it only real values



it ( 'Date and RegExp are values', () => {
  const 
        date = new Date ( '2020-01-01' )
      , re   = /a+/g
      , dt   = dtbox.init ({ date, re, profile: { born: date } })
      ;
  const result = dtShape ( dt, {
                                  'created'      : [ 'date' ]
                                , 'profile/born' : [ 'profile/born' ]
                                , 'fold!rules'   : [ 're' ]
                                , 'load!now'     : [ () => date ]
                            }).model ( () => ({as:'std'}) )
  expect ( result.created ).to.be.instanceOf ( Date )
  expect ( result.created.getTime() ).to.be.equal ( date.getTime() )
  expect ( result.profile.born ).to.be.instanceOf ( Date )
  expect ( result.rules.re ).to.be.instanceOf ( RegExp )
  expect ( result.now ).to.be.instanceOf ( Date )
}) // it date and regexp



it ( 'Empty objects and arrays in list and fold', () => {
  const dt = dtbox.init ({ obj: {}, arr: [], name: 'Peter' });
  const result = dtShape ( dt, {
                                  'fold!f' : [ 'obj', 'arr', 'name' ]
                                , 'list!l' : [ 'obj', 'arr', 'name' ]
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ f: { name: 'Peter' }, l: [ 'Peter' ] })
}) // it empty objects



it ( 'Copy nested objects and arrays', () => {
  const date = new Date ( '2020-01-01' );
  const dt = dtbox.init ({
                            profile : {
                                          name    : 'Peter'
                                        , address : { city: 'Sofia', geo: { lat: 42, lng: 23 } }
                                        , born    : date
                                        , empty   : {}
                                    }
                          , items   : [ 'a', { id: 1, tags: [ 'x', 'y' ] }, [ 1, [ 2, 3 ] ], null ]
                      });
  const result = dtShape ( dt, {
                                  'user'          : [ 'profile' ]
                                , 'items'         : [ 'items' ]
                                , 'geo'           : [ 'profile/address/geo' ]
                                , 'list!profile'  : [ 'profile' ]
                                , 'fold!address'  : [ 'profile/address' ]
                            }).model ( () => ({as:'std'}) )
  expect ( result.user ).to.deep.equal ({
                                          name    : 'Peter'
                                        , address : { city: 'Sofia', geo: { lat: 42, lng: 23 } }
                                        , born    : date
                                    })
  expect ( result.user.born ).to.be.instanceOf ( Date )
  expect ( result.items ).to.deep.equal ([ 'a', { id: 1, tags: [ 'x', 'y' ] }, [ 1, [ 2, 3 ] ], null ])
  expect ( result.geo ).to.deep.equal ({ lat: 42, lng: 23 })
  expect ( result.profile ).to.deep.equal ([ 'Peter', date, { city: 'Sofia', geo: { lat: 42, lng: 23 } } ])
  expect ( result.address ).to.deep.equal ({ city: 'Sofia', geo: { lat: 42, lng: 23 } })
}) // it copy nested



it ( 'Output paths: objects are merged, later keys win', () => {
  const dt = dtbox.init ({ name: 'Peter', age: 42, meta: { a: 1, b: 2 } });
  const result = dtShape ( dt, {
                                  'profile/name'  : [ 'name' ]
                                , 'profile'       : [ 'meta' ]   // Merged with profile/name
                                , 'x/name'        : [ 'name' ]
                                , 'y/x/age'       : [ 'age' ]    // 'x' here is not the top-level 'x'
                                , 'v/a'           : [ 'name' ]
                                , 'v'             : [ 'age' ]    // Later key wins
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({
                                      profile : { name: 'Peter', a: 1, b: 2 }
                                    , x       : { name: 'Peter' }
                                    , y       : { x: { age: 42 } }
                                    , v       : 42
                                })
}) // it output paths



it ( 'Load objects are copied, not changed', () => {
  const 
        external = { a: 1, nested: { b: 2, none: null } }
      , dt = dtbox.init ({ name: 'Peter' })
      ;
  const result = dtShape ( dt, {
                                  'load!ext'  : [ external ]
                                , 'ext/name'  : [ 'name' ]
                                , 'ext/nested/c' : [ 'name' ]
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ ext: { a: 1, nested: { b: 2, c: 'Peter' }, name: 'Peter' } })
  expect ( external ).to.deep.equal ({ a: 1, nested: { b: 2, none: null } })
}) // it load objects copied



it ( 'Result is a dt-object', () => {
  const dt = dtbox.init ({ profile: { name: 'Peter', tags: [ 'a', 'b' ] } });
  const result = dtShape ( dt, { user: [ 'profile' ] });
  expect ( result.model ( () => ({ as: 'breadcrumbs' }) ) ).to.deep.equal ({
                                                                              'user/name'   : 'Peter'
                                                                            , 'user/tags/0' : 'a'
                                                                            , 'user/tags/1' : 'b'
                                                                        })
  expect ( result.copy () ).to.deep.equal ({ user: { name: 'Peter', tags: [ 'a', 'b' ] } })
  expect ( result.index ( 'root/user/tags' ) ).to.not.be.null
}) // it result is dt-object



it ( 'Defaults: keep all keys', () => {
  const shape = {
                    'name'        : [ 'firstName' ]
                  , 'profile/age' : [ 'age' ]
                  , 'list!tags'   : [ 'tags' ]
                  , 'fold!meta'   : [ 'm1' ]
                  , 'nick'        : [ 'nick' ]
                  , 'load!role'   : [ () => undefined ]
              };
  const defaults = { name: 'Unknown', 'profile/age': 0, tags: [], meta: {}, nick: null, role: 'guest' };

  const empty = dtShape ( dtbox.init ({}), shape, defaults ).model ( () => ({as:'std'}) )
  expect ( empty ).to.deep.equal ({ name: 'Unknown', profile: { age: 0 }, tags: [], meta: {}, nick: null, role: 'guest' })

  const full = dtShape ( dtbox.init ({ firstName: 'Peter', age: 42, tags: [ 'a' ], m1: 1, nick: null }), shape, defaults ).model ( () => ({as:'std'}) )
  expect ( full ).to.deep.equal ({ name: 'Peter', profile: { age: 42 }, tags: [ 'a' ], meta: { m1: 1 }, nick: null, role: 'guest' })

  expect ( defaults ).to.deep.equal ({ name: 'Unknown', 'profile/age': 0, tags: [], meta: {}, nick: null, role: 'guest' })
}) // it defaults



it ( 'Defaults: objects are merged with the shape result', () => {
  const dt = dtbox.init ({ name: 'Peter' });
  const result = dtShape ( dt, { 'profile/name': [ 'name' ] }, { profile: { name: '', age: 0 }, 'list!extra': [ 1 ] }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ profile: { name: 'Peter', age: 0 }, extra: [ 1 ] })
}) // it defaults merge



it ( 'Defaults: shape values are not changed, key order follows the shape', () => {
  const dt = dtbox.init ({ a: 1, age: 5 });
  const result = dtShape ( dt, { a: [ 'a' ], b: [ 'b' ], v: [ 'age' ] }, { b: 'default', v: 0, 'v/x': 1 }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ a: 1, b: 'default', v: 5 })
  expect ( Object.keys ( result ) ).to.deep.equal ([ 'a', 'b', 'v' ])
}) // it defaults order



it ( 'Arrays: plain key keeps positions, list! makes a compact list', () => {
  const dt = dtbox.init ({ coords: [ 1, null, 3, undefined ], pairs: [ [ 1, null ], [ 2, 3 ] ], none: [ null, null ], x: [ 5 ] });
  const result = dtShape ( dt, {
                                  'coords'      : [ 'coords' ]
                                , 'list!values' : [ 'coords' ]
                                , 'pairs'       : [ 'pairs' ]
                                , 'list!pairs2' : [ 'pairs' ]
                                , 'only'        : [ 'x', 'none' ]   // Array of nulls is not a value
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({
                                      coords : [ 1, null, 3, null ]
                                    , values : [ 1, 3 ]
                                    , pairs  : [ [ 1, null ], [ 2, 3 ] ]
                                    , pairs2 : [ [ 1, null ], [ 2, 3 ] ]   // Inner arrays keep positions
                                    , only   : [ 5 ]
                                })
}) // it arrays positions



it ( 'Arrays: defaults fill positions', () => {
  const 
        shape = { coords: [ 'coords' ] }
      , run = ( data, defaults ) => dtShape ( dtbox.init ( data ), shape, defaults ).model ( () => ({as:'std'}) )
      ;
  // Whole array as a template
  expect ( run ({ coords: [ 1, null, 3 ] }, { coords: [ 0, 0, 0, 0 ] }) ).to.deep.equal ({ coords: [ 1, 0, 3, 0 ] })
  expect ( run ({ coords: [ 1, 2, 3, 4, 5, 6 ] }, { coords: [ 0, 0, 0, 0 ] }) ).to.deep.equal ({ coords: [ 1, 2, 3, 4, 5, 6 ] })
  expect ( run ({}, { coords: [ 0, 0, 0, 0 ] }) ).to.deep.equal ({ coords: [ 0, 0, 0, 0 ] })
  // Specific position
  expect ( run ({ coords: [ 1, null, null, 4 ] }, { 'coords/2': 0 }) ).to.deep.equal ({ coords: [ 1, null, 0, 4 ] })
  expect ( run ({ coords: [ 1, 2, 3, 4 ] }, { 'coords/2': 0 }) ).to.deep.equal ({ coords: [ 1, 2, 3, 4 ] })
  expect ( run ({ coords: [ 1 ] }, { 'coords/3': 0 }) ).to.deep.equal ({ coords: [ 1, null, null, 0 ] })
  expect ( run ({}, { 'coords/2': 0 }) ).to.deep.equal ({ coords: [ null, null, 0 ] })
  // Template and specific position together: the specific default wins, in any order
  expect ( run ({}, { coords: [ 0, 0, 0, 0 ], 'coords/3': 1 }) ).to.deep.equal ({ coords: [ 0, 0, 0, 1 ] })
  expect ( run ({}, { 'coords/3': 1, coords: [ 0, 0, 0, 0 ] }) ).to.deep.equal ({ coords: [ 0, 0, 0, 1 ] })
  expect ( run ({ coords: [ 5 ] }, { coords: [ 0, 0, 0, 0 ], 'coords/3': 1 }) ).to.deep.equal ({ coords: [ 5, 0, 0, 1 ] })
}) // it arrays defaults



it ( 'Arrays: build an array from separate fields', () => {
  const run = data => dtShape ( dtbox.init ( data ), { 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] }, { coords: [ 0, 0 ] }).model ( () => ({as:'std'}) )
  expect ( run ({ lat: 42, lng: 23 }) ).to.deep.equal ({ coords: [ 42, 23 ] })
  expect ( run ({ lng: 23 }) ).to.deep.equal ({ coords: [ 0, 23 ] })
  expect ( run ({}) ).to.deep.equal ({ coords: [ 0, 0 ] })
}) // it arrays from fields



it ( 'Copied objects are merged deeply', () => {
  const dt = dtbox.init ({ a: { info: { x: 1 }, name: 'A' } });
  const result = dtShape ( dt, {
                                  'u'      : [ 'a' ]
                                , 'load!u' : [ { info: { y: 2 } } ]   // Object on the same path: merged
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ u: { name: 'A', info: { x: 1, y: 2 } } })
}) // it copied objects merged



it ( 'Defaults fill copied objects deeply', () => {
  const dt = dtbox.init ({ p: { address: { city: 'Sofia' } } });
  const result = dtShape ( dt, { p: [ 'p' ] }, { p: { address: { city: '', zip: '0000' }, phone: '' } }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ p: { phone: '', address: { city: 'Sofia', zip: '0000' } } })
}) // it defaults fill copied objects



it ( 'Source from a DT-model with array gaps', () => {
  const dt = dtbox.load ([
                              [ 'root', {}, 'root', [ 'root/l' ] ]
                            , [ 'l', [], 'root/l', [ 'root/l/2' ] ]
                            , [ '2', { x: 1 }, 'root/l/2', [] ]
                        ]);
  const result = dtShape ( dt, { list: [ 'l' ] }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ list: [ null, null, { x: 1 } ] })
}) // it array gaps



it ( 'Source dt-object from old dt-toolbox: clear error', () => {
  // A store that can't attach dt-lines by path, like dt-toolbox before 8.1
  const oldDt = {
                  query : fn => {
                              fn ({ look: () => {}, set: () => {} })
                              return { index: () => [ 'root', {}, 'root', [] ] }
                          }
              };
  expect ( () => dtShape ( oldDt, { 'load!x': [ { a: 1 } ] }) ).to.throw ( 'dt-toolbox 8.1 or newer' )
}) // it old dt-toolbox



it ( 'Source paths: exact place, array positions, missing parent', () => {
  const dt = dtbox.init ({ name: 'Top', p: { q: { name: 'Deep' } }, coords: [ 42, 23 ], l: [ { id: 1 }, { id: 2 } ], m: [ [ 1, 2 ], [ 3, 4 ] ] });
  const result = dtShape ( dt, {
                                  'deepName'  : [ 'p/q/name' ]
                                , 'lat'       : [ 'coords/0' ]
                                , 'lng'       : [ 'coords/1' ]
                                , 'outside'   : [ 'coords/5' ]
                                , 'id'        : [ 'l/1/id' ]
                                , 'first'     : [ 'l/0' ]
                                , 'cell'      : [ 'm/1/0' ]
                                , 'missing'   : [ 'nope/name' ]   // Missing parent: not found
                                , 'list!pos'  : [ 'coords/0', 'coords/1' ]
                            }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ deepName: 'Deep', lat: 42, lng: 23, id: 2, cell: 3, first: { id: 1 }, pos: [ 42, 23 ] })
}) // it source paths



it ( 'Source paths: a key without a path searches the whole source', () => {
  const dt = dtbox.init ({ name: 'Top', p: { q: { name: 'Deep' } } });
  expect ( dtShape ( dt, { v: [ 'name' ] }).model ( () => ({as:'std'}) ) ).to.deep.equal ({ v: 'Deep' })   // The last match wins
  expect ( dtShape ( dt, { 'list!v': [ 'name' ] }).model ( () => ({as:'std'}) ) ).to.deep.equal ({ v: [ 'Top', 'Deep' ] })
}) // it bare key search



it ( 'Clear errors for wrong arguments', () => {
  const dt = dtbox.init ({ a: 1 });
  expect ( () => dtShape ( { a: 1 }, { v: [ 'a' ] }) ).to.throw ( 'The source must be a dt-object' )
  expect ( () => dtShape ( dt, 'v' ) ).to.throw ( 'The shape must be an object' )
  expect ( () => dtShape ( dt, { v: 'a' }) ).to.throw ( "Shape key 'v' must have a list of sources" )
  expect ( () => dtShape ( dt, { 'lsit!v': [ 'a' ] }) ).to.throw ( "Unknown prefix 'lsit!'" )
  expect ( () => dtShape ( dt, { 'list!fold!v': [ 'a' ] }) ).to.throw ( 'more than one prefix' )
  expect ( () => dtShape ( dt, { v: [ 1 ] }) ).to.throw ( 'source paths must be strings' )
  expect ( () => dtShape ( dt, { v: [ 'a' ] }, 'x' ) ).to.throw ( 'Defaults must be an object' )
  expect ( () => dtShape ( dt, { v: [ 'a' ] }, null ) ).to.throw ( 'Defaults must be an object' )
  expect ( () => dtShape ( dt, { 'load!v': [ 1, () => 2 ] }) ).to.not.throw ()
}) // it clear errors



it ( 'Without defaults: missing keys are not in the result', () => {
  const result = dtShape ( dtbox.init ({ a: 1 }), { x: [ 'missing' ], y: [ 'a' ] }).model ( () => ({as:'std'}) )
  expect ( result ).to.deep.equal ({ y: 1 })
  expect ( result ).to.not.have.property ( 'x' )
}) // it without defaults

}) // describe




