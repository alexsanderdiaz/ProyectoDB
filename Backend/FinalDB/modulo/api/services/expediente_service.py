# modulo/api/services/expediente_service.py

from ..db import run_query

def buscar_expediente_por_nocaso(nocaso):
    """
    Busca la información principal del expediente y la FECHAFIN del caso asociado.
    Se omiten temporalmente Suceso, Resultado y Documentos.
    """
    if not nocaso:
        return {"encontrado": False, "mensaje": "Número de caso (NoCaso) es obligatorio."}

    # 1. Consulta Principal del Expediente (INCLUYE C.FECHAFIN)
    sql_expediente = """
        SELECT
            E.CONSECEXPE AS IDEXPEDIENTE,
            E.NOCASO,
            E.PASOETAPA AS NOETAPA,
            TO_CHAR(E.FECHAETAPA, 'YYYY-MM-DD') AS FECHAETAPA,
            (A.NOMBRE || ' ' || A.APELLIDO) AS NOMBRE_ABOGADO,
            L.NOMLUGAR AS CIUDAD,
            EP.NOMETAPA,
            I.NINSTANCIA AS NOMINSTANCIA,
            IM.NOMIMPUGNA AS NOMBRE_IMPUGNACION,
            TO_CHAR(C.FECHAFIN, 'YYYY-MM-DD') AS FECHAFIN_CASO
        FROM
            EXPEDIENTE E
        LEFT JOIN
            CASO C ON E.NOCASO = C.NOCASO -- 🛑 NUEVA UNIÓN
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
        # Se maneja el caso de expediente no encontrado (Regla C inicial)
        return {"encontrado": False, "mensaje": f"No se encontró un expediente para el NoCaso: {nocaso}."}

    # 2. Devolver los datos principales, y añadimos campos vacíos para no romper el frontend
    expediente_data['suceso'] = ""
    expediente_data['resultado'] = ""
    expediente_data['documentos'] = []
    expediente_data['encontrado'] = True

    return expediente_data