## Release History



### 4.0.1 ( 2026-10-17)
- [x] Dependency update. `dt-toolbox` to version 8.1.3;



### 4.0.0 ( 2026-10-15)
- [x] Breaking: Dependency update. `dt-toolbox` to version 8.1.2. `dtShape.getDTtoolbox()` returns dt-toolbox v.8: `init` throws on an unsupported model name (was: returns `null`), `dt.copy()` returns primitive values first, `getWalk()` returns walk v.7 (`IGNORE` became `IGNORE()`). See `Migration.guide.md`;
- [x] Breaking: Only real values. `null`, `undefined`, empty objects and empty arrays are ignored: they don't overwrite a found value (default mode and `load!`), they are not collected by `list!` and `fold!` (before: `null` items and a `"null": null` property), and they are removed from copied objects. Copied arrays keep their positions: a position without a real value is `null`. Use `list!` for a list without empty places. See `Migration.guide.md`;
- [x] Breaking: A number in an output path creates an array: `{ 'coords/0': ['lat'], 'coords/1': ['lng'] }` gives `{ coords: [ 42, 23 ] }` (was: `{ coords: { 0: 42, 1: 23 } }`). Arrays have no gaps: missing positions get `null`;
- [x] Breaking: Output paths. Shape keys are applied in order. An object written to an output path that already has an object is merged with it. Other values replace the existing value (the later shape key wins). Before, the result depended on the order in unexpected ways, and output paths with the same name in different places (e.g. `x/name` and `y/x/age`) were mixed;
- [x] Fix: Objects and arrays are copied completely. Before, nested objects and arrays were lost, or became `null` inside arrays. `list!` and `fold!` also get the nested objects and arrays as values;
- [x] Feature: TypeScript type declarations, generated from JSDoc in `src` with TypeScript 7 (`npm run build:types`). `types/main.d.ts` for ES modules and `types/main.d.cts` for CommonJS/UMD (created by `scripts/build-cts-types.js`), wired through `types` and the `exports` conditions in `package.json`. Shape keys are type-checked: `load!` keys accept any values, other keys accept only source paths. Verified with `@arethetypeswrong/cli`;
- [x] Feature: Default values. `dtShape ( dt, shape, defaults )` - optional object with default values by output path (e.g. `{ 'profile/age': 0, tags: [] }`). Defaults are used when the shape finds no real value, so the result keeps all keys. `null`, `[]` and `{}` are valid defaults. The defaults object is not changed. Array defaults fill the empty positions: a whole array as a template (`{ coords: [ 0, 0, 0, 0 ] }`) or a specific position (`{ 'coords/2': 0 }`). Specific defaults win over general ones;
- [x] Feature: `Migration.guide.md` - how to upgrade from v.3.x.x;
- [x] Fix: A source property or a `load!` member with value `null` threw `TypeError: Cannot convert undefined or null to object`;
- [x] Fix: `Date` and `RegExp` source values are regular values. Before, `dtbox.init` threw "Circular reference detected";
- [x] Fix: Shared object references (`{ a: shared, b: shared }`) and keys with RegExp special characters (e.g. `'a(b'`) work. Before, `dtbox.init` threw. Fixed by dt-toolbox v.8;
- [x] Breaking: Source paths with a parent read exactly that place. A missing parent means "not found" (was: the last name was searched in the whole source, e.g. `'contact/email'` found `profile/email`). Array positions can be read: `'coords/0'`. A key without a path still searches the whole source;
- [x] Breaking: Wrong arguments throw clear errors: source that is not a dt-object, shape that is not an object, shape value that is not a list, unknown prefix (e.g. `'lsit!'`, was silently ignored), more than one prefix, source paths that are not strings, defaults that are not an object;
- [x] Breaking: The source dt-object needs dt-toolbox 8.1 or newer, because the result is built with `store.set` by path. A dt-object from an older dt-toolbox throws an error instead of losing nested data. Create the source with `dtShape.getDTtoolbox().init ( data )`;
- [x] Performance: dt-shape is a query function. It reads only the source dt-lines that the shape needs (`store.get`, `store.from`, and `store.look` for keys without a path) and writes the result dt-lines by path, without converting the data to standard JS objects and back. Compared with v.3.2.1: 1.3x - 3.8x faster on small (3 users), medium (200) and large (2000 users, ~8000 dt-lines) data. Copying large objects and arrays takes longer, because v.3.2.1 didn't copy the nested data at all;
- [x] Fix: Skill docs. Removed non-existing `as: 'keep'` and `as: 'object'` model options. Unprefixed and `load!` keys take the LAST source, not the first. Documented the "only real values" rule. Fixed `list!` docs: it collects the values of an object or array, it doesn't push the container;
- [x] Tests: Regression tests for real values (`null`, `undefined`, empty structures), `Date`/`RegExp`, nested copy, output paths, defaults, array positions, source paths and argument errors;
- [x] Tests: `test/02-skill.test.js` runs every code example in the skill and checks its documented result, so the skill stays in sync with the library; Type tests in `test/types` (`npm run test:types`);



### 3.2.1 ( 2026-09-26)
- [x] Update a 'dt-toolbox' library to version 7.5.1;



### 3.2.0 ( 2026-09-02)
- [x] Update a 'dt-toolbox' library to version 7.5.0;
- [x] Package skill available in 'skills' folder;
- [x] Old documentation was removed;



### 3.1.7 ( 2026-08-12)
- [x] Update a 'dt-toolbox' library to version 7.4.9;



### 3.1.6 ( 2026-07-20)
- [x] Update a 'dt-toolbox' library to version 7.4.8;



### 3.1.5 ( 2026-07-17)
- [x] Update a 'dt-toolbox' library to version 7.4.7;



### 3.1.4 ( 2026-07-14)
- [x] Update a 'dt-toolbox' library to version 7.4.6;
- [x] Dev dependencies updates;



### 3.1.3 ( 2025-10-27)
- [x] Update a 'dt-toolbox' library to version 7.4.5;
- [x] Dev dependencies updates;



### 3.1.2 ( 2025-01-06)
- [x] Update a 'dt-toolbox' library to version 7.4.4;



### 3.1.1 ( 2024-12-07)
- [x] Update a 'dt-toolbox' library to version 7.4.3;
- [x] Dev dependencies updates;



### 3.1.0 ( 2024-02-03 )
- [x] Dependency update. `dt-toolbox` to ver. 7.4.2;
- [x] Folder 'dist' was added to the project. Includes commonjs, umd and esm versions of the library;
 - [x] Package.json: "exports" section was added. Allows you to use package as commonjs or es6 module without additional configuration;
 - [x] Rollup was added to the project. Used to build the library versions;



### 3.0.3 ( 2024-01-14)
- [x] Dependency update. `dt-toolbox` to ver. 7.4.1;
- [x] Dev dependencies update. Chai@5.0.0;
- [x] Dev dependencies update. C8@9.1.0;



### 3.0.2 ( 2023-11-03)
- [x] Update `dt-toolbox` to ver. 7.4.0;



### 3.0.1 ( 2023-10-10)
- [x] Update `dt-toolbox` to ver. 7.2.0;



### 3.0.0 ( 2023-06-02)
- [x] Update `dt-toolbox` to ver. 6.0.0;
- [x] Result is coming as a dt-object;



### 2.0.5 ( 2022-05-29)
- [x] Update `dt-toolbox` to ver. 4.0.7;



### 2.0.3 (2022-03-07)
- [x] Update `dt-toolbox` to ver. 4.0.6;



### 2.0.1 (2021-03-25)
- [x] Update `dt-toolbox` to ver. 3.1.0;



### 2.0.0 (2021-03-01)
 - [x] Works with v.3.x.x of `dt-toolbox`;
 - [x] Changes in DT objects according v.3.x.x of dt-toolbox;
 - [x] Documentation for old version v.1.x.x is available [here](https://github.com/PeterNaydenov/dt-shape/blob/master/README_v.1.x.x.md);
 - [x] Library is using a 'generator functions'. If support for old browsers is required, add a polyfill for 'generators' or get back to version 1.x.x of the library;





### 1.0.2 (2019-06-02)
 - [x] Update dependencies: Dt-toolbox v.2.1.0;
 - [x] Upgrade dependencies: Webpack v.4.32.2;
 - [x] Browser version update;
 - [x] Documentation update;



### 1.0.0 (2017-12-28)
 - [x] Project folder reorganization;
 - [x] Test coverage. Istanbul;
 - [x] Test coverage on 100%;
 - [x] Version for browsers. Dt-toolbox included;
 - [x] Documentation update;



### 0.1.6 (2017-04-22)
 - [x] Update dependency dt-toolbox to 1.6.0;



### 0.1.5 (2017-03-28)
 - [x] Update dependency dt-toolbox to 1.4.0;



### 0.1.4 (2017-02-24)
 - [x] Documentation update only;



### 0.1.2 (2017-02-21)
 - [x] Fix: Problematic updates with wrong values;



### 0.1.0 (2017-02-20)
 - [x] Prefix `load!` loads data from external source;
 - [ ] Error: Problematic updates with wrong values;



### 0.0.3 (2017-02-17)
 - [x] Just documentation update;



### 0.0.1 (2017-02-05)
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;