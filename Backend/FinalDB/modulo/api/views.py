from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .db import run_query
from .services.caso_service import (
    buscar_cliente_con_caso_activo,
    obtener_siguiente_no_caso,
    obtener_especializaciones,
    crear_nuevo_caso
)

import traceback

# VISTAS GENERALES

class TableView(APIView):
    """Vista genérica para consultar cualquier tabla"""

    table = None  # Nombre real de la tabla en Oracle
    pk = None     # Clave primaria simple (si existe)

    # GET → devuelve todos los registros
    def get(self, request):
        sql = f"SELECT * FROM {self.table}"
        data = run_query(sql)
        return Response(data)


# LISTA COMPLETA DE TABLAS


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

# GESTIONES

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
        

class EspecializacionListView(APIView):
    """Vista para obtener la lista de todas las especializaciones."""
    def get(self, request):
        try:
            especializaciones = obtener_especializaciones()
            return Response(especializaciones, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GestionCasoCrearView(APIView):
    """Vista para crear un nuevo caso."""
    def post(self, request):
        try:
            data = request.data
            cod_cliente = data.get('cod_cliente')
            case_data = data # El frontend manda los datos del caso en el cuerpo, junto al cod_cliente
            
            # Llamar a la función del servicio
            resultado = crear_nuevo_caso(cod_cliente, case_data)
            
            return Response(resultado, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Imprimir el error en la consola de Django para depuración
            print(f"Error al crear caso: {e}") 
            # Devolver un 500 con el mensaje de error
            return Response({"error": f"Error interno al registrar el caso: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GestionCasoCrearView(APIView):
    """Vista para crear un nuevo caso."""
    def post(self, request):
        try:
            data = request.data
            cod_cliente = data.get('cod_cliente')
            
            if not cod_cliente:
                return Response({"error": "Falta el código de cliente (cod_cliente)."}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            resultado = crear_nuevo_caso(cod_cliente, data)
            
            return Response(resultado, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Imprimir el error exacto en la consola de Django
            traceback.print_exc() 
            
            # Devolver el error al frontend
            return Response({"error": f"Error interno al registrar el caso: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)