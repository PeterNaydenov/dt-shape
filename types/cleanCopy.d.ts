/**
 * Deep copy of objects and arrays without non-values (`null`, `undefined`, empty objects and empty arrays).
 * Object properties without a real value are removed. Arrays keep their positions:
 * a position without a real value becomes `null`. Other values are returned as they are.
 * @param {unknown} value - Value to copy.
 * @returns {unknown} The copy.
 */
declare function cleanCopy(value: unknown): unknown;
export default cleanCopy;
