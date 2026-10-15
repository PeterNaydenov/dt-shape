import SourceRef from './sourceRef.js'



/**
 * Opens a source reference one level. Other values are returned as they are.
 * @param {unknown} value - Value or source reference.
 * @returns {unknown} The value.
 */
function resolve ( value ) {
    return ( value instanceof SourceRef ) ? value.expand () : value
} // resolve func.



export default resolve


