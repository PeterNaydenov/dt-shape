'use strict'

var		 
		  dtbox    = require ( 'dt-toolbox' )
		, shape = require ( '../dt-shape')
		, chai     = require ( 'chai'   )
		, expect   = require ( 'chai'   ).expect
		;



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

  dtbox
      .init ( test )
      .spreadAll ( 'dt', dt =>  result = shape(dt, newStructure).build()   )
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
                        'firstName'         : ['profile/name']
                      , 'lastName'          : ['profile/sirname']
                      , 'personal-data/age' : ['profile/age']
                   }
    dtbox
      .init ( test )
      .spreadAll ( 'dt', dt => result = shape(dt, structure).build() )
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
	let st1 = { 
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
                        'firstName'         : ['profile/name', 'firstName' ]
                      , 'lastName'          : [ 'profile/sirname' , 'familyName' ]
                      , 'personal-data/age' : [ 'profile/age']
                   }

   dtbox
       .init ( st1 )
       .spreadAll ( 'dt', dt => result1 = shape(dt, structure).build()   )

   dtbox
       .init ( st2 )
       .spreadAll ( 'dt', dt => result2 = shape(dt, structure).build()   )
/*
    Expected result for both should be:
    {
        firstName : 'Peter'
      , lastName  : 'Naydenov'
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





it ( 'Operation: Fold' , () => {
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
   dtbox
      .init( st1 )
      .spreadAll ( 'dt', dt => {
                                   result = shape(dt, structure).build()
                    })
   
   expect ( result ).to.have.property ( 'name' )

   expect ( result['name'] ).to.have.property ( 'firstName' )
   expect ( result['name'] ).to.have.property ( 'lastName' )
   expect ( result['name']['firstName'] ).to.be.equal ( 'Peter' )
   
   expect ( result['hidden'] ).to.be.an ( 'object' )
   expect ( result['hidden'] ).to.have.property ( 'age' )
   expect ( result['hidden']['age'] ).to.be.equal ( 42 )

}) // it fold






it ( 'Operation: List' , () => {
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

   dtbox
      .init( st1 )
      .spreadAll ( 'dt', dt => {
                                   result = shape(dt, structure).build()
                    })
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



}) // describe




