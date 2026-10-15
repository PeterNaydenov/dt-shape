/**
 * Creates an empty container for the next path segment: an array for an index (e.g. `'2'`), an object otherwise.
 * @param {string} nextKey - The next path segment.
 * @returns {Record<string, unknown> | unknown[]} New empty array or object.
 */
declare function newContainer(nextKey: string): Record<string, unknown> | unknown[];
export default newContainer;
