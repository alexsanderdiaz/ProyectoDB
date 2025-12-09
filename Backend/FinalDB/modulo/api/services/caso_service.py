from ..db import run_query

def buscar_cliente_con_caso_activo(nombre, apellido):
    """
    Busca un cliente por NOMCLIENTE y APELLCLIENTE.
    Realiza un LEFT JOIN con CASO para traer el caso activo (FECHAFIN IS NULL).
    """
    sql = """
        SELECT 
            cl.CODCLIENTE,
            cl.NDOCUMENTO,
            cl.NOMCLIENTE,
            cl.APELLCLIENTE,
            c.NOCASO,
            c.FECHAINICIO,
            c.FECHAFIN,
            c.CODESPECIALIZACION,
            c.VALOR
        FROM 
            CLIENTE cl
        LEFT JOIN 
            CASO c ON cl.CODCLIENTE = c.CODCLIENTE AND c.FECHAFIN IS NULL
        WHERE 
            UPPER(cl.NOMCLIENTE) = UPPER(:nombre) 
            AND UPPER(cl.APELLCLIENTE) = UPPER(:apellido)
        ORDER BY 
            c.NOCASO DESC
    """
    
    # params evita inyección SQL y facilita el uso de variables
    params = {'nombre': nombre, 'apellido': apellido}
    
    # fetch="one" devolverá un diccionario con las llaves en minúscula 
    # (ej: 'codcliente', 'nocaso', etc.) gracias a tu función run_query
    result = run_query(sql, params, fetch="one")
    
    return result