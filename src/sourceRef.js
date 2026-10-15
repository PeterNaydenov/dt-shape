/**
 * @import Source from './source.js'
 */



/**
 * Reference to a dt-line of the source data and its descendants.
 * Copied objects and arrays stay as references until the result is written as dt-lines.
 */
class SourceRef {
    /**
     * @param {Source} source - Reader of the source dt-lines.
     * @param {string} breadcrumbs - Breadcrumbs of the referenced dt-line.
     */
    constructor ( source, breadcrumbs ) {
            this.source = source
            this.breadcrumbs = breadcrumbs
    } // constructor



    /**
     * Checks if the dt-line or a descendant has a real value (not `null` or `undefined`).
     * @returns {boolean} True if there is a real value.
     */
    hasValue () {
            const line = this.source.tree ( this.breadcrumbs );
            if ( line.hasValue === undefined ) {
                        line.hasValue = Object.values ( line.flatData ).some ( v => v != null )
                                     || /** @type {string[]} */ ( line.children ).some ( child => new SourceRef ( this.source, child ).hasValue () )
                }
            return line.hasValue
    } // hasValue func.



    /**
     * Opens the reference one level: an object or array with the primitive values of the dt-line
     * and references to the child dt-lines. Object properties without a real value are removed.
     * Arrays keep their positions: a position without a real value is `null`.
     * @returns {Record<string, unknown> | unknown[]} Object or array.
     */
    expand () {
            const 
                  { flatData, children } = this.source.tree ( this.breadcrumbs )
                , refs = /** @type {string[]} */ ( children ).map ( child => /** @type {[ string, SourceRef ]} */ ([ child.slice ( child.lastIndexOf ( '/' ) + 1 ), new SourceRef ( this.source, child ) ]) )
                ;
            if ( flatData instanceof Array ) {
                        const list = flatData.map ( v => v == null ? null : v );
                        refs.forEach ( ([ key, ref ]) => {
                                        const index = Number ( key );
                                        while ( list.length < index )   list.push ( null )
                                        list[index] = ref.hasValue () ? ref : null
                                })
                        return list
                }
            /** @type {Record<string, unknown>} */
            const obj = {};
            Object.entries ( flatData ).forEach ( ([ k, v ]) => { if ( v != null )   obj[k] = v })
            refs.forEach ( ([ key, ref ]) => { if ( ref.hasValue () )   obj[key] = ref })
            return obj
    } // expand func.
} // SourceRef class.



export default SourceRef


