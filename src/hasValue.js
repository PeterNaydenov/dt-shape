import isStructure from './isStructure.js'
import SourceRef   from './sourceRef.js'



/**
 * Checks if the value is a real value. `null`, `undefined`, empty objects and empty arrays are not values.
 * An object or array is a value if at least one of its members is a value.
 * @param {unknown} value - Value to check.
 * @returns {boolean} True if the value is a real value.
 */
function hasValue ( value ) {
    if ( value == null )                    return false
    if ( value instanceof SourceRef )       return value.hasValue ()
    if ( isStructure(value) )   return Object.values ( /** @type {object} */ ( value ) ).some ( hasValue )
    return true
} // hasValue func.



export default hasValue


