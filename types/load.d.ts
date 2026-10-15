/**
 * Resolves the value of a `load!` shape key. Functions are called without arguments.
 * The last real value wins. `null`, `undefined`, empty objects and empty arrays are ignored.
 * Objects and arrays are copied without non-values.
 * @param {readonly unknown[]} search - Values or functions that return a value.
 * @returns {unknown} The resolved value, or `undefined` if there is no real value.
 */
declare function load(search: readonly unknown[]): unknown;
export default load;
