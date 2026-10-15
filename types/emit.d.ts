import type { DtStore } from 'dt-toolbox';
/**
 * Writes the result as dt-lines of the query result. Each object or array is a dt-line on its path.
 * @param {DtStore} store - The query store.
 * @param {string} path - Breadcrumbs of the dt-line, e.g. `'root/profile'`.
 * @param {unknown} node - Object, array or source reference.
 * @returns {number} Number of nested dt-lines attached to this dt-line.
 */
declare function emit(store: DtStore, path: string, node: unknown): number;
export default emit;
