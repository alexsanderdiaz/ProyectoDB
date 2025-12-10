# modulo/api/gestion_expediente_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import traceback

from .services.expediente_service import (
    buscar_expediente_por_nocaso,
    obtener_siguiente_consecutivo_expediente,
    obtener_primera_etapa_por_especialidad,
    obtener_abogados_por_especialidad,
    obtener_lugares,
    crear_expediente,
    actualizar_expediente, # Añadir la de actualizar
)

import traceback

class GestionExpedienteBusquedaView(APIView):
    """Vista para buscar un expediente por NoCaso."""
    def get(self, request):
        nocaso = request.query_params.get('nocaso')
        if not nocaso:
            return Response({"error": "Parámetro 'nocaso' requerido."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resultado = buscar_expediente_por_nocaso(nocaso)
            
            if resultado.get('encontrado', False):
                return Response(resultado, status=status.HTTP_200_OK)
            else:
                # Si no hay expediente, el servicio ya devolvió el CODESPECIALIZACION del CASO (si existe)
                # Devolver 404 para que el frontend entre en modo 'Crear' (Regla C)
                return Response(resultado, status=status.HTTP_404_NOT_FOUND) 
                
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error interno en la búsqueda: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExpedienteCreacionDataView(APIView):
    """Vista para obtener datos iniciales de creación (ID, Etapa, Listas)."""

    def get(self, request, accion):
        codespecializacion = request.query_params.get('codespecializacion')

        try:
            if accion == 'siguiente-id': # <-- Añadir esta lógica
                siguiente_id = obtener_siguiente_consecutivo_expediente()
                return Response({"idexpediente": siguiente_id}, status=status.HTTP_200_OK)
            
            elif accion == 'primera-etapa': # <-- Añadir esta lógica
                if not codespecializacion:
                     return Response({"error": "Parámetro 'codespecializacion' requerido."}, status=status.HTTP_400_BAD_REQUEST)
                etapa = obtener_primera_etapa_por_especialidad(codespecializacion)
                if etapa:
                     return Response(etapa, status=status.HTTP_200_OK)
                else:
                     return Response({"error": "Etapa inicial no encontrada."}, status=status.HTTP_404_NOT_FOUND)
                
            elif accion == 'abogados':
                if not codespecializacion:
                    return Response({"error": "Parámetro 'codespecializacion' requerido."}, status=status.HTTP_400_BAD_REQUEST)
                
                abogados = obtener_abogados_por_especialidad(codespecializacion) 
                return Response(abogados, status=status.HTTP_200_OK)
            
            elif accion == 'lugares': # <-- Añadir esta lógica
                lugares = obtener_lugares()
                return Response(lugares, status=status.HTTP_200_OK)
                
            else:
                return Response({"error": "Acción no válida."}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) # <-- Corregir el manejo de errores


# ✅ Renombrar la vista de manipulación para que coincida con urls.py
class GestionExpedienteAccionView(APIView): 
    """Vista para crear (POST) o actualizar (PUT) un expediente."""
    
    def post(self, request):
        # Usado para crear un nuevo expediente (Regla D)
        data = request.data
        required_fields = ['idexpediente', 'nocaso', 'noetapa', 'fechaetapa', 'cedula_abogado', 'codlugar', 'codespecializacion']
        
        if not all(field in data for field in required_fields):
            return Response({"error": f"Faltan campos requeridos: {required_fields}"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resultado = crear_expediente(data)
            return Response(resultado, status=status.HTTP_201_CREATED)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error interno al crear expediente: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        # Usado para actualizar un expediente existente (Regla B)
        data = request.data
        if 'idexpediente' not in data:
            return Response({"error": "Falta el ID del expediente para actualizar."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            resultado = actualizar_expediente(data)
            return Response(resultado, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error interno al actualizar expediente: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)