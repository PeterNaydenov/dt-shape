/**
 * @import Source from './source.js'
 */
import type Source from './source.js';
/**
 * Reference to a dt-line of the source data and its descendants.
 * Copied objects and arrays stay as references until the result is written as dt-lines.
 */
declare class SourceRef {
    source: Source;
    breadcrumbs: string;
    /**
     * @param {Source} source - Reader of the source dt-lines.
     * @param {string} breadcrumbs - Breadcrumbs of the referenced dt-line.
     */
    constructor(source: Source, breadcrumbs: string);
    /**
     * Checks if the dt-line or a descendant has a real value (not `null` or `undefined`).
     * @returns {boolean} True if there is a real value.
     */
    hasValue(): boolean;
    /**
     * Opens the reference one level: an object or array with the primitive values of the dt-line
     * and references to the child dt-lines. Object properties without a real value are removed.
     * Arrays keep their positions: a position without a real value is `null`.
     * @returns {Record<string, unknown> | unknown[]} Object or array.
     */
    expand(): Record<string, unknown> | unknown[];
}
export default SourceRef;
