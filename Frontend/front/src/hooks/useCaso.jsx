// src/hooks/useCaso.jsx

import React, { useState, useCallback, useEffect, useMemo } from "react"; 
import { 
    fetchClienteConCasoActivo, 
    fetchSiguienteNoCaso,
    fetchEspecializaciones,
    fetchFormasPago,
    createNewCase,
    registrarAcuerdoPago
} from "../api/casoApi"; 

// Estado inicial para limpiar el formulario de caso
const initialCasoData = {
    nocaso: '',
    fechaInicio: '',
    fechaFin: '',
    especializacion: '',
    valor: ''
};

// Datos temporales para las formas de pago (Simulación de datos auxiliares)
const temporaryFormasPago = [
    { cod_forma_pago: 'EFECTIVO', nombre_forma_pago: 'Efectivo' },
    { cod_forma_pago: 'TARJETA', nombre_forma_pago: 'Tarjeta de Crédito/Débito' },
    { cod_forma_pago: 'TRANSFERENCIA', nombre_forma_pago: 'Transferencia Bancaria' },
];


export function useCasoLogic() {
    // ESTADO DEL CLIENTE
    const [nombreApellido, setNombreApellido] = useState(''); 
    const [clienteDoc, setClienteDoc] = useState(''); 
    const [clienteCod, setClienteCod] = useState(null); 
    
    // ESTADO DEL CASO Y LISTAS
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 
    const [listaEspecializaciones, setListaEspecializaciones] = useState([]); 

    const [listaFormasPago, setListaFormasPago] = useState([]);

    // ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);
    const [isCreatingNewCase, setIsCreatingNewCase] = useState(false); 
    
    // ESTADOS para Acuerdo de Pago
    const [showAcuerdoPagoForm, setShowAcuerdoPagoForm] = useState(false);
    const [acuerdoPagoData, setAcuerdoPagoData] = useState({
        valorAcuerdo: '',
        formaPago: '',
    });


    // EFECTO: Cargar las especializaciones y formas pago
    useEffect(() => {
        async function loadAuxiliaryData() {
            try {
                // Cargar especializaciones
                const espData = await fetchEspecializaciones();
                setListaEspecializaciones(espData);
                
                // Cargar formas de pago desde el backend
                const fpData = await fetchFormasPago();
                setListaFormasPago(fpData);

            } catch (error) {
                console.error("Error al cargar datos auxiliares:", error);
            }
        }
        loadAuxiliaryData();
    }, []);

    // HANDLER: Limpia el documento cuando el usuario escribe en Nombre/Apellido
    const handleNombreApellidoChange = (name) => {
        setNombreApellido(name); 
        
        // CORRECCIÓN: Limpieza de estados
        setClienteDoc(''); 
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true);
        setIsCreatingNewCase(false); // Salir de modo creación
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
    };
    
    // Handler para el campo de documento 
    const handleDocChange = (e) => {
        const doc = e.target.value;
        setClienteDoc(doc);
        if (doc.length > 0) {
            setNombreApellido('');
        }
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true);
        setIsCreatingNewCase(false); // Salir de modo creación
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
    };

    // 5. LÓGICA DE BÚSQUEDA (handleSearch)
    const handleSearch = useCallback(async () => {
        
        let nombreBusqueda = undefined;
        let apellidoBusqueda = undefined;
        let busquedaDocumento = clienteDoc.trim() || undefined; 
        
        if (!busquedaDocumento) { 
            const tokens = nombreApellido.trim().split(/\s+/).filter(Boolean);

            if (tokens.length < 2) {
                alert("Por favor, ingrese el Documento O al menos Nombre y Apellido completos (dos palabras).");
                return;
            }

            nombreBusqueda = tokens[0];
            apellidoBusqueda = tokens.slice(1).join(' '); 
        }

        try {
            const data = await fetchClienteConCasoActivo(nombreBusqueda, apellidoBusqueda, busquedaDocumento); 

            if (data && data.encontrado) { 
                setClienteExiste(true);
                setClienteDoc(data.cliente.documento || ''); 
                setNombreApellido(`${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim()); 
                setClienteCod(data.cliente.cod_cliente); 

                if (data.casos_activos && data.casos_activos.length > 0) {
                    setListaCasosActivos(data.casos_activos);
                    setCasoActivoExiste(true);

                    const ultimoCaso = data.casos_activos[0]; 

                    setCasoData({
                        nocaso: ultimoCaso.numero_caso,
                        fechaInicio: (ultimoCaso.fecha_inicio || '').slice(0,10),
                        fechaFin: ultimoCaso.fecha_fin ? ultimoCaso.fecha_fin.slice(0,10) : '',
                        especializacion: ultimoCaso.especializacion,
                        valor: ultimoCaso.valor
                    });
                    setIsCaseInputDisabled(true);
                    setIsCreatingNewCase(false); // No estamos creando
                } else {
                    setCasoActivoExiste(false);
                    setListaCasosActivos([]);
                }
            } else {
                const crearNuevo = window.confirm(
                    (data && data.mensaje) || "Cliente no encontrado. ¿Desea crear un nuevo cliente?"
                );

                if (crearNuevo) {
                    setClienteExiste(false);
                    setClienteDoc(busquedaDocumento || ''); 
                } else {
                    setNombreApellido('');
                    setClienteDoc(''); 
                    setClienteExiste(null);
                }
            }
        } catch (error) {
            console.error("Error al buscar cliente:", error);
            
            const crearNuevo = window.confirm("Cliente no encontrado. ¿Desea crear un nuevo cliente?");

            if (crearNuevo) {
                setClienteExiste(false);
                setClienteDoc(busquedaDocumento || ''); 
            } else {
                setNombreApellido('');
                setClienteDoc(''); 
                setClienteExiste(null);
            }
        }
        
    }, [nombreApellido, clienteDoc]); 

    // Lógica para seleccionar un caso activo de la lista desplegable
    const handleSelectCaso = useCallback((numeroCaso) => {
        const casoSeleccionado = listaCasosActivos.find(c => String(c.numero_caso) === String(numeroCaso));
        
        if (casoSeleccionado) {
            setCasoData({
                nocaso: casoSeleccionado.numero_caso,
                fechaInicio: (casoSeleccionado.fecha_inicio || '').slice(0,10),
                fechaFin: casoSeleccionado.fecha_fin ? casoSeleccionado.fecha_fin.slice(0,10) : '',
                especializacion: casoSeleccionado.especializacion, 
                valor: casoSeleccionado.valor
            });
            setIsCaseInputDisabled(true); 
            setCasoActivoExiste(true); 
            setIsCreatingNewCase(false); // No estamos creando
        }
    }, [listaCasosActivos]);

    // Lógica para inicializar la creación de un nuevo caso
    const handleCrearCaso = useCallback(async () => {
        
        if (!clienteCod) {
            alert("Primero debe buscar o crear un cliente válido.");
            return;
        }

        try {
            const siguienteNoCaso = await fetchSiguienteNoCaso();

            setCasoData({
                nocaso: siguienteNoCaso, 
                fechaInicio: new Date().toISOString().slice(0,10),
                fechaFin: '', 
                especializacion: '',
                valor: ''
            });
            setIsCaseInputDisabled(false); 
            setCasoActivoExiste(false); 
            setIsCreatingNewCase(true); // Habilitar modo creación

        } catch (error) {
            console.error("Error al obtener el número de caso consecutivo:", error);
            alert("No se pudo obtener el número de caso consecutivo. Inténtelo de nuevo.");
        }
    }, [clienteCod]); 

    // Handler genérico para cambios en los inputs del caso
    const handleCasoChange = (e) => {
        setCasoData({ ...casoData, [e.target.name]: e.target.value });
    };

    // ⭐️ LÓGICA DE VALIDACIÓN DEL BOTÓN ACEPTAR PAGO
    const isAcuerdoPagoButtonDisabled = useMemo(() => {
        const { valorAcuerdo, formaPago } = acuerdoPagoData;
        const valorNumerico = parseFloat(valorAcuerdo);
        
        // Requiere: caso activo, formulario visible, valor positivo, forma de pago seleccionada.
        return (
            !casoActivoExiste || 
            !showAcuerdoPagoForm ||
            !valorAcuerdo || 
            !formaPago || 
            isNaN(valorNumerico) ||
            valorNumerico <= 0
        );

    }, [casoActivoExiste, showAcuerdoPagoForm, acuerdoPagoData]);
    
    // HANDLER para cambios en el Acuerdo de Pago
    const handleAcuerdoPagoChange = useCallback((e) => {
        setAcuerdoPagoData(prevData => ({
            ...prevData, 
            [e.target.name]: e.target.value 
        }));
    }, []);

    // HANDLER: Aceptar Acuerdo de Pago
    const handleAceptarAcuerdoPago = useCallback(async () => {
        if (isAcuerdoPagoButtonDisabled) {
            alert("Por favor, ingrese un valor válido y seleccione la forma de pago.");
            return;
        }

        try {
            const resultado = await registrarAcuerdoPago(acuerdoPagoData);
            
            // Mostrar mensaje de éxito con el consecutivo
            alert(`✅ ${resultado.mensaje}`);
            
            // Limpiar el formulario de acuerdo de pago después del éxito
            setShowAcuerdoPagoForm(false);
            setAcuerdoPagoData({ valorAcuerdo: '', formaPago: '' });

        } catch (error) {
            console.error("Error al registrar acuerdo de pago:", error);
            alert(`Fallo al registrar el pago: ${error.message}`);
        }
    }, [isAcuerdoPagoButtonDisabled, acuerdoPagoData]);


    // LÓGICA DE VALIDACIÓN DEL BOTÓN GUARDAR
    const isSaveButtonDisabled = useMemo(() => {
        // El botón Guardar está deshabilitado si NO estamos creando un caso nuevo
        if (!isCreatingNewCase) {
            return true;
        }
        
        // Validaciones obligatorias del caso
        const { nocaso, fechaInicio, especializacion, valor } = casoData;
        const valorNumerico = parseFloat(valor);
        
        return (
            !nocaso || 
            !fechaInicio || 
            !especializacion || 
            !valor || 
            isNaN(valorNumerico) ||
            valorNumerico <= 0
        );

    }, [isCreatingNewCase, casoData]);


    // FUNCIÓN: Guardar el nuevo caso
    const handleGuardarCaso = useCallback(async () => {
        if (isSaveButtonDisabled || !clienteCod) {
            alert("Rellene todos los campos obligatorios (Especialización y Valor > 0) antes de guardar.");
            return;
        }

        try {
            const resultado = await createNewCase(clienteCod, casoData);
            
            alert(`Caso ${resultado.nocaso} registrado con éxito.`);

            // Limpiar modo creación y deshabilitar inputs
            setIsCreatingNewCase(false);
            setIsCaseInputDisabled(true); 
            
            // Opcional: Podríamos llamar a handleSearch() para recargar la lista de casos activos

        } catch (error) {
            console.error("Error al guardar el caso:", error);
            alert(`Fallo al registrar caso: ${error.message}`);
        }
    }, [isSaveButtonDisabled, clienteCod, casoData]);


    // FUNCIÓN: Handler para el botón Acuerdo de Pago
    const handleAcuerdoPago = useCallback(() => {
        // Toglea la visibilidad
        setShowAcuerdoPagoForm(prev => !prev);
        
        // Si se va a ocultar, limpiar los datos del acuerdo
        if (showAcuerdoPagoForm) {
             setAcuerdoPagoData({ valorAcuerdo: '', formaPago: '' });
        }
    }, [showAcuerdoPagoForm]);


    // DEVOLVER TODOS LOS ESTADOS Y FUNCIONES QUE EL COMPONENTE NECESITA
    return {
        nombreApellido,
        setNombreApellido: handleNombreApellidoChange, 
        clienteDoc,
        handleDocChange,
        clienteExiste,
        casoActivoExiste,
        casoData,
        listaCasosActivos,
        listaEspecializaciones,
        handleSearch,
        handleCrearCaso,
        handleSelectCaso,
        handleCasoChange,
        handleGuardarCaso, 
        handleAcuerdoPago, 
        isCaseInputDisabled,
        isSaveButtonDisabled, 
        
        showAcuerdoPagoForm,
        acuerdoPagoData,
        handleAcuerdoPagoChange,
        listaFormasPago,
        handleAceptarAcuerdoPago, 
        isAcuerdoPagoButtonDisabled,
    };
}