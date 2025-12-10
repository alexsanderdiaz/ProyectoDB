# modulo/api/gestion_expediente_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import traceback

from .services.expediente_service import (
    buscar_expediente_por_nocaso,
)

class GestionExpedienteBusquedaView(APIView):
    """
    Vista para buscar la información completa de un expediente por número de caso (NoCaso).
    GET /api/gestion-expediente/buscar/?nocaso=...
    """
    def get(self, request):
        nocaso = request.query_params.get('nocaso')
        
        if not nocaso:
            return Response(
                {"error": "El parámetro 'nocaso' es obligatorio para la búsqueda de expediente."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resultado = buscar_expediente_por_nocaso(nocaso)

            if resultado.get('encontrado'):
                return Response(resultado, status=status.HTTP_200_OK)
            else:
                return Response(
                    {
                        "encontrado": False,
                        "mensaje": resultado.get('mensaje', "Expediente no encontrado.") 
                    },
                    status=status.HTTP_404_NOT_FOUND 
                )
        except Exception as e:
             traceback.print_exc()
             return Response({"error": f"Error interno en la búsqueda de expediente: {str(e)}"}, 
                             status=status.HTTP_500_INTERNAL_SERVER_ERROR)