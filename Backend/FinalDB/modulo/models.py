from django.db import models


class AbogaEspecia(models.Model):
    idabogaespecia = models.IntegerField(primary_key=True)
    # FOREIGN KEY (PK Simple) - CORRECTO
    codespecializacion = models.ForeignKey('Especializacion', models.DO_NOTHING, db_column='codespecializacion')
    cedula = models.ForeignKey('Abogado', models.DO_NOTHING, db_column='cedula')

    class Meta:
        managed = False
        db_table = 'aboga_especia'


class Abogado(models.Model):
    cedula = models.CharField(primary_key=True, max_length=10)
    nombre = models.CharField(max_length=30)
    apellido = models.CharField(max_length=30)
    ntarjetaprofesional = models.CharField(max_length=5)

    class Meta:
        managed = False
        db_table = 'abogado'


class Caso(models.Model):
    nocaso = models.IntegerField(primary_key=True)
    codespecializacion = models.ForeignKey('Especializacion', models.DO_NOTHING, db_column='codespecializacion')
    codcliente = models.ForeignKey('Cliente', models.DO_NOTHING, db_column='codcliente')
    fechainicio = models.DateField()
    fechafin = models.DateField(blank=True, null=True)
    valor = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'caso'


class Cliente(models.Model):
    codcliente = models.CharField(primary_key=True, max_length=5)
    idtipodoc = models.ForeignKey('Tipodocumento', models.DO_NOTHING, db_column='idtipodoc')
    nomcliente = models.CharField(max_length=30)
    apellcliente = models.CharField(max_length=30)
    ndocumento = models.CharField(max_length=15)

    class Meta:
        managed = False
        db_table = 'cliente'


class Contacto(models.Model):
    pk = models.CompositePrimaryKey('codcliente', 'consecontacto')
    # FOREIGN KEY (CPK) - CORRECTO: codcliente es FK a Cliente (PK simple)
    codcliente = models.ForeignKey(Cliente, models.DO_NOTHING, db_column='codcliente')
    consecontacto = models.IntegerField()
    idtipoconta = models.ForeignKey('Tipocontact', models.DO_NOTHING, db_column='idtipoconta')
    valorcontacto = models.CharField(max_length=50)
    notificacion = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'contacto'


class Documento(models.Model):
    pk = models.CompositePrimaryKey('nocaso', 'codespecializacion', 'pasoetapa', 'consecexpe', 'condoc')
    
    # 🔴 ERROR CORREGIDO:
    # Estos 4 campos forman una FK COMPUESTA a Expediente.
    # El ORM de Django NO soporta ForeignKeys compuestas de esta manera.
    # Se cambian a campos de datos simples para ser usados solo por la base de datos (managed=False).
    nocaso = models.IntegerField(db_column='nocaso') # FK a Expediente.nocaso (que es FK a Caso)
    codespecializacion = models.CharField(max_length=3, db_column='codespecializacion') # FK a Expediente.codespecializacion
    pasoetapa = models.IntegerField(db_column='pasoetapa') # FK a Expediente.pasoetapa
    consecexpe = models.IntegerField(db_column='consecexpe') # FK a Expediente.consecexpe
    
    condoc = models.IntegerField()
    ubicadoc = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'documento'


class EspeciaEtapa(models.Model):
    pk = models.CompositePrimaryKey('codespecializacion', 'pasoetapa')
    # FOREIGN KEY (CPK) - CORRECTO: codespecializacion es FK a Especializacion (PK simple)
    codespecializacion = models.ForeignKey('Especializacion', models.DO_NOTHING, db_column='codespecializacion')
    pasoetapa = models.IntegerField()
    ninstancia = models.ForeignKey('Instancia', models.DO_NOTHING, db_column='ninstancia', blank=True, null=True)
    codetapa = models.ForeignKey('Etapaprocesal', models.DO_NOTHING, db_column='codetapa', blank=True, null=True)
    idimpugna = models.ForeignKey('Impugnacion', models.DO_NOTHING, db_column='idimpugna', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'especia_etapa'


class Especializacion(models.Model):
    codespecializacion = models.CharField(primary_key=True, max_length=3)
    nomespecializacion = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'especializacion'


class Etapaprocesal(models.Model):
    codetapa = models.CharField(primary_key=True, max_length=3)
    nometapa = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'etapaprocesal'


class Expediente(models.Model):
    pk = models.CompositePrimaryKey('nocaso', 'codespecializacion', 'pasoetapa', 'consecexpe')
    # FOREIGN KEY (PK Simple) - CORRECTO
    nocaso = models.ForeignKey(Caso, models.DO_NOTHING, db_column='nocaso')
    
    # 🔴 ERROR CORREGIDO:
    # Estos 2 campos forman una FK COMPUESTA a EspeciaEtapa.
    # Se cambian a campos de datos simples. El campo nocaso es una FK simple, los demás son parte de la CPK.
    # El campo codespecializacion es VARCHAR(3) en Especializacion.
    codespecializacion = models.CharField(max_length=3, db_column='codespecializacion') 
    pasoetapa = models.IntegerField(db_column='pasoetapa')
    
    consecexpe = models.IntegerField()
    codlugar = models.ForeignKey('Lugar', models.DO_NOTHING, db_column='codlugar')
    cedula = models.ForeignKey('Abogado', models.DO_NOTHING, db_column='cedula', blank=True, null=True)
    fechaetapa = models.DateField()

    class Meta:
        managed = False
        db_table = 'expediente'


class Formapago(models.Model):
    idformapago = models.CharField(primary_key=True, max_length=3)
    descformapago = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'formapago'


class Franquicia(models.Model):
    codfranquicia = models.CharField(primary_key=True, max_length=3)
    nomfranquicia = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'franquicia'


class Impugnacion(models.Model):
    idimpugna = models.CharField(primary_key=True, max_length=2)
    nomimpugna = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'impugnacion'


class Instancia(models.Model):
    # Asumimos que BooleanField es lo que corresponde al tipo de dato subyacente de Oracle.
    ninstancia = models.BooleanField(primary_key=True) 

    class Meta:
        managed = False
        db_table = 'instancia'


class Lugar(models.Model):
    codlugar = models.CharField(primary_key=True, max_length=5)
    idtipolugar = models.ForeignKey('Tipolugar', models.DO_NOTHING, db_column='idtipolugar', blank=True, null=True)
    # FOREIGN KEY (Self-Referencial) - CORRECTO
    lug_codlugar = models.ForeignKey('self', models.DO_NOTHING, db_column='lug_codlugar', blank=True, null=True)
    nomlugar = models.CharField(max_length=30)
    direlugar = models.CharField(max_length=40)
    tellugar = models.CharField(max_length=15)
    emaillugar = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'lugar'


class Pago(models.Model):
    consecpago = models.IntegerField(primary_key=True)
    codfranquicia = models.ForeignKey(Franquicia, models.DO_NOTHING, db_column='codfranquicia', blank=True, null=True)
    idformapago = models.ForeignKey(Formapago, models.DO_NOTHING, db_column='idformapago', blank=True, null=True)
    fechapago = models.DateField(blank=True, null=True)
    valorpago = models.IntegerField()
    ntarjeta = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pago'


class Resultado(models.Model):
    pk = models.CompositePrimaryKey('nocaso', 'codespecializacion', 'pasoetapa', 'consecexpe', 'conresul')
    
    # 🔴 ERROR CORREGIDO:
    # Mismo problema y solución que en Documento.
    nocaso = models.IntegerField(db_column='nocaso')
    codespecializacion = models.CharField(max_length=3, db_column='codespecializacion')
    pasoetapa = models.IntegerField(db_column='pasoetapa')
    consecexpe = models.IntegerField(db_column='consecexpe')
    
    conresul = models.IntegerField()
    descresul = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'resultado'


class Suceso(models.Model):
    pk = models.CompositePrimaryKey('nocaso', 'codespecializacion', 'pasoetapa', 'consecexpe', 'consuceso')
    
    # 🔴 ERROR CORREGIDO:
    # Mismo problema y solución que en Documento.
    nocaso = models.IntegerField(db_column='nocaso')
    codespecializacion = models.CharField(max_length=3, db_column='codespecializacion')
    pasoetapa = models.IntegerField(db_column='pasoetapa')
    consecexpe = models.IntegerField(db_column='consecexpe')
    
    consuceso = models.IntegerField()
    descsuceso = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'suceso'


class Tipocontact(models.Model):
    idtipoconta = models.CharField(primary_key=True, max_length=3)
    desctipoconta = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'tipocontact'


class Tipodocumento(models.Model):
    idtipodoc = models.CharField(primary_key=True, max_length=2)
    desctipodoc = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'tipodocumento'


class Tipolugar(models.Model):
    idtipolugar = models.CharField(primary_key=True, max_length=4)
    desctipolugar = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tipolugar'