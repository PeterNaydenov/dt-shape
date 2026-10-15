/**
 * Checks if the value is a data structure (object or array).
 * Date and RegExp are values, like in dt-toolbox. Source references are not structures: open them with `resolve` first.
 * @param {unknown} value - Value to check.
 * @returns {boolean} True if the value is an object or array.
 */
declare function isStructure(value: unknown): boolean;
export default isStructure;
