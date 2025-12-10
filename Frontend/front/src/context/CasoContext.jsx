// src/context/CasoContext.jsx (REFINADO)

import React, { 
    createContext, 
    useContext, 
    useState, 
    useCallback, 
    useEffect, 
    useMemo 
} from "react"; 

import { 
    fetchClienteConCasoActivo, 
    fetchSiguienteNoCaso,
    fetchEspecializaciones,
    createNewCase 
} from "../api/casoApi"; 


const CasoContext = createContext(null); 

const initialCasoData = {
    nocaso: '',
    fechaInicio: '',
    fechaFin: '',
    especializacion: '',
    valor: ''
};


export function CasoProvider({ children }) {
    // 🛑 ESTADOS DE BÚSQUEDA Y CLIENTE (Necesitan ser globales para persistir)
    const [nombreApellido, setNombreApellido] = useState(''); 
    const [clienteDoc, setClienteDoc] = useState(''); 
    const [clienteCod, setClienteCod] = useState(null); 
    const [clienteExiste, setClienteExiste] = useState(null);
    
    // 🛑 ESTADOS DEL CASO (Necesitan ser globales para persistir)
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    
    // 🛑 ESTADO DE LISTAS MAESTRAS
    const [listaEspecializaciones, setListaEspecializaciones] = useState([]); 

    // 🛑 ESTADO DE INTERFAZ MÍNIMO NECESARIO PARA COMPARTIR
    const [isCreatingNewCase, setIsCreatingNewCase] = useState(false); 


    // EFECTO CORE: Cargar las especializaciones
    useEffect(() => {
        // ... (Tu lógica para cargar especializaciones) ...
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

    // FUNCIÓN CORE: Limpia el estado del caso y cliente
    const resetState = useCallback(() => {
        setClienteCod(null);
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCreatingNewCase(false); 
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
    }, []);


    // FUNCIÓN CORE: Búsqueda (La dejamos aquí, es el motor principal)
    const handleSearch = useCallback(async () => {
        // ... (Toda la lógica de búsqueda de fetchClienteConCasoActivo) ...
        // ... (Actualización de estados: setClienteCod, setClienteExiste, setListaCasosActivos, setCasoData) ...

        let nombreBusqueda = undefined;
        let apellidoBusqueda = undefined;
        let busquedaDocumento = clienteDoc.trim() || undefined; 
        
        // [VALIDACIÓN DE ENTRADA]
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
                setClienteDoc(data.cliente.documento || clienteDoc || ''); 
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
                    setIsCreatingNewCase(false); 
                } else {
                    setCasoActivoExiste(false);
                    setListaCasosActivos([]);
                    setCasoData(initialCasoData);
                }
            } else {
                // Lógica de cliente no encontrado (crear nuevo, limpiar, etc.)
                const docParaCrear = busquedaDocumento || clienteDoc;
                const crearNuevo = window.confirm((data && data.mensaje) || "Cliente no encontrado. ¿Desea crear un nuevo cliente?");

                if (crearNuevo) {
                    setClienteExiste(false);
                    setClienteDoc(docParaCrear || ''); 
                    setNombreApellido(nombreBusqueda ? `${nombreBusqueda} ${apellidoBusqueda}`.trim() : '');
                    setClienteCod(null);
                } else {
                    setNombreApellido('');
                    setClienteDoc(''); 
                    resetState();
                }
            }
        } catch (error) {
            console.error("Error al buscar cliente:", error);
            alert(`Error en la búsqueda. ${error.message}`);
            resetState();
        }
    }, [nombreApellido, clienteDoc, resetState]);


    // FUNCIÓN CORE: Seleccionar caso de la lista
    const handleSelectCaso = useCallback((numeroCaso) => {
        // ... (Tu lógica para seleccionar caso) ...
        const casoSeleccionado = listaCasosActivos.find(c => String(c.numero_caso) === String(numeroCaso));
        
        if (casoSeleccionado) {
            setCasoData({
                nocaso: casoSeleccionado.numero_caso,
                fechaInicio: (casoSeleccionado.fecha_inicio || '').slice(0,10),
                fechaFin: casoSeleccionado.fecha_fin ? casoSeleccionado.fecha_fin.slice(0,10) : '',
                especializacion: casoSeleccionado.especializacion, 
                valor: casoSeleccionado.valor
            });
            setCasoActivoExiste(true); 
            setIsCreatingNewCase(false); 
        }
    }, [listaCasosActivos]);


    // FUNCIÓN CORE: Inicializar la creación de un nuevo caso
    const handleCrearCaso = useCallback(async () => {
        if (clienteExiste === null) {
            alert("Primero debe buscar o ingresar los datos del cliente.");
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
            setCasoActivoExiste(false); 
            setIsCreatingNewCase(true); // Habilitar modo creación

        } catch (error) {
            console.error("Error al obtener el número de caso consecutivo:", error);
            alert("No se pudo obtener el número de caso consecutivo. Inténtelo de nuevo.");
        }
    }, [clienteExiste]); 
    

    // FUNCIONES NÚCLEO EXPUESTAS EN EL CONTEXTO
    const contextValue = useMemo(() => ({
        // ESTADOS GLOBALES (Lectura)
        nombreApellido,
        clienteDoc,
        clienteCod,
        clienteExiste,
        casoActivoExiste,
        casoData,
        listaCasosActivos,
        listaEspecializaciones,
        isCreatingNewCase,

        // SETTERS (Permiten a la lógica de la vista modificar el estado)
        setNombreApellido, 
        setClienteDoc,
        setCasoData,
        setIsCreatingNewCase,

        // FUNCIONES CORE (Acciones compartidas)
        handleSearch,
        handleSelectCaso,
        handleCrearCaso,
        resetState,
        // No exponemos handleGuardarCaso aquí, va al hook de CasoPage
        
    }), [
        nombreApellido, clienteDoc, clienteCod, clienteExiste, casoActivoExiste,
        casoData, listaCasosActivos, listaEspecializaciones, isCreatingNewCase,
        handleSearch, handleSelectCaso, handleCrearCaso, resetState,
    ]);

    return (
        <CasoContext.Provider value={contextValue}>
            {children}
        </CasoContext.Provider>
    );
}

// 3. CUSTOM HOOK PARA CONSUMIR EL CONTEXTO
export const useCaso = () => {
    const context = useContext(CasoContext);

    if (context === undefined) {
        throw new Error('useCaso debe usarse dentro de un CasoProvider');
    }

    return context;
};