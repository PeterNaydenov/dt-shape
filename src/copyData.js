import isStructure from './isStructure.js'



/**
 * Deep copy of objects and arrays. All values are kept, including `null`, `undefined` and empty structures.
 * Other values are returned as they are.
 * @param {unknown} value - Value to copy.
 * @returns {unknown} The copy.
 */
function copyData ( value ) {
    if ( !isStructure ( value ) )   return value
    if ( value instanceof Array )   return value.map ( copyData )
    return Object.fromEntries ( 
                    Object.entries ( /** @type {object} */ ( value ) )
                          .map ( ([ k, v ]) => [ k, copyData ( v ) ] )
                )
} // copyData func.



export default copyData


