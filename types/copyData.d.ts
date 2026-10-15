/**
 * Deep copy of objects and arrays. All values are kept, including `null`, `undefined` and empty structures.
 * Other values are returned as they are.
 * @param {unknown} value - Value to copy.
 * @returns {unknown} The copy.
 */
declare function copyData(value: unknown): unknown;
export default copyData;
