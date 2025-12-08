from django.urls import path
from .views import (
    ClienteView, AbogadoView, EspecializacionView, CasoView, PagoView, LugarView,
    TipodocumentoView, TipocontactView, TipolugarView, FormapagoView, FranquiciaView,
    ContactoView, DocumentoView, EspeciaEtapaView, ExpedienteView,
    ResultadoView, SucesoView
)

urlpatterns = [

    # ---------------- SIMPLE PK ----------------
    path("cliente/", ClienteView.as_view({'get': 'list', 'post': 'create'})),
    path("cliente/<pk>/", ClienteView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("abogado/", AbogadoView.as_view({'get': 'list', 'post': 'create'})),
    path("abogado/<pk>/", AbogadoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("especializacion/", EspecializacionView.as_view({'get': 'list', 'post': 'create'})),
    path("especializacion/<pk>/", EspecializacionView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("caso/", CasoView.as_view({'get': 'list', 'post': 'create'})),
    path("caso/<pk>/", CasoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("pago/", PagoView.as_view({'get': 'list', 'post': 'create'})),
    path("pago/<pk>/", PagoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("lugar/", LugarView.as_view({'get': 'list', 'post': 'create'})),
    path("lugar/<pk>/", LugarView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),


    # ----------- SIMPLE LOOKUP TABLES -----------

    path("tipodoc/", TipodocumentoView.as_view({'get': 'list', 'post': 'create'})),
    path("tipodoc/<pk>/", TipodocumentoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("tipocontacto/", TipocontactView.as_view({'get': 'list', 'post': 'create'})),
    path("tipocontacto/<pk>/", TipocontactView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("tipolugar/", TipolugarView.as_view({'get': 'list', 'post': 'create'})),
    path("tipolugar/<pk>/", TipolugarView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path("formapago/", FormapagoView.as_view({'get': 'list', 'post': 'create'})),
    path("formapago/<pk>/", FormapagoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),


    # -------- PK COMPUESTAS ---------------------

    path("contacto/<codcliente>/<consecontacto>/",
         ContactoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("contacto/", ContactoView.as_view({'get': 'list', 'post': 'create'})),

    path("documento/<nocaso>/<codespecializacion>/<pasoetapa>/<consecexpe>/<condoc>/",
         DocumentoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("documento/", DocumentoView.as_view({'get': 'list', 'post': 'create'})),

    path("especiaetapa/<codespecializacion>/<pasoetapa>/",
         EspeciaEtapaView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("especiaetapa/", EspeciaEtapaView.as_view({'get': 'list', 'post': 'create'})),

    path("expediente/<nocaso>/<codespecializacion>/<pasoetapa>/<consecexpe>/",
         ExpedienteView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("expediente/", ExpedienteView.as_view({'get': 'list', 'post': 'create'})),

    path("resultado/<nocaso>/<codespecializacion>/<pasoetapa>/<consecexpe>/<conresul>/",
         ResultadoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("resultado/", ResultadoView.as_view({'get': 'list', 'post': 'create'})),

    path("suceso/<nocaso>/<codespecializacion>/<pasoetapa>/<consecexpe>/<consuceso>/",
         SucesoView.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path("suceso/", SucesoView.as_view({'get': 'list', 'post': 'create'})),
]
