from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .db import run_query

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
