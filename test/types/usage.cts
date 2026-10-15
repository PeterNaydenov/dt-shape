import dtShape = require ( 'dt-shape' )

const dtbox: dtShape.DtBox = dtShape.getDTtoolbox ()
const dt: dtShape.DTObject = dtbox.init ({ a: 1 })
const result: dtShape.DTObject = dtShape ( dt, { b: [ 'a' ], 'load!c': [ () => 3 ] })

const defaults: dtShape.Defaults = { b: 0 }
dtShape ( dt, { b: [ 'a' ] }, defaults )

const shape: dtShape.Shape = { b: [ 'a' ] }
dtShape ( dt, shape )

// @ts-expect-error Source paths must be strings in CommonJS consumers too.
dtShape ( dt, { b: [ 1 ] })
