// src/hooks/useCaso.jsx

import React, { useState, useCallback, useEffect, useMemo } from "react"; 
import { 
    fetchClienteConCasoActivo, 
    fetchSiguienteNoCaso,
    fetchEspecializaciones,
    createNewCase // IMPORTAR LA FUNCIÓN DE CREACIÓN
} from "../api/casoApi"; 

// Estado inicial para limpiar el formulario de caso
const initialCasoData = {
    nocaso: '',
    fechaInicio: '',
    fechaFin: '',
    especializacion: '',
    valor: ''
};

export function useCasoLogic() {
    // 2. ESTADO DEL CLIENTE
    const [nombreApellido, setNombreApellido] = useState(''); 
    const [clienteDoc, setClienteDoc] = useState(''); 
    const [clienteCod, setClienteCod] = useState(null); 
    
    // 3. ESTADO DEL CASO Y LISTAS
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 
    const [listaEspecializaciones, setListaEspecializaciones] = useState([]); 

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);
    // NUEVO ESTADO: Bandera para saber si estamos en modo "Crear Caso Nuevo"
    const [isCreatingNewCase, setIsCreatingNewCase] = useState(false); 


    // EFECTO: Cargar las especializaciones
    useEffect(() => {
        async function loadEspecializaciones() {
            try {
                const data = await fetchEspecializaciones();
                setListaEspecializaciones(data);
            } catch (error) {
                console.error("Error al cargar especializaciones:", error);
            }
        }
        loadEspecializaciones();
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


    // LÓGICA DE VALIDACIÓN DEL BOTÓN GUARDAR
    const isSaveButtonDisabled = useMemo(() => {
        // El botón Guardar está deshabilitado si NO estamos creando un caso nuevo
        if (!isCreatingNewCase) {
            return true;
        }
        
        // Validaciones obligatorias
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
        if (window.confirm("¿Desea incluir un acuerdo de pago para este caso?")) {
            console.log("Acuerdo de pago aceptado por el usuario.");
        } else {
            console.log("Acuerdo de pago cancelado por el usuario.");
        }
    }, []);


    // 6. DEVOLVER TODOS LOS ESTADOS Y FUNCIONES QUE EL COMPONENTE NECESITA
    return {
        nombreApellido,
        setNombreApellido: handleNombreApellidoChange, // EXPORTAR EL HANDLER CORREGIDO
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
    };
}