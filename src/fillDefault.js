import isStructure  from './isStructure.js'
import copyData     from './copyData.js'
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
 * Checks if both values are objects, or both are arrays.
 * @param {unknown} a - First value.
 * @param {unknown} b - Second value.
 * @returns {boolean} True if the values are structures of the same kind.
 */
function sameKind ( a, b ) {
    return ( isObject ( a ) && isObject ( b ) ) || ( a instanceof Array && b instanceof Array )
} // sameKind func.



/**
 * Fills the empty places of `target` with values from `source`. Empty places are missing properties,
 * missing array positions, and positions with `null` or `undefined`. Objects and arrays are filled deeply.
 * @param {Record<string, unknown> | unknown[]} target - Object or array to change.
 * @param {Record<string, unknown> | unknown[]} source - Object or array with default values.
 * @returns {void}
 */
function fill ( target, source ) {
    const t = /** @type {Record<string, unknown>} */ ( target );
    Object.entries ( source ).forEach ( ([ k, v ]) => {
                if ( t[k] == null ) {
                            place ( target, k, copyData ( v ) )
                            return
                    }
                const existing = resolve ( t[k] );   // Open a source reference to fill it
                if ( sameKind ( existing, v ) ) {
                            t[k] = existing
                            fill ( /** @type {any} */ ( existing ), /** @type {any} */ ( v ) )
                    }
        })
} // fill func.



/**
 * Writes a default value in the result on the given path, only where the result has no value.
 * Existing values are not changed. Default objects and arrays fill the empty places of existing ones.
 * Missing containers are created: an array when the next path segment is an index, an object otherwise.
 * @param {Record<string, unknown> | unknown[]} result - The result object.
 * @param {string[]} keyList - Path segments, e.g. `[ 'profile', 'age' ]`.
 * @param {unknown} value - Default value. Used as it is, including `null`, `[]` and `{}`.
 * @returns {void}
 */
function fillDefault ( result, keyList, value ) {
    const spot = keyList[ keyList.length - 1 ];
    /** @type {Record<string, unknown>} */
    let parent = /** @type {Record<string, unknown>} */ ( result );
    for ( const [ i, k ] of keyList.slice ( 0, -1 ).entries () ) {
                if ( parent[k] == null )              place ( parent, k, newContainer ( keyList[i+1] ) )
                parent[k] = resolve ( parent[k] )   // Open a source reference to write inside
                if ( !isStructure ( parent[k] ) )   return   // The shape has a value here. Keep it
                parent = /** @type {Record<string, unknown>} */ ( parent[k] )
        }
    if ( parent[spot] == null ) {
                place ( parent, spot, copyData ( value ) )
                return
        }
    const existing = resolve ( parent[spot] );
    if ( sameKind ( existing, value ) ) {
                parent[spot] = existing
                fill ( /** @type {any} */ ( existing ), /** @type {any} */ ( value ) )
        }
} // fillDefault func.



export default fillDefault


