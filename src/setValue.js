import isStructure  from './isStructure.js'
import newContainer from './newContainer.js'
import place        from './place.js'
import resolve      from './resolve.js'



/**
 * Checks if the value is an object, but not an array.
 * @param {unknown} value - Value to check.
 * @returns {value is Record<string, unknown>} True for objects.
 */
function isObject ( value ) {
    return isStructure ( value ) && !( value instanceof Array )
} // isObject func.



/**
 * Deep merge of `source` into `target`. Objects are merged, other values replace the existing value.
 * @param {Record<string, unknown>} target - Object to change.
 * @param {Record<string, unknown>} source - Object with new values.
 * @returns {void}
 */
function merge ( target, source ) {
    Object.entries ( source ).forEach ( ([ k, v ]) => {
                const [ a, b ] = ( target[k] == null ) ? [ null, v ] : [ resolve ( target[k] ), resolve ( v ) ];   // Open source references to merge them
                if ( isObject ( a ) && isObject ( b ) ) {
                            target[k] = a
                            merge ( a, b )
                    }
                else   target[k] = v
        })
} // merge func.



/**
 * Writes a value in the result on the given path. Missing containers are created:
 * an array when the next path segment is an index (e.g. `'coords/0'`), an object otherwise.
 * Objects are merged with an existing object on the same path. Other values replace the existing value.
 * @param {Record<string, unknown> | unknown[]} result - The result object.
 * @param {string[]} keyList - Path segments, e.g. `[ 'profile', 'name' ]`.
 * @param {unknown} value - Value to write.
 * @returns {void}
 */
function setValue ( result, keyList, value ) {
    const spot = keyList[ keyList.length - 1 ];
    /** @type {Record<string, unknown>} */
    let parent = /** @type {Record<string, unknown>} */ ( result );
    keyList.slice ( 0, -1 ).forEach ( ( k, i ) => {
                parent[k] = resolve ( parent[k] )   // Open a source reference to write inside
                if ( !isStructure ( parent[k] ) )   place ( parent, k, newContainer ( keyList[i+1] ) )
                parent = /** @type {Record<string, unknown>} */ ( parent[k] )
        })
    const [ a, b ] = ( parent[spot] == null ) ? [ null, value ] : [ resolve ( parent[spot] ), resolve ( value ) ];
    if ( isObject ( a ) && isObject ( b ) ) {
                parent[spot] = a
                merge ( a, b )
        }
    else   place ( parent, spot, value )
} // setValue func.



export default setValue


