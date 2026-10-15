import dtShape, { type DTObject, type DtBox, type Shape } from 'dt-shape'

const dtbox: DtBox = dtShape.getDTtoolbox ()
const dt: DTObject = dtbox.init ({ profile: { name: 'Peter' } })

const result: DTObject = dtShape ( dt, {
                                          firstName       : [ 'profile/name' ]
                                        , 'fold!profile'  : [ 'name' ]
                                        , 'list!names'    : [ 'name', 'profile/name' ]
                                        , 'load!version'  : [ 1, () => 'v2', { major: 4 } ]
                                    })
const std: Record<string, any> = result.model ( () => ({ as: 'std' }) )

const shape: Shape = { firstName: [ 'profile/name' ] }
dtShape ( dt, shape )

const literal = { firstName: [ 'profile/name' ] }
dtShape ( dt, literal )

dtShape ( dt, { firstName: [ 'profile/name' ], 'list!tags': [ 'tags' ] }, { firstName: 'Unknown', tags: [], nick: null })

// @ts-expect-error Defaults must be an object.
dtShape ( dt, { firstName: [ 'profile/name' ] }, 'Unknown' )

// @ts-expect-error Source paths must be strings.
dtShape ( dt, { firstName: [ 1 ] })

// @ts-expect-error Shape values must be lists.
dtShape ( dt, { firstName: 'profile/name' })

// @ts-expect-error Source data must be a dt-object.
dtShape ( { profile: { name: 'Peter' } }, { firstName: [ 'profile/name' ] })
