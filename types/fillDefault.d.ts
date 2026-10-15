/**
 * Writes a default value in the result on the given path, only where the result has no value.
 * Existing values are not changed. Default objects and arrays fill the empty places of existing ones.
 * Missing containers are created: an array when the next path segment is an index, an object otherwise.
 * @param {Record<string, unknown> | unknown[]} result - The result object.
 * @param {string[]} keyList - Path segments, e.g. `[ 'profile', 'age' ]`.
 * @param {unknown} value - Default value. Used as it is, including `null`, `[]` and `{}`.
 * @returns {void}
 */
declare function fillDefault(result: Record<string, unknown> | unknown[], keyList: string[], value: unknown): void;
export default fillDefault;
