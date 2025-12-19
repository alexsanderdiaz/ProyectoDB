from django.urls import path
from .views import *

urlpatterns = [
    path("abogado/", AbogadoView.as_view()),
    path("cliente/", ClienteView.as_view()),
    path("caso/", CasoView.as_view()),
    path("contacto/", ContactoView.as_view()),
    path("documento/", DocumentoView.as_view()),
    path("especia-etapa/", EspeciaEtapaView.as_view()),
    path("especializacion/", EspecializacionView.as_view()),
    path("etapaprocesal/", EtapaprocesalView.as_view()),
    path("expediente/", ExpedienteView.as_view()),
    path("formapago/", FormapagoView.as_view()),
    path("franquicia/", FranquiciaView.as_view()),
    path("impugnacion/", ImpugnacionView.as_view()),
    path("instancia/", InstanciaView.as_view()),
    path("lugar/", LugarView.as_view()),
    path("pago/", PagoView.as_view()),
    path("resultado/", ResultadoView.as_view()),
    path("suceso/", SucesoView.as_view()),
    path("tipocontact/", TipocontactView.as_view()),
    path("tipodocumento/", TipodocumentoView.as_view()),
    path("tipolugar/", TipolugarView.as_view()),
    
    # Rutas de Gestión de Caso
    path("gestion-caso/buscar-cliente/", GestionCasoBusquedaView.as_view()),
    path('gestion-caso/siguiente-nocaso/', GestionCasoSiguienteNoCasoView.as_view()),
    path('datos-auxiliares/especializaciones/', EspecializacionListView.as_view()),
    path('datos-auxiliares/formas-pago/', FormaPagoListView.as_view()),
    path('gestion-caso/registrar-pago/', RegistroPagoView.as_view()),
    path('gestion-caso/crear/', GestionCasoCrearView.as_view()),


    # Rutas de Gestión de Expediente
    path(
        "gestion-expediente/buscar/", 
        GestionExpedienteBusquedaView.as_view(), 
        name="expediente-busqueda"
    ),
    
    path(
        "gestion-expediente/datos-creacion/<str:accion>/", 
        ExpedienteCreacionDataView.as_view(), 
        name="expediente-creacion-data"
    ),
    
    
    path(
        "gestion-expediente/accion/", 
        GestionExpedienteAccionView.as_view(), 
        name="expediente-accion"
    ),

]
