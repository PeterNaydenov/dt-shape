import keyAnalyzer from './keyAnalyzer.js'



const PREFIXES = [ 'list', 'fold', 'load' ];



/**
 * Checks the arguments of dtShape. Throws an error with a clear message if something is wrong.
 * @param {unknown} dt - Source data. Must be a dt-object.
 * @param {unknown} shape - The data-shape. Must be an object.
 * @param {unknown} defaults - Default values. Must be an object.
 * @returns {void}
 */
function validate ( dt, shape, defaults ) {
    if ( dt == null || typeof /** @type {any} */ ( dt ).query !== 'function' ) {
                throw new Error ( 'dt-shape: The source must be a dt-object. Create it with dtShape.getDTtoolbox().init ( data ).' )
        }
    if ( shape == null || typeof shape !== 'object' ) {
                throw new Error ( 'dt-shape: The shape must be an object, e.g. { name: [ \'firstName\' ] }.' )
        }
    if ( defaults == null || typeof defaults !== 'object' || defaults instanceof Array ) {
                throw new Error ( 'dt-shape: Defaults must be an object, e.g. { name: \'Unknown\' }.' )
        }
    Object.entries ( shape ).forEach ( ([ k, list ]) => {
                const [ , action ] = keyAnalyzer ( k );
                if ( k.split ( '!' ).length > 2 ) {
                            throw new Error ( `dt-shape: Shape key '${k}' has more than one prefix.` )
                    }
                if ( action != null && !PREFIXES.includes ( action ) ) {
                            throw new Error ( `dt-shape: Unknown prefix '${action}!' in shape key '${k}'. Use 'list!', 'fold!' or 'load!'.` )
                    }
                if ( !( list instanceof Array ) ) {
                            throw new Error ( `dt-shape: Shape key '${k}' must have a list of sources, e.g. [ 'profile/name' ].` )
                    }
                if ( action !== 'load' && list.some ( el => typeof el !== 'string' ) ) {
                            throw new Error ( `dt-shape: Shape key '${k}' - source paths must be strings. Use 'load!${k.replace ( /^\w+!/, '' )}' for values and functions.` )
                    }
        })
} // validate func.



export default validate


