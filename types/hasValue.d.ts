/**
 * Checks if the value is a real value. `null`, `undefined`, empty objects and empty arrays are not values.
 * An object or array is a value if at least one of its members is a value.
 * @param {unknown} value - Value to check.
 * @returns {boolean} True if the value is a real value.
 */
declare function hasValue(value: unknown): boolean;
export default hasValue;
