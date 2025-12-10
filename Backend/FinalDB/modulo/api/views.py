from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .db import run_query # Importamos run_query
# Nota: Ya no necesitamos importar las funciones del caso_service aquí

# Importamos las vistas de Gestión de Caso para que puedan ser mapeadas en urls.py
from .gestion_caso_views import (
    GestionCasoBusquedaView,
    GestionCasoSiguienteNoCasoView,
    EspecializacionListView,
    GestionCasoCrearView
)
# ==========================================================
# VISTAS GENERALES (GENÉRICAS DE TABLA)
# ==========================================================

class TableView(APIView):
    """Vista genérica para consultar cualquier tabla"""

    table = None  # Nombre real de la tabla en Oracle
    pk = None     # Clave primaria simple (si existe)

    # GET → devuelve todos los registros
    def get(self, request):
        sql = f"SELECT * FROM {self.table}"
        # ✅ Usamos la función run_query para la consulta
        data = run_query(sql) 
        return Response(data)


# ==========================================================
# LISTA COMPLETA DE TABLAS
# ==========================================================

class AbogadoView(TableView):
    table = "abogado"

class ClienteView(TableView):
    table = "cliente"

class CasoView(TableView):
    table = "caso"

# ... (El resto de tus vistas genéricas para cada tabla) ...

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
