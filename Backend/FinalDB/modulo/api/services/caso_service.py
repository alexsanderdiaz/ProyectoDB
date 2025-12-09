from ..db import run_query

def buscar_cliente_con_caso_activo(nombre=None, apellido=None, documento=None):
    """
    Busca un cliente por documento O por nombre y apellido.
    Realiza un LEFT JOIN con CASO para traer el caso activo (FECHAFIN IS NULL).
    Devuelve el primer cliente encontrado.
    """
    
    # Parámetros para la consulta SQL
    params = {}
    where_clauses = []

    if documento:
        # Búsqueda por documento (más específica)
        where_clauses.append("cl.NDOCUMENTO = :documento")
        params['documento'] = documento
    elif nombre and apellido:
        # Búsqueda por nombre y apellido (patrones LIKE)
        nombre_patron = '%' + nombre + '%'
        apellido_patron = '%' + apellido + '%'
        where_clauses.append("UPPER(cl.NOMCLIENTE) LIKE UPPER(:nombre_patron)")
        where_clauses.append("UPPER(cl.APELLCLIENTE) LIKE UPPER(:apellido_patron)")
        params['nombre_patron'] = nombre_patron
        params['apellido_patron'] = apellido_patron
    else:
        # No se proporcionaron criterios de búsqueda válidos
        return None

    sql = f"""
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
            {' AND '.join(where_clauses)}
        ORDER BY 
            c.NOCASO DESC
    """
    
    # fetch="one" devolverá un diccionario con las llaves en minúscula 
    result = run_query(sql, params, fetch="one")

    return result