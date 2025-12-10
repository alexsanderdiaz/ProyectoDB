// src/hooks/useExpedienteLogic.jsx

import { useState, useCallback, useMemo } from 'react';
import { 
    fetchExpedientePorNoCaso,
    fetchSiguienteIdExpediente,
    fetchAbogadosPorEspecialidad,
    fetchLugares,
    fetchPrimeraEtapa 
} from '../api/expedienteApi'; 

// Estado inicial del formulario del expediente
const initialExpedienteData = {
    idexpediente: '', // CONSECEXPE
    nocaso: '',
    noetapa: '',
    fechaetapa: '',
    nombre_abogado: '',
    ciudad: '',
    nometapa: '',
    nominstancia: '',
    nombre_impugnacion: '',
    suceso: '',
    resultado: '',
    documentos: [],
    fechafin_caso: null, // Clave para Reglas A y B
    codespecializacion: null, // Necesario para buscar Abogados/Etapas
    isNewCase: false, // Flag para el modo de creación activo
};

export function useExpedienteLogic() {
    const [noCasoInput, setNoCasoInput] = useState('');
    const [expedienteData, setExpedienteData] = useState(initialExpedienteData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para las listas desplegables
    const [abogadosList, setAbogadosList] = useState([]);
    const [lugaresList, setLugaresList] = useState([]);

    // 1. LÓGICA DE BÚSQUEDA
    const handleSearch = useCallback(async (nocaso) => {
        if (!nocaso) {
            setError("Por favor, ingrese un número de caso.");
            setExpedienteData(initialExpedienteData);
            return;
        }

        setLoading(true);
        setError(null);
        // Limpiamos los datos del expediente, pero mantenemos el NoCasoInput
        setExpedienteData({...initialExpedienteData, nocaso: nocaso}); 

        try {
            const data = await fetchExpedientePorNoCaso(nocaso);

            if (data.encontrado) {
                // Caso Existente (Reglas A o B)
                
                // 🛑 NECESITAS EL CODIGO DE ESPECIALIZACION DEL CASO PADRE 🛑
                // Asumiremos que el backend lo devuelve, si no, hay que añadirlo a la consulta.
                const codEspecialidad = data.codespecializacion || 'LAB'; 
                
                // Cargar listas si es un caso existente que se puede editar (Regla B)
                if (!data.fechafin_caso) {
                    setAbogadosList(await fetchAbogadosPorEspecialidad(codEspecialidad));
                    setLugaresList(await fetchLugares());
                }

                setExpedienteData({ 
                    ...data,
                    // Formato de fecha para el input type="date"
                    fechaetapa: data.fechaetapa ? new Date(data.fechaetapa).toISOString().split('T')[0] : '', 
                    documentos: data.documentos || [], 
                    isNewCase: false,
                });
                
            } else {
                // Caso No encontrado -> Modo Creación (Regla C)
                setError(data.mensaje);
                setExpedienteData(prev => ({
                    ...initialExpedienteData,
                    nocaso: nocaso, // Mantenemos el NoCaso ingresado
                }));
            }
        } catch (err) {
            console.error("Error al buscar expediente:", err);
            setError(err.message || 'Error al buscar el expediente.');
            setExpedienteData(initialExpedienteData);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. FUNCIÓN CREAR EXPEDIENTE (Regla D)
    const handleCrearExpediente = useCallback(async () => {
        if (!noCasoInput) return;

        setLoading(true);
        setError(null);

        try {
            // Asumir que el backend tiene la especialización para el NoCaso dado
            // 🛑 NECESITAS EL CODIGO DE ESPECIALIZACION DEL CASO PADRE 🛑
            const codEspecialidadSimulada = 'LAB'; 

            // D i. Un número de expediente (consecutivo)
            const nextId = await fetchSiguienteIdExpediente(); 
            
            // D ii, iii, iv. No. etapa (1), Fecha (hoy), Nombre etapa (primera)
            const today = new Date().toISOString().split('T')[0];
            const primeraEtapa = await fetchPrimeraEtapa(codEspecialidadSimulada);
            
            // D v. Abogados por especialidad
            const abogados = await fetchAbogadosPorEspecialidad(codEspecialidadSimulada);
            setAbogadosList(abogados);

            // D vi. Lista de Lugares
            const lugares = await fetchLugares();
            setLugaresList(lugares);

            // Actualizar el Estado del Formulario en Modo Creación Activo
            setExpedienteData(prev => ({
                ...initialExpedienteData, 
                nocaso: noCasoInput,
                idexpediente: nextId.toString(), // i. consecutivo
                noetapa: primeraEtapa.noetapa, // ii. 1 
                fechaetapa: today, // iii. fecha del día
                nometapa: primeraEtapa.nometapa, // iv. nombre de la etapa
                codespecializacion: codEspecialidadSimulada,
                
                // Setear valores iniciales para las listas si existen elementos
                nombre_abogado: abogados.length > 0 ? abogados[0].nombre_completo : '', 
                ciudad: lugares.length > 0 ? lugares[0].nomlugar : '', 
                
                isNewCase: true, // Flag de modo creación ACTIVO
            }));
            
        } catch (err) {
            console.error("Error al iniciar la creación:", err);
            setError('Error al obtener datos iniciales para crear el expediente.');
            setExpedienteData(initialExpedienteData);
        } finally {
            setLoading(false);
        }
    }, [noCasoInput]);


    // 3. LÓGICA DE REGLAS A, B, C, D (useMemo)
    const { 
        isCaseFound, 
        isCaseClosed, 
        isCreateModeInitial, 
        isCreateModeActive, 
        isFullEditable,      
        isGuardarDisabled 
    } = useMemo(() => {
        const found = !!expedienteData.idexpediente && !expedienteData.isNewCase; // Excluye el marcador de nuevo caso
        
        // Regla A: Caso Existente CON Fecha Fin
        const closed = found && !!expedienteData.fechafin_caso; 
        
        // Regla C: Caso no encontrado, pero hay un NoCaso listo para el botón 'Crear'
        const createInitial = !found && !!noCasoInput && expedienteData.nocaso === noCasoInput && !loading; 
        
        // Regla D: El usuario presionó 'Crear'
        const createActive = expedienteData.isNewCase; 

        // Editable si es un caso abierto (Regla B) O si el modo 'Crear' está activo (Regla D)
        const editable = (found && !closed) || createActive; 

        // Los inputs están deshabilitados si:
        // 1. Caso Cerrado (Regla A)
        // 2. Modo de Creación Inicial (Regla C - ANTES de presionar 'Crear').
        const disabled = closed || createInitial;

        // El botón Guardar se deshabilita si:
        // 1. Caso Cerrado (Regla A)
        // 2. No estamos en un modo editable (editable === false).
        const guardarDisabled = closed || !editable; 

        return { 
            isCaseFound: found,
            isCaseClosed: closed, 
            isCreateModeInitial: createInitial,
            isCreateModeActive: createActive,
            isInputsDisabled: disabled,
            isFullEditable: editable,
            isGuardarDisabled: guardarDisabled,
        };
    }, [expedienteData, noCasoInput, loading]);

    // Handlers genéricos y placeholder
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch(noCasoInput);
        }
    };
    const handleExpedienteChange = useCallback((e) => {
        const { name, value } = e.target;
        setExpedienteData(prev => ({ ...prev, [name]: value, }));
    }, []);
    const handleGuardarExpediente = useCallback(() => {
        alert(`Guardando/Actualizando expediente ${expedienteData.idexpediente}... (Función a implementar)`);
    }, [expedienteData]);

    return {
        // Estado y Data
        noCasoInput, setNoCasoInput,
        expedienteData, loading, error,
        abogadosList, lugaresList,

        // Handlers
        handleSearch,
        handleKeyDown,
        handleExpedienteChange,
        handleGuardarExpediente,
        handleCrearExpediente,

        // Reglas de UI
        isCaseFound,
        isCaseClosed,
        isCreateModeInitial,
        isCreateModeActive,
        isFullEditable,
        isGuardarDisabled,
    };
}