from rest_framework import serializers
from modulo.models import (
    AbogaEspecia, Abogado, Caso, Cliente, Contacto, Documento,
    EspeciaEtapa, Especializacion, Etapaprocesal, Expediente,
    Formapago, Franquicia, Impugnacion, Instancia, Lugar,
    Pago, Resultado, Suceso, Tipocontact, Tipodocumento, Tipolugar
)

# --------- SIMPLES ------------------

class TipodocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipodocumento
        fields = '__all__'


class TipocontactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipocontact
        fields = '__all__'


class TipolugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipolugar
        fields = '__all__'


class FormapagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formapago
        fields = '__all__'


class FranquiciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Franquicia
        fields = '__all__'


# --------- MODELOS PRINCIPALES ------------------

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class AbogadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abogado
        fields = '__all__'


class EspecializacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especializacion
        fields = '__all__'


class CasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caso
        fields = '__all__'


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'


class LugarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar
        fields = '__all__'


# --------- RELACIONALES / COMPUESTAS ------------------

class AbogaEspeciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AbogaEspecia
        fields = '__all__'


class ContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacto
        fields = '__all__'


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'


class EspeciaEtapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EspeciaEtapa
        fields = '__all__'


class EtapaprocesalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etapaprocesal
        fields = '__all__'


class ExpedienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expediente
        fields = '__all__'


class ImpugnacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impugnacion
        fields = '__all__'


class InstanciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instancia
        fields = '__all__'


class ResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultado
        fields = '__all__'


class SucesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suceso
        fields = '__all__'
