/**
 * @import { DtStore } from 'dt-toolbox'
 */

/**
 * @typedef {Object} SourceLine
 * @property {Record<string, unknown> | unknown[]} flatData - Primitive values of the dt-line.
 * @property {string[] | null} children - Breadcrumbs of the child dt-lines. `null` until the subtree is read.
 * @property {boolean} [hasValue] - Cached: the dt-line or a descendant has a real value.
 */



/**
 * Reads the source dt-lines with the store, only when they are needed. Read dt-lines are cached.
 */
class Source {
    /**
     * @param {DtStore} store - The query store.
     */
    constructor ( store ) {
            this.store = store
            /** @type {Map<string, SourceLine | null>} */
            this.lines = new Map ()   // null: the dt-line doesn't exist
    } // constructor



    /**
     * One dt-line by breadcrumbs.
     * @param {string} breadcrumbs - Breadcrumbs of the dt-line, e.g. `'root/profile'`.
     * @returns {SourceLine | null} The dt-line, or `null` if it doesn't exist.
     */
    line ( breadcrumbs ) {
            if ( !this.lines.has ( breadcrumbs ) ) {
                        /** @type {SourceLine | null} */
                        let found = null;
                        this.store.get ( breadcrumbs ).look ( ({ flatData, next }) => {
                                        found = { flatData, children: null }
                                        return next ()
                                })
                        this.lines.set ( breadcrumbs, found )
                }
            return /** @type {SourceLine | null} */ ( this.lines.get ( breadcrumbs ) )
    } // line func.



    /**
     * A dt-line with the list of its children. Reads the whole subtree of the dt-line once.
     * @param {string} breadcrumbs - Breadcrumbs of the dt-line.
     * @returns {SourceLine} The dt-line with `children`.
     */
    tree ( breadcrumbs ) {
            const known = this.lines.get ( breadcrumbs );
            if ( known && known.children )   return known
            /** @type {SourceLine[]} */
            const read = [];
            this.store.from ( breadcrumbs ).look ( ({ flatData, breadcrumbs: br, next }) => {
                            const line = this.lines.get ( br ) || { flatData, children: null };
                            line.children = []
                            this.lines.set ( br, line )
                            read.push ( line )
                            const i = br.lastIndexOf ( '/' );
                            if ( br !== breadcrumbs && i > 0 ) {   // Parent is in the subtree and was read before: DT-model lists parents first
                                        const parent = this.lines.get ( br.slice ( 0, i ) );
                                        if ( parent && parent.children )   parent.children.push ( br )
                                }
                            return next ()
                    })
            return /** @type {SourceLine} */ ( this.lines.get ( breadcrumbs ) )
    } // tree func.



    /**
     * Visits the flat data of every source dt-line, in the order of the DT-model.
     * @param {( flatData: Record<string, unknown> | unknown[] ) => void} fn - Called once per dt-line.
     * @returns {void}
     */
    scan ( fn ) {
            this.store.look ( ({ flatData, next }) => {
                            fn ( flatData )
                            return next ()
                    })
    } // scan func.
} // Source class.



export default Source


