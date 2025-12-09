from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .db import run_query
from .services.caso_service import buscar_cliente_con_caso_activo, obtener_siguiente_no_caso

# ----------------------------
# GENERADOR DE VISTAS GENERALES
# ----------------------------

class TableView(APIView):
    """Vista genérica para consultar cualquier tabla"""

    table = None  # Nombre real de la tabla en Oracle
    pk = None     # Clave primaria simple (si existe)

    # GET → devuelve todos los registros
    def get(self, request):
        sql = f"SELECT * FROM {self.table}"
        data = run_query(sql)
        return Response(data)


# ----------------------------
# LISTA COMPLETA DE TABLAS
# ----------------------------

class AbogadoView(TableView):
    table = "abogado"

class ClienteView(TableView):
    table = "cliente"

class CasoView(TableView):
    table = "caso"

class ContactoView(TableView):
    table = "contacto"

class DocumentoView(TableView):
    table = "documento"

class EspeciaEtapaView(TableView):
    table = "especia_etapa"

class EspecializacionView(TableView):
    table = "especializacion"

class EtapaprocesalView(TableView):
    table = "etapaprocesal"

class ExpedienteView(TableView):
    table = "expediente"

class FormapagoView(TableView):
    table = "formapago"

class FranquiciaView(TableView):
    table = "franquicia"

class ImpugnacionView(TableView):
    table = "impugnacion"

class InstanciaView(TableView):
    table = "instancia"

class LugarView(TableView):
    table = "lugar"

class PagoView(TableView):
    table = "pago"

class ResultadoView(TableView):
    table = "resultado"

class SucesoView(TableView):
    table = "suceso"

class TipocontactView(TableView):
    table = "tipocontact"

class TipodocumentoView(TableView):
    table = "tipodocumento"

class TipolugarView(TableView):
    table = "tipolugar"

# Gestiones

class GestionCasoBusquedaView(APIView):
    def get(self, request):
        nombre = request.query_params.get('nombre')
        apellido = request.query_params.get('apellido')
        # Obtener el documento del query params
        documento = request.query_params.get('documento') 

        # Revisar si se envía documento O nombre y apellido
        if not documento and (not nombre or not apellido):
            return Response(
                {"error": "Se requieren documento O nombre y apellido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Llamar al servicio, que ahora acepta documento
        resultado = buscar_cliente_con_caso_activo(nombre, apellido, documento)

        if resultado and resultado.get('encontrado'):
            # Devolver el resultado completo (cliente + lista de casos) con status 200 OK
            return Response(resultado, status=status.HTTP_200_OK)
        else:
            # Devolver 404 NOT FOUND si no se encuentra el cliente
            return Response(
                {
                    "encontrado": False,
                    # El mensaje del servicio es más descriptivo
                    "mensaje": resultado.get('mensaje', "Cliente no encontrado.") 
                },
                status=status.HTTP_404_NOT_FOUND 
            )
        
class GestionCasoSiguienteNoCasoView(APIView):
    """Vista para obtener el siguiente número de caso consecutivo."""
    def get(self, request):
        try:
            siguiente_id = obtener_siguiente_no_caso()
            return Response({"siguiente_nocaso": siguiente_id}, status=status.HTTP_200_OK)
        except Exception as e:
            # Manejo básico de errores de base de datos o lógica
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)