/**
 * Writes a value in an object or array. Array positions before the index get `null`, so arrays have no gaps.
 * @param {Record<string, unknown> | unknown[]} parent - Object or array to change.
 * @param {string} key - Property name or array index.
 * @param {unknown} value - Value to write.
 * @returns {void}
 */
function place ( parent, key, value ) {
    if ( parent instanceof Array && /^\d+$/.test ( key ) ) {
                const index = Number ( key );
                while ( parent.length < index )   parent.push ( null )
        }
    /** @type {Record<string, unknown>} */ ( parent )[key] = value
} // place func.



export default place


