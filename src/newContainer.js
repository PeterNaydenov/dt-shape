/**
 * Creates an empty container for the next path segment: an array for an index (e.g. `'2'`), an object otherwise.
 * @param {string} nextKey - The next path segment.
 * @returns {Record<string, unknown> | unknown[]} New empty array or object.
 */
function newContainer ( nextKey ) {
    return /^\d+$/.test ( nextKey ) ? [] : {}
} // newContainer func.



export default newContainer


