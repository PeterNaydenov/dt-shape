/**
 * @import { DtStore } from 'dt-toolbox'
 */
import type { DtStore } from 'dt-toolbox';
export type SourceLine = {
    /**
     * - Primitive values of the dt-line.
     */
    flatData: Record<string, unknown> | unknown[];
    /**
     * - Breadcrumbs of the child dt-lines. `null` until the subtree is read.
     */
    children: string[] | null;
    /**
     * - Cached: the dt-line or a descendant has a real value.
     */
    hasValue?: boolean;
};
/**
 * @typedef {Object} SourceLine
 * @property {Record<string, unknown> | unknown[]} flatData - Primitive values of the dt-line.
 * @property {string[] | null} children - Breadcrumbs of the child dt-lines. `null` until the subtree is read.
 * @property {boolean} [hasValue] - Cached: the dt-line or a descendant has a real value.
 */
/**
 * Reads the source dt-lines with the store, only when they are needed. Read dt-lines are cached.
 */
declare class Source {
    store: DtStore;
    /** @type {Map<string, SourceLine | null>} */
    lines: Map<string, SourceLine | null>;
    /**
     * @param {DtStore} store - The query store.
     */
    constructor(store: DtStore);
    /**
     * One dt-line by breadcrumbs.
     * @param {string} breadcrumbs - Breadcrumbs of the dt-line, e.g. `'root/profile'`.
     * @returns {SourceLine | null} The dt-line, or `null` if it doesn't exist.
     */
    line(breadcrumbs: string): SourceLine | null;
    /**
     * A dt-line with the list of its children. Reads the whole subtree of the dt-line once.
     * @param {string} breadcrumbs - Breadcrumbs of the dt-line.
     * @returns {SourceLine} The dt-line with `children`.
     */
    tree(breadcrumbs: string): SourceLine;
    /**
     * Visits the flat data of every source dt-line, in the order of the DT-model.
     * @param {( flatData: Record<string, unknown> | unknown[] ) => void} fn - Called once per dt-line.
     * @returns {void}
     */
    scan(fn: (flatData: Record<string, unknown> | unknown[]) => void): void;
}
export default Source;
