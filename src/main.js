'use strict'
/**
 * DT Shape
 *
 * Build data structures by using data-shapes. Shape keys are the property names of the result,
 * shape values are lists of sources where dtShape will search for data.
 */



/**
 * @typedef {import('dt-toolbox').DTObject} DTObject
 */

/**
 * @typedef {import('dt-toolbox').DtBox} DtBox
 */

/**
 * @import { DtStore } from 'dt-toolbox'
 */

/**
 * @typedef {Record<string, readonly unknown[]>} Shape
 */

/**
 * @typedef {Record<string, unknown>} Defaults
 */

/**
 * @template S
 * @typedef {{ [K in keyof S]: string extends K ? readonly unknown[] : K extends `load!${string}` ? readonly unknown[] : readonly string[] }} ShapeOf
 */



import dtbox       from 'dt-toolbox'   // Docs: https://github.com/PeterNaydenov/dt-toolbox
import load        from './load.js'
import keyAnalyzer from './keyAnalyzer.js'
import hasValue    from './hasValue.js'
import cleanCopy   from './cleanCopy.js'
import Source      from './source.js'
import SourceRef   from './sourceRef.js'
import emit        from './emit.js'
import setValue    from './setValue.js'
import fillDefault from './fillDefault.js'
import validate    from './validate.js'



/**
 * Build a new dt-object from the source dt-object, according to the data-shape.
 *
 * Shape keys are the property names of the result, shape values are lists of sources:
 * - `'name'`      - take the value from the source paths. The LAST source with a real value wins;
 * - `'a/b'`       - nested result: `{ a: { b: value } }`;
 * - `'fold!name'` - fold found properties into an object `{ key: value }`;
 * - `'list!name'` - collect found values into an array;
 * - `'load!name'` - load external data. Members are values or functions that return a value. The last real value wins.
 *
 * Source paths use `/` as a separator (e.g. `'profile/name'`). Only real values are used:
 * sources that are not found, `null`, `undefined`, empty objects and empty arrays are skipped.
 * If no source has a real value, the key is not in the result. Use `defaults` to keep the key.
 *
 * Defaults are values for output paths (e.g. `'profile/age'`), used when the shape finds no real value.
 * Defaults are taken as they are: `null`, `[]` and `{}` are valid defaults. Prefixes in default keys are ignored.
 * Array defaults fill empty positions: a whole array (`{ coords: [ 0, 0 ] }`) or a position (`{ 'coords/1': 0 }`).
 *
 * Copied arrays keep their positions: a position without a real value is `null`. Use `list!` for a compact list.
 * A number in an output path creates an array: `{ 'coords/0': [ 'lat' ], 'coords/1': [ 'lng' ] }`.
 *
 * @example
 * const dtbox  = dtShape.getDTtoolbox ()
 * const source = dtbox.init ({ profile: { name: 'Peter' } })
 * const result = dtShape ( source, { firstName: [ 'profile/name' ] }).model ( () => ({ as: 'std' }) )
 * // -> { firstName: 'Peter' }
 *
 * @example
 * // Keep all keys with defaults
 * dtShape ( source, { firstName: [ 'profile/name' ], age: [ 'profile/age' ], 'list!tags': [ 'tags' ] }, { age: 0, tags: [] })
 * // -> { firstName: 'Peter', age: 0, tags: [] }
 *
 * @template {ShapeOf<S>} S
 * @param {DTObject} dt - Source data as dt-object. Create it with `dtShape.getDTtoolbox().init ( data )`.
 * @param {S} shape - The data-shape. Validated per key: `load!` keys accept any values or functions, other keys accept lists of source paths.
 * @param {Defaults} [defaults] - Default values by output path. Optional.
 * @returns {DTObject} A new dt-object. Call `.model ( () => ({ as: 'std' }) )` to get a standard JS object.
 */
function dtShape ( dt , shape, defaults = {} ) {
            validate ( dt, shape, defaults )
            let rootChildren = 0;   // Nested dt-lines that the query attached to 'root'
            const result = dt.query ( store => { rootChildren = shapeQuery ( store, shape, defaults ) });
            // dt-toolbox before 8.1 can't attach dt-lines by path. The nested data would be lost
            if ( /** @type {import('dt-toolbox').DtLine} */ ( result.index ( 'root' ) )[3].length !== rootChildren ) {
                        throw new Error ( 'dt-shape: The source dt-object needs dt-toolbox 8.1 or newer. Create it with dtShape.getDTtoolbox().init ( data ).' )
                }
            return result
} // dtShape func.



