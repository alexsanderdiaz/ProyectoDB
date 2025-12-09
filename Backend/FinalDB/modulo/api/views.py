from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .db import run_query
from .services.caso_service import buscar_cliente_con_caso_activo

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

        if not nombre or not apellido:
            return Response(
                {"error": "Se requieren nombre y apellido"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        resultado = buscar_cliente_con_caso_activo(nombre, apellido)

        if resultado:
            # Mapeamos los campos exactos de la tabla Cliente
            # run_query devuelve las llaves en minúscula
            return Response({
                "encontrado": True,
                "cliente": {
                    "cod_cliente": resultado['codcliente'], 
                    "documento": resultado['ndocumento'],
                    "nombre": resultado['nomcliente'],
                    "apellido": resultado['apellcliente']
                },
                "caso_activo": {
                    "numero_caso": resultado['nocaso'], 
                    "fecha_inicio": resultado['fechainicio'],
                    "especializacion": resultado['codespecializacion'],
                    "valor": resultado['valor']
                } if resultado['nocaso'] else None 
                # Si 'nocaso' es None, el front sabe que debe habilitar "Crear Caso" [cite: 36]
            })
        else:
            return Response({
                "encontrado": False,
                "mensaje": "Cliente no encontrado. Habilitar creación."
            })
