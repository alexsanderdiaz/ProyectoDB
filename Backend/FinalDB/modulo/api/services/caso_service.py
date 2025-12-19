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

    sql = "SELECT MAX(NOCASO) AS max_nocaso FROM CASO"
    
    # solo se espera un resultado
    result = run_query(sql, fetch="one") 
      
    # Intentamos obtener el valor usando .get(). Si result es None, get() ni se llama.
    max_caso = result.get('max_nocaso') if result else None

    # Si max_caso es None (tabla vacía), lo establecemos en 0.
    if max_caso is None:
        max_caso = 0
    
    # Sumamos 1 para obtener el siguiente consecutivo.
    return max_caso + 1

#FUNCION PARA LA CONSULTA DE ESPECIALIZACION

def obtener_especializaciones():
    """
    Obtiene la lista de códigos y nombres de especialización.
    """
    sql = "SELECT CODESPECIALIZACION AS cod_especializacion, NOMESPECIALIZACION AS nombre_especializacion FROM ESPECIALIZACION"
    
    # fetch="all" para obtener todos los registros
    return run_query(sql, fetch="all")

#FUNCION OBTENER FORMAS PAGO

def obtener_formas_pago():
    """
    Obtiene la lista de códigos y nombres de formas de pago desde la tabla FORMAPAGO.
    Utiliza IDFORMAPAGO como código y DESCFORMAPAGO (según indicación) como nombre.
    """
    # CORRECCIÓN: Se usa IDFORMAPAGO y el campo DESCFORMAPAGO para la descripción.
    sql = "SELECT IDFORMAPAGO AS cod_forma_pago, DESCFORMAPAGO AS nombre_forma_pago FROM FORMAPAGO"
    
    # fetch="all" para obtener todos los registros
    return run_query(sql, fetch="all")


# Obtener el siguiente CONSECPAGO
def obtener_siguiente_consecutivo_pago():
    """
    Obtiene el siguiente CONSECPAGO disponible de la tabla PAGO.
    Usa NVL(MAX(...), 0) + 1 para asegurar que empieza en 1 si la tabla está vacía.
    """
    sql = "SELECT NVL(MAX(CONSECPAGO), 0) + 1 AS siguiente_consecutivo FROM PAGO"
    # run_query debe devolver un diccionario con el resultado
    resultado = run_query(sql, fetch="one")
    return resultado['siguiente_consecutivo']

# Registrar Pago
def registrar_pago_acuerdo(data):
    """
    Registra un pago en la tabla PAGO con los valores de acuerdo.
    CODFRANQUICIA y NTARJETA se establecen como NULL.
    """
    valor_pago = float(data.get('valorAcuerdo', 0))
    forma_pago_id = data.get('formaPago')

    if not forma_pago_id or valor_pago <= 0:
        raise ValueError("Faltan datos obligatorios: ID de forma de pago o Valor de acuerdo inválido.")

    consec_pago = obtener_siguiente_consecutivo_pago()
    
    # El SQL usa SYSDATE para la fecha actual y NULL para campos opcionales
    sql = """
        INSERT INTO PAGO 
        (CONSECPAGO, CODFRANQUICIA, IDFORMAPAGO, FECHAPAGO, VALORPAGO, NTARJETA)
        VALUES 
        (:consec_pago, NULL, :idformapago, SYSDATE, :valorpago, NULL)
    """

    params = {
        'consec_pago': consec_pago,
        'idformapago': forma_pago_id,
        'valorpago': valor_pago,
    }

    try:
        run_query(sql, params, fetch=None) # fetch=None para INSERT
        return {"consecutivo_pago": consec_pago, "mensaje": f"Pago de acuerdo registrado con consecutivo {consec_pago}"}
    except Exception as db_error:
        print(f"Error en DB al registrar pago: {db_error}")
        raise # Re-lanzar la excepción para que la vista la maneje


#FUNCION PARA EL NSERT DE CASO

def crear_nuevo_caso(cod_cliente, case_data):
    """
    Registra un nuevo caso en la tabla CASO.
    """
    # 1. Preparar datos y manejar valores opcionales/nulos
    # El payload del frontend ya viene con las claves en camelCase (fechaInicio, fechaFin)
    
    nocaso = int(case_data['nocaso']) 
    codespecializacion = case_data['especializacion']
    fechainicio = case_data['fechaInicio']
    
    # Manejar FECHAFIN: si es None (o cadena vacía del payload), debe ser NULL en la DB.
    fechafin = case_data.get('fechaFin') or None
    
    # Asegurar que el valor es float, usando 0.0 si el valor es inválido
    try:
        valor = float(case_data['valor'])
    except (TypeError, ValueError):
        valor = 0.0 # O levanta una excepción si el valor es obligatorio

    # SQL: Uso de CASE WHEN para asegurar que el campo FECHAFIN se inserte como NULL si está vacío.
    sql = """
        INSERT INTO CASO 
        (NOCASO, CODESPECIALIZACION, CODCLIENTE, FECHAINICIO, FECHAFIN, VALOR)
        VALUES 
        (:nocaso, :codespecializacion, :codcliente, 
         TO_DATE(:fechainicio, 'YYYY-MM-DD'), 
         -- Condición para insertar NULL si fechafin es None o vacío
         CASE WHEN :fechafin IS NULL THEN NULL
              ELSE TO_DATE(:fechafin, 'YYYY-MM-DD')
         END,
         :valor)
    """

    params = {
        'nocaso': nocaso,
        'codespecializacion': codespecializacion,
        'codcliente': cod_cliente,
        'fechainicio': fechainicio,
        'fechafin': fechafin,
        'valor': valor,
    }

    # Ejecutar la consulta (asumiendo que run_query maneja la conexión y el commit)
    try:
        run_query(sql, params, fetch=None) 
    except Exception as db_error:
        # Esto capturará errores específicos de la DB (Ej: restricción, formato de fecha)
        print(f"Error de DB al insertar caso {nocaso}: {db_error}")
        raise db_error # Re-lanza el error para que la vista lo capture
    
    return {'nocaso': nocaso, 'status': 'Creado con éxito'}