import SourceRef   from './sourceRef.js'
import isStructure from './isStructure.js'
import resolve     from './resolve.js'

/**
 * @import { DtStore } from 'dt-toolbox'
 */



/**
 * Checks if the value goes to a separate dt-line: an object, an array, or a source reference.
 * @param {unknown} value - Value to check.
 * @returns {boolean} True for nested data.
 */
function isNested ( value ) {
    return isStructure ( value ) || ( value instanceof SourceRef )
} // isNested func.



/**
 * Writes the result as dt-lines of the query result. Each object or array is a dt-line on its path.
 * @param {DtStore} store - The query store.
 * @param {string} path - Breadcrumbs of the dt-line, e.g. `'root/profile'`.
 * @param {unknown} node - Object, array or source reference.
 * @returns {number} Number of nested dt-lines attached to this dt-line.
 */
function emit ( store, path, node ) {
    const 
          data = /** @type {Record<string, unknown> | unknown[]} */ ( resolve ( node ) )
        , entries = Object.entries ( data )
        , flatData = ( data instanceof Array )
                        ? data.map ( v => isNested ( v ) ? null : v )   // Place of a nested dt-line
                        : Object.fromEntries ( entries.filter ( ([ , v ]) => !isNested ( v ) ) )
        ;
    store.set ( path, flatData )
    const nested = entries.filter ( ([ , v ]) => isNested ( v ) );
    nested.forEach ( ([ k, v ]) => emit ( store, `${path}/${k}`, v ) )
    return nested.length
} // emit func.



export default emit


