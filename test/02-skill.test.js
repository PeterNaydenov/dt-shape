'use strict'
/**
 *   Skill examples test
 *
 *   Runs every ```js code block from the bundled skill (skills/peter-naydenov-dt-shape)
 *   and checks the expected results written as `// → value` or `// name → value`.
 *   Keeps the skill documentation in sync with the library behaviour.
 *   Blocks that are fragments (only a shape, or an illustration) start with the comment `// fragment`.
 */

import dtShape from '../src/main.js'
import { expect } from 'chai'
import fs     from 'node:fs'
import path   from 'node:path'
import assert from 'node:assert/strict'



const
      skillDir = path.resolve ( import.meta.dirname, '../skills/peter-naydenov-dt-shape' )
    , files = [ 'SKILL.md', 'references/shape-syntax.md', 'references/pitfalls.md', 'references/dt-object-integration.md' ]
    , AsyncFunction = Object.getPrototypeOf ( async function () {} ).constructor
    , preamble = `const dtbox = dtShape.getDTtoolbox ();\n`
    ;



/**
 * Convert a markdown code block into executable code.
 * Expectation comments become assertions:
 *   `// name → value`  checks variable `name`;
 *   `// → value`       checks the expression on the previous line.
 * Comment lines that follow and start with `//` plus 2+ spaces continue a multi-line value.
 * @param {string} raw - Code of the block.
 * @returns {{ code: string, checks: number }} Executable code and number of checks.
 */
function toTestCode ( raw ) {
        const
              lines = raw.split ( '\n' ).filter ( l => !/^import dtShape/.test ( l ) && !/^const dtbox\s*=/.test ( l ) )
            , out = []
            ;
        let checks = 0;
        for ( let k = 0; k < lines.length; k++ ) {
                const
                      named = lines[k].match ( /^\s*\/\/ (\w+) → (.*)$/ )
                    , anon  = lines[k].match ( /^\s*\/\/ → (.*)$/ )
                    ;
                if ( !named && !anon ) {
                        out.push ( lines[k] )
                        continue
                    }
                let value = named ? named[2] : anon[1];
                while ( k + 1 < lines.length && /^\s*\/\/\s{2,}/.test ( lines[k+1] ) ) {
                        k++
                        value += ' ' + lines[k].replace ( /^\s*\/\//, '' )
                    }
                if ( named )   out.push ( `assert.deepStrictEqual ( ${named[1]}, ( ${value} ), ${JSON.stringify ( named[1] + ' → ' + value )} )` )
                else {
                        let j = out.length - 1;
                        while ( j >= 0 && out[j].trim () === '' )   j--
                        out[j] = `const __v${checks} = ${out[j]}`
                        out.push ( `assert.deepStrictEqual ( __v${checks}, ( ${value} ), ${JSON.stringify ( '→ ' + value )} )` )
                    }
                checks++
            }
        return { code: preamble + out.join ( '\n' ), checks }
} // toTestCode func.



/**
 * Code blocks of a skill file.
 * @param {string} file - File path, relative to the skill directory.
 * @returns {string[]} Code of each ```js block.
 */
function blocksOf ( file ) {
        const md = fs.readFileSync ( path.join ( skillDir, file ), 'utf8' );
        return [ ...md.matchAll ( /```js\n([\s\S]*?)```/g ) ].map ( m => m[1] )
} // blocksOf func.



describe ( 'Skill examples (skills/peter-naydenov-dt-shape)', () => {
    files.forEach ( file => {
            blocksOf ( file ).forEach ( ( raw, i ) => {
                    const isFragment = /^\s*\/\/ fragment/.test ( raw );
                    ( isFragment ? it.skip : it ) ( `${file} block #${i+1}`, async () => {
                            const { code } = toTestCode ( raw );
                            await new AsyncFunction ( 'dtShape', 'assert', code ) ( dtShape, assert )
                        })
                })
        })

    it ( 'has expectations to check', () => {
            const total = files.reduce ( ( sum, file ) => sum + blocksOf ( file ).reduce ( ( s, raw ) => s + toTestCode ( raw ).checks, 0 ), 0 );
            expect ( total ).to.be.greaterThan ( 20 )
        })
}) // describe
