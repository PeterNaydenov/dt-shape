import SourceRef from './sourceRef.js'



/**
 * Checks if the value is a data structure (object or array).
 * Date and RegExp are values, like in dt-toolbox. Source references are not structures: open them with `resolve` first.
 * @param {unknown} value - Value to check.
 * @returns {boolean} True if the value is an object or array.
 */
function isStructure ( value ) {
    if ( value == null || typeof(value) !== 'object' )          return false
    if ( value instanceof Date || value instanceof RegExp )   return false
    if ( value instanceof SourceRef )                         return false
    return true
} // isStructure func.



export default isStructure


