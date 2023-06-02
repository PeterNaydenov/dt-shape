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


