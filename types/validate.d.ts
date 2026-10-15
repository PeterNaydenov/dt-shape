/**
 * Checks the arguments of dtShape. Throws an error with a clear message if something is wrong.
 * @param {unknown} dt - Source data. Must be a dt-object.
 * @param {unknown} shape - The data-shape. Must be an object.
 * @param {unknown} defaults - Default values. Must be an object.
 * @returns {void}
 */
declare function validate(dt: unknown, shape: unknown, defaults: unknown): void;
export default validate;
