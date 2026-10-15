/**
 * Splits a shape key into a result path and an action.
 * @param {string} k - Shape key, e.g. `'profile/name'` or `'list!family'`.
 * @returns {[ string[], string | null ]} Result path segments and action (`'list'`, `'fold'`, `'load'`) or `null`.
 */
declare function keyAnalyzer(k: string): [string[], string | null];
export default keyAnalyzer;
