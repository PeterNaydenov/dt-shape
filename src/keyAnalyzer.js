/**
 * Splits a shape key into a result path and an action.
 * @param {string} k - Shape key, e.g. `'profile/name'` or `'list!family'`.
 * @returns {[ string[], string | null ]} Result path segments and action (`'list'`, `'fold'`, `'load'`) or `null`.
 */
function keyAnalyzer ( k ) {
    let 
          key = null
        , action = null
        ;
    if ( k.includes('!') )   [action, key] = k.split ( '!' )
    else                     key = k
    return [ key.split('/'), action ]
} // keyAnalyzer func.



export default keyAnalyzer


