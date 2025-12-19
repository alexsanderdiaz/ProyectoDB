# modulo/api/services/expediente_service.py

from ..db import run_query

# --- [FUNCIONES DE BÚSQUEDA Y DATOS EXISTENTES] ---

def buscar_expediente_por_nocaso(nocaso):
    """
    Busca la información principal del expediente, la FECHAFIN del caso 
    y la CODESPECIALIZACION.
    """
    if not nocaso:
        return {"encontrado": False, "mensaje": "Número de caso (NoCaso) es obligatorio."}

    sql_expediente = """
        SELECT
            E.CONSECEXPE AS IDEXPEDIENTE,
            E.NOCASO,
            E.PASOETAPA AS NOETAPA,
            TO_CHAR(E.FECHAETAPA, 'YYYY-MM-DD') AS FECHAETAPA,
            E.CEDULA AS CEDULA_ABOGADO, 
            (A.NOMBRE || ' ' || A.APELLIDO) AS NOMBRE_ABOGADO,
            E.CODLUGAR,                 
            L.NOMLUGAR AS CIUDAD,
            EP.NOMETAPA,
            I.NINSTANCIA AS NOMINSTANCIA,
            IM.NOMIMPUGNA AS NOMBRE_IMPUGNACION,
            -- Campos clave para la lógica
            TO_CHAR(C.FECHAFIN, 'YYYY-MM-DD') AS FECHAFIN_CASO,
            C.CODESPECIALIZACION
        FROM
            EXPEDIENTE E
        LEFT JOIN
            CASO C ON E.NOCASO = C.NOCASO
        LEFT JOIN
            ABOGADO A ON E.CEDULA = A.CEDULA
        LEFT JOIN
            LUGAR L ON E.CODLUGAR = L.CODLUGAR
        LEFT JOIN
            ESPECIA_ETAPA EE 
                ON E.CODESPECIALIZACION = EE.CODESPECIALIZACION
                AND E.PASOETAPA = EE.PASOETAPA
        LEFT JOIN
            ETAPAPROCESAL EP ON EE.CODETAPA = EP.CODETAPA
        LEFT JOIN
            INSTANCIA I ON EE.NINSTANCIA = I.NINSTANCIA
        LEFT JOIN
            IMPUGNACION IM ON EE.IDIMPUGNA = IM.IDIMPUGNA
        WHERE
            E.NOCASO = :nocaso
    """
    
    params = {'nocaso': nocaso}
    expediente_data = run_query(sql_expediente, params, fetch="one")

    if not expediente_data:
        # Si no se encuentra el expediente, intentamos obtener solo la especialización del caso
        codespecializacion = obtener_codespecializacion_caso(nocaso)
        return {
            "encontrado": False, 
            "mensaje": f"No se encontró un expediente para el NoCaso: {nocaso}.",
            "codespecializacion": codespecializacion
        }

    expediente_data['suceso'] = ""
    expediente_data['resultado'] = ""
    expediente_data['documentos'] = []
    expediente_data['encontrado'] = True

    return expediente_data

def obtener_codespecializacion_caso(nocaso):

    #Obtiene el codespecializacion de la tabla CASO.

    sql = "SELECT CODESPECIALIZACION FROM CASO WHERE NOCASO = :nocaso"
    params = {'nocaso': nocaso}
    result = run_query(sql, params, fetch="one")
    return result.get('codespecializacion') if result else None


# --- [FUNCIONES DE DATOS INICIALES PARA CREACIÓN] ---

def obtener_siguiente_consecutivo_expediente():
    """
    Obtiene el próximo valor consecutivo de CONSECEXPE usando MAX(ID) + 1. 
    (CORREGIDO para evitar problemas de secuencia no creada).
    """
    sql = "SELECT MAX(CONSECEXPE) AS max_idexpediente FROM EXPEDIENTE"
    
    result = run_query(sql, fetch="one") 
    
    # Intenta obtener el valor o usa 0 si no hay resultado o si el valor es None.
    max_id = result.get('max_idexpediente') if result else None

    if max_id is None:
        max_id = 0
    
    # Sumamos 1 para obtener el siguiente consecutivo.
    return max_id + 1

def obtener_primera_etapa_por_especialidad(codespecializacion):
    """Obtiene la primera etapa (PASOETAPA=1) para una especialización (Regla D.ii, D.iv)."""
    sql = """
        SELECT
            EE.PASOETAPA AS NOETAPA,
            EP.NOMETAPA
        FROM
            ESPECIA_ETAPA EE
        JOIN
            ETAPAPROCESAL EP ON EE.CODETAPA = EP.CODETAPA
        WHERE
            EE.CODESPECIALIZACION like :codespecializacion AND EE.PASOETAPA = 1
    """
    params = {'codespecializacion': codespecializacion}
    return run_query(sql, params, fetch="one")

def obtener_abogados_por_especialidad(codespecializacion):
    """Obtiene abogados asociados a una especialización."""
    
    if not codespecializacion:
        return [] 
        
    sql = """
        SELECT
            A.CEDULA,
            (A.NOMBRE || ' ' || A.APELLIDO) AS NOMBRE_COMPLETO
        FROM
            ABOGADO A
        JOIN
            ABOGA_ESPECIA AE ON A.CEDULA = AE.CEDULA
        WHERE
            AE.CODESPECIALIZACION = :codespecializacion  -- Usamos '=' para la coincidencia exacta
        ORDER BY
            A.NOMBRE
    """
    params = {'codespecializacion': codespecializacion}
    
    # Intenta ejecutar la consulta. Si no hay resultados, run_query devuelve una lista vacía [], 
    # y la vista devuelve 200 OK con [] (correcto).
    return run_query(sql, params, fetch="all")

def obtener_lugares(idtipolugar=None):
    """
    Obtiene la lista de lugares. Ahora filtra por tipo_lugar='CIU' por defecto.
    """
    sql = """
        SELECT
            CODLUGAR,
            NOMLUGAR
        FROM
            LUGAR
        WHERE
            IDTIPOLUGAR = :idtipolugar
        ORDER BY
            NOMLUGAR
    """
    # Establecer 'CIU' como valor por defecto si no se pasa idtipolugar
    params = {'idtipolugar': idtipolugar if idtipolugar is not None else 'CIU'}
    
    return run_query(sql, params, fetch="all")


# --- [FUNCIONES DE CREACIÓN Y ACTUALIZACIÓN ] ---

def crear_expediente(data):
    """
    Inserta un nuevo registro en EXPEDIENTE.
    Asume que el idexpediente (CONSECEXPE) y los demás IDs están validados.
    """
    # solo insertamos EXPEDIENTE.
    sql = """
        INSERT INTO EXPEDIENTE 
        (CONSECEXPE, NOCASO, PASOETAPA, FECHAETAPA, CEDULA, CODLUGAR, CODESPECIALIZACION)
        VALUES 
        (:idexpediente, :nocaso, :noetapa, TO_DATE(:fechaetapa, 'YYYY-MM-DD'), 
         :cedula_abogado, :codlugar, :codespecializacion)
    """
    params = {
        'idexpediente': data['idexpediente'], 
        'nocaso': data['nocaso'],
        'noetapa': data['noetapa'],
        'fechaetapa': data['fechaetapa'],
        'cedula_abogado': data['cedula_abogado'], 
        'codlugar': data['codlugar'],
        'codespecializacion': data['codespecializacion']
    }
    
    # run_query debe manejar el commit para que la inserción sea efectiva
    run_query(sql, params, fetch=None)
    return {"message": "Expediente creado con éxito.", "idexpediente": data['idexpediente']}

def actualizar_expediente(data):
    """
    Actualiza los campos editables del expediente existente (Regla B).
    """
    
    sql = """
        UPDATE EXPEDIENTE
        SET
            CEDULA = :cedula_abogado,
            CODLUGAR = :codlugar
            -- Aquí deberías actualizar las relaciones de Suceso/Resultado/Instancia/Impugnacion si cambian
        WHERE
            CONSECEXPE = :idexpediente
    """
    params = {
        'idexpediente': data['idexpediente'], 
        'cedula_abogado': data['cedula_abogado'], 
        'codlugar': data['codlugar'],
        # ... (Otros parámetros de Suceso/Resultado/Instancia/Impugnacion)
    }
    
    run_query(sql, params, fetch=None)
    return {"message": "Expediente actualizado con éxito.", "idexpediente": data['idexpediente']}