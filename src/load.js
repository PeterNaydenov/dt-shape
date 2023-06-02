function load ( search ) {
    let result;
    search.forEach ( item => {
                let type = typeof ( item );
                if ( type === 'function' ) {
                            item = item ()
                            type = typeof ( item )
                    }
                if ( type == null ) {  
                            result = null
                            return
                    }            
                result = item
        }) // for each search
    return result
} // load func.



export default load


