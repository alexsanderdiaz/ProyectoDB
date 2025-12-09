from ..db import run_query

def buscar_cliente_con_caso_activo(nombre=None, apellido=None, documento=None):
    """
    Busca un cliente por documento O por nombre y apellido.
    Realiza un LEFT JOIN con CASO para traer el caso activo (FECHAFIN IS NULL).
    Devuelve los datos del cliente y la LISTA de casos activos encontrados.
    """
    
    params = {}
    where_clauses = []

    if documento:
        where_clauses.append("cl.NDOCUMENTO = :documento")
        params['documento'] = documento
    elif nombre and apellido:
        nombre_patron = '%' + nombre + '%'
        apellido_patron = '%' + apellido + '%'
        where_clauses.append("UPPER(cl.NOMCLIENTE) LIKE UPPER(:nombre_patron)")
        where_clauses.append("UPPER(cl.APELLCLIENTE) LIKE UPPER(:apellido_patron)")
        params['nombre_patron'] = nombre_patron
        params['apellido_patron'] = apellido_patron
    else:
        return {
            "encontrado": False,
            "mensaje": "Por favor, ingrese el Documento O el Nombre y Apellido completos."
        }

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
    
    result = run_query(sql, params, fetch="all")

    if result:
        # Extraer los datos del cliente (del primer registro)
        cliente_data = {
            'cod_cliente': result[0]['codcliente'], # Usando 'cod_cliente' para ser consistente
            'documento': result[0]['ndocumento'],
            'nombre': result[0]['nomcliente'],
            'apellido': result[0]['apellcliente']
        }
        
        # Filtrar solo los registros que tienen un caso activo
        casos_activos = [
            {
                'numero_caso': row['nocaso'],
                'fecha_inicio': row['fechainicio'],
                'especializacion': row['codespecializacion'],
                'valor': row['valor']
            }
            for row in result if row['nocaso'] is not None 
        ]
        
        # Devolver el cliente y la lista de casos activos
        return {
            "encontrado": True,
            "cliente": cliente_data,
            "casos_activos": casos_activos 
        }
        
    # Si no hay resultados, el cliente no fue encontrado
    return {
        "encontrado": False,
        "mensaje": "Cliente no encontrado. ¿Desea crear un nuevo cliente?"
    }

# funcion para escribir el caso consecutivo

def obtener_siguiente_no_caso():

    #Busca el valor máximo de NOCASO en la tabla CASO y devuelve el siguiente consecutivo.
    #Si no hay casos, devuelve 1.
    # Usamos un alias (AS max_nocaso) para que el diccionario devuelto por run_query
    # tenga una clave predecible: 'max_nocaso' (en minúsculas por tu run_query)

    sql = "SELECT MAX(NOCASO) AS max_nocaso FROM CASO"
    
    # solo se espera un resultado
    result = run_query(sql, fetch="one") 
    
    # result será un diccionario como: {'max_nocaso': 123} o {'max_nocaso': None} (si la tabla está vacía).
    
    # Intentamos obtener el valor usando .get(). Si result es None, get() ni se llama.
    max_caso = result.get('max_nocaso') if result else None

    # Si max_caso es None (tabla vacía), lo establecemos en 0.
    if max_caso is None:
        max_caso = 0
    
    # Sumamos 1 para obtener el siguiente consecutivo.
    return max_caso + 1

def obtener_especializaciones():
    """
    Obtiene la lista de códigos y nombres de especialización.
    """
    sql = "SELECT CODESPECIALIZACION AS cod_especializacion, NOMESPECIALIZACION AS nombre_especializacion FROM ESPECIALIZACION"
    
    # fetch="all" para obtener todos los registros
    return run_query(sql, fetch="all")