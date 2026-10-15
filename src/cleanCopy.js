import isStructure from './isStructure.js'
import hasValue    from './hasValue.js'



/**
 * Deep copy of objects and arrays without non-values (`null`, `undefined`, empty objects and empty arrays).
 * Object properties without a real value are removed. Arrays keep their positions:
 * a position without a real value becomes `null`. Other values are returned as they are.
 * @param {unknown} value - Value to copy.
 * @returns {unknown} The copy.
 */
function cleanCopy ( value ) {
    if ( !isStructure ( value ) )   return value
    if ( value instanceof Array )   return value.map ( item => {   // Positions are data. Keep them
                                                    const copy = cleanCopy ( item );
                                                    return hasValue ( copy ) ? copy : null
                                            })
    return Object.fromEntries ( 
                    Object.entries ( /** @type {object} */ ( value ) )
                          .map    ( ([ k, v ]) => [ k, cleanCopy ( v ) ] )
                          .filter ( ([ , v ]) => hasValue ( v ) )
                )
} // cleanCopy func.



export default cleanCopy