/**
 * Query function of dtShape. Reads the source dt-lines and writes the result dt-lines with the store.
 * @param {DtStore} store - The query store.
 * @param {Record<string, readonly unknown[]> | unknown[]} shape - The data-shape.
 * @param {Defaults} defaults - Default values by output path.
 * @returns {number} Number of nested dt-lines attached to 'root'.
 */
function shapeQuery ( store, shape, defaults ) {
            const 
                  source = new Source ( store )   // Reads the source dt-lines when they are needed
                , result = ( shape instanceof Array ) ? [] : {}   // Copied objects and arrays stay as references to the source dt-lines
                , defaultList = Object.entries ( defaults )   // Specific paths first: defaults fill only empty places, so they win
                                      .map  ( ([ k, v ]) => /** @type {[ string, unknown ]} */ ([ keyAnalyzer ( k )[0].join ( '/' ), v ]) )
                                      .sort ( ( a, b ) => b[0].split ( '/' ).length - a[0].split ( '/' ).length )
                ;

            Object.entries ( shape ).forEach ( ([ k, list ]) => {
                            const [ keyList, action ] = keyAnalyzer ( k );   // actions - list, fold, load;
                            /** @type {unknown} */
                            let value;

                            if ( action === 'load' )   value = load ( /** @type {unknown[]} */ ( list ) )
                            else                       value = search ( source, /** @type {string[]} */ ( list ), action )

                            const path = keyList.join ( '/' );
                            if      ( hasValue ( value ) )        setValue    ( result, keyList, value )
                            else                                  defaultList   // Defaults on this path. Keep the place of the key
                                                                            .filter  ( ([ p ]) => p === path || p.startsWith ( `${path}/` ) )
                                                                            .forEach ( ([ p, v ]) => fillDefault ( result, p.split ( '/' ), v ) )
                    }) // forEach shape entry

            // Defaults fill only the output paths without a value
            defaultList.forEach ( ([ path, value ]) => fillDefault ( result, path.split ( '/' ), value ) )

            return emit ( store, 'root', result )   // Result dt-lines by path
} // shapeQuery func.



/**
 * Searches the source paths for values. Only real values are used.
 * @param {Source} source - Reader of the source dt-lines.
 * @param {string[]} list - Source paths.
 * @param {string | null} action - `'list'`, `'fold'` or `null` (default mode).
 * @returns {unknown} Default mode: the last real value. `list!`: array of values. `fold!`: object of values.
 */
function search ( source, list, action ) {
            /** @type {any} */
            let result = ( action === 'list' ) ? [] : ( action === 'fold' ) ? {} : undefined;

            /**
             * Adds a value to the result.
             * @param {string | number} key - Property name of the value.
             * @param {unknown} value - The value.
             * @returns {void}
             */
            const collect = ( key, value ) => {
                            value = cleanCopy ( value )
                            if ( !hasValue ( value ) )   return   // Only real values. Null, undefined and empty structures are ignored
                            if      ( action === 'list' )   result.push ( value )
                            else if ( action === 'fold' )   result[key] = value
                            else                            result = value
                    };

            list.forEach ( el => {
                            const breadcrumbs = `root/${el}`;
                            if ( source.line ( breadcrumbs ) ) {   // Path to an object or array
                                        const ref = new SourceRef ( source, breadcrumbs );
                                        if ( action )   Object.entries ( ref.expand () ).forEach ( ([ key, value ]) => collect ( key, value ) )
                                        else            collect ( el, ref )
                                        return
                                }
                            const 
                                  searchList = el.split ( '/' )
                                , prop = /** @type {string} */ ( searchList.pop () )
                                ;
                            if ( searchList.length > 0 ) {   // Path: read the property of the parent dt-line. Array positions too, e.g. 'coords/0'
                                        const parent = source.line ( `root/${searchList.join ( '/' )}` );
                                        if ( parent && Object.prototype.hasOwnProperty.call ( parent.flatData, prop ) )   collect ( prop, /** @type {Record<string, unknown>} */ ( parent.flatData )[prop] )
                                        return   // Missing parent: not found
                                }
                            // Key without a path: search in the whole source. The last match wins
                            source.scan ( flatData => {
                                            if ( flatData instanceof Array )   return
                                            if ( Object.prototype.hasOwnProperty.call ( flatData, prop ) )   collect ( prop, /** @type {Record<string, unknown>} */ ( flatData )[prop] )
                                    })
                    }) // forEach list
            return result
} // search func.



/**
 * Returns the `dt-toolbox` library used by dt-shape. Use it to create the source dt-object.
 * @returns {DtBox} The dt-toolbox library.
 */
function getDTtoolbox () {
    return dtbox
} // getDTtoolbox func.

dtShape.getDTtoolbox = getDTtoolbox;



export default dtShape


