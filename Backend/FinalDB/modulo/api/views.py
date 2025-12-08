from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from ..models import (
    AbogaEspecia, Abogado, Caso, Cliente, Contacto, Documento,
    EspeciaEtapa, Especializacion, Etapaprocesal, Expediente,
    Formapago, Franquicia, Impugnacion, Instancia, Lugar,
    Pago, Resultado, Suceso
)

from .serializers import (
    AbogaEspeciaSerializer, AbogadoSerializer, CasoSerializer, ClienteSerializer,
    ContactoSerializer, DocumentoSerializer, EspeciaEtapaSerializer,
    EspecializacionSerializer, EtapaprocesalSerializer, ExpedienteSerializer,
    FormapagoSerializer, FranquiciaSerializer, ImpugnacionSerializer,
    InstanciaSerializer, LugarSerializer, PagoSerializer,
    ResultadoSerializer, SucesoSerializer, TipodocumentoSerializer, Tipodocumento,
    Tipocontact, TipocontactSerializer, Tipolugar, TipolugarSerializer
)

# -------------------------------
# ----- MODELOS SIMPLES --------
# -------------------------------

class GenericViewSet(viewsets.ModelViewSet):
    """Para modelos que SI tienen PK simple"""
    pass


class TipodocumentoView(GenericViewSet):
    queryset = Tipodocumento.objects.all()
    serializer_class = TipodocumentoSerializer


class TipocontactView(GenericViewSet):
    queryset = Tipocontact.objects.all()
    serializer_class = TipocontactSerializer


class TipolugarView(GenericViewSet):
    queryset = Tipolugar.objects.all()
    serializer_class = TipolugarSerializer


class FormapagoView(GenericViewSet):
    queryset = Formapago.objects.all()
    serializer_class = FormapagoSerializer


class FranquiciaView(GenericViewSet):
    queryset = Franquicia.objects.all()
    serializer_class = FranquiciaSerializer


# -------------------------------
# ----- MODELOS PRINCIPALES ----
# -------------------------------

class ClienteView(GenericViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class AbogadoView(GenericViewSet):
    queryset = Abogado.objects.all()
    serializer_class = AbogadoSerializer


class EspecializacionView(GenericViewSet):
    queryset = Especializacion.objects.all()
    serializer_class = EspecializacionSerializer


class CasoView(GenericViewSet):
    queryset = Caso.objects.all()
    serializer_class = CasoSerializer


class PagoView(GenericViewSet):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer


class LugarView(GenericViewSet):
    queryset = Lugar.objects.all()
    serializer_class = LugarSerializer


# -----------------------------------------
# ----- HANDLER PARA PK COMPUESTAS -------
# -----------------------------------------

class CompositePKViewSet(viewsets.ViewSet):
    """Vista base para modelos con llaves compuestas"""

    model = None
    serializer_class = None
    pk_fields = []   # Lista de campos que forman la PK

    def get_object(self, **kwargs):
        """Buscar el objeto usando un dict de la PK compuesta"""
        filters = {field: kwargs[field] for field in self.pk_fields}
        return get_object_or_404(self.model, **filters)

    def list(self, request):
        queryset = self.model.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, **kwargs):
        obj = self.get_object(**kwargs)
        serializer = self.serializer_class(obj)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, **kwargs):
        obj = self.get_object(**kwargs)
        serializer = self.serializer_class(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, **kwargs):
        obj = self.get_object(**kwargs)
        obj.delete()
        return Response(status=204)


# -----------------------------------------
# ---- MODELOS CON PK COMPUESTA ----------
# -----------------------------------------

class ContactoView(CompositePKViewSet):
    model = Contacto
    serializer_class = ContactoSerializer
    pk_fields = ["codcliente", "consecontacto"]


class DocumentoView(CompositePKViewSet):
    model = Documento
    serializer_class = DocumentoSerializer
    pk_fields = ["nocaso", "codespecializacion", "pasoetapa", "consecexpe", "condoc"]


class EspeciaEtapaView(CompositePKViewSet):
    model = EspeciaEtapa
    serializer_class = EspeciaEtapaSerializer
    pk_fields = ["codespecializacion", "pasoetapa"]


class ExpedienteView(CompositePKViewSet):
    model = Expediente
    serializer_class = ExpedienteSerializer
    pk_fields = ["nocaso", "codespecializacion", "pasoetapa", "consecexpe"]


class ResultadoView(CompositePKViewSet):
    model = Resultado
    serializer_class = ResultadoSerializer
    pk_fields = ["nocaso", "codespecializacion", "pasoetapa", "consecexpe", "conresul"]


class SucesoView(CompositePKViewSet):
    model = Suceso
    serializer_class = SucesoSerializer
    pk_fields = ["nocaso", "codespecializacion", "pasoetapa", "consecexpe", "consuceso"]
