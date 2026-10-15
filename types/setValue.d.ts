/**
 * Writes a value in the result on the given path. Missing containers are created:
 * an array when the next path segment is an index (e.g. `'coords/0'`), an object otherwise.
 * Objects are merged with an existing object on the same path. Other values replace the existing value.
 * @param {Record<string, unknown> | unknown[]} result - The result object.
 * @param {string[]} keyList - Path segments, e.g. `[ 'profile', 'name' ]`.
 * @param {unknown} value - Value to write.
 * @returns {void}
 */
declare function setValue(result: Record<string, unknown> | unknown[], keyList: string[], value: unknown): void;
export default setValue;
