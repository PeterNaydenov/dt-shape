/**
 * Writes a value in an object or array. Array positions before the index get `null`, so arrays have no gaps.
 * @param {Record<string, unknown> | unknown[]} parent - Object or array to change.
 * @param {string} key - Property name or array index.
 * @param {unknown} value - Value to write.
 * @returns {void}
 */
declare function place(parent: Record<string, unknown> | unknown[], key: string, value: unknown): void;
export default place;
