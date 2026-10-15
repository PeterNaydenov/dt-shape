import hasValue  from './hasValue.js'
import cleanCopy from './cleanCopy.js'



/**
 * Resolves the value of a `load!` shape key. Functions are called without arguments.
 * The last real value wins. `null`, `undefined`, empty objects and empty arrays are ignored.
 * Objects and arrays are copied without non-values.
 * @param {readonly unknown[]} search - Values or functions that return a value.
 * @returns {unknown} The resolved value, or `undefined` if there is no real value.
 */
function load ( search ) {
    let result;
    search.forEach ( item => {
                if ( typeof ( item ) === 'function' )   item = item ()
                item = cleanCopy ( item )
                if ( hasValue ( item ) )                result = item
        }) // for each search
    return result
} // load func.



export default load


