from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import traceback

# Importa las funciones de servicio específicas de caso
from .services.caso_service import (
    buscar_cliente_con_caso_activo,
    obtener_siguiente_no_caso,
    obtener_especializaciones,
    crear_nuevo_caso,
    obtener_formas_pago,
    registrar_pago_acuerdo,
)

# ==========================================================
# VISTAS DE GESTIÓN DE CASO (LÓGICA DE NEGOCIO)
# ==========================================================

class GestionCasoBusquedaView(APIView):
    """
    Vista para buscar un cliente y sus casos activos por documento O por nombre/apellido.
    GET /api/gestion-caso/buscar-cliente/?documento=... O ?nombre=...&apellido=...
    """
    def get(self, request):
        nombre = request.query_params.get('nombre')
        apellido = request.query_params.get('apellido')
        documento = request.query_params.get('documento') 

        # Validación de parámetros
        if not documento and (not nombre or not apellido):
            return Response(
                {"error": "Se requieren documento O nombre y apellido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Llamar al servicio
            resultado = buscar_cliente_con_caso_activo(nombre, apellido, documento)

            if resultado and resultado.get('encontrado'):
                return Response(resultado, status=status.HTTP_200_OK)
            else:
                return Response(
                    {
                        "encontrado": False,
                        "mensaje": resultado.get('mensaje', "Cliente no encontrado.") 
                    },
                    status=status.HTTP_404_NOT_FOUND 
                )
        except Exception as e:
             traceback.print_exc()
             return Response({"error": f"Error interno en la búsqueda: {str(e)}"}, 
                             status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GestionCasoSiguienteNoCasoView(APIView):
    """Vista para obtener el siguiente número de caso consecutivo."""
    def get(self, request):
        try:
            siguiente_id = obtener_siguiente_no_caso()
            return Response({"siguiente_nocaso": siguiente_id}, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error al obtener consecutivo: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EspecializacionListView(APIView):
    """Vista para obtener la lista de todas las especializaciones."""
    def get(self, request):
        try:
            especializaciones = obtener_especializaciones()
            return Response(especializaciones, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error al obtener especializaciones: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#VIEW PARA FORMA PAGO

class FormaPagoListView(APIView):
    """Vista para obtener la lista de todas las formas de pago."""
    def get(self, request):
        try:
            formas_pago = obtener_formas_pago()
            return Response(formas_pago, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error al obtener formas de pago: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Registrar Pago
class RegistroPagoView(APIView):
    """Vista para registrar un nuevo pago de acuerdo."""
    def post(self, request):
        try:
            data = request.data
            
            # Llamar al servicio de registro de pago
            resultado = registrar_pago_acuerdo(data) 
            
            return Response(resultado, status=status.HTTP_201_CREATED)
        
        except ValueError as ve:
            # Captura errores de validación de datos (valor negativo, forma de pago vacía)
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc() 
            return Response({"error": f"Error interno al registrar el pago: {str(e)}"}, 
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
            
            # El segundo argumento 'data' contiene todo el cuerpo (incluyendo nocaso, valor, etc.)
            resultado = crear_nuevo_caso(cod_cliente, data)
            
            return Response(resultado, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            traceback.print_exc() 
            return Response({"error": f"Error interno al registrar el caso: {str(e)}"}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)