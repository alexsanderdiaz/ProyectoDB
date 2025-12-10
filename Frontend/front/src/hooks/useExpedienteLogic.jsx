// src/hooks/useExpedienteLogic.jsx

import { useState, useCallback, useMemo } from 'react';
import { fetchExpedientePorNoCaso } from '../api/expedienteApi'; 

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
    fechafin_caso: null, // Viene del backend para las reglas A y B
};

export function useExpedienteLogic() {
    const [noCasoInput, setNoCasoInput] = useState('');
    const [expedienteData, setExpedienteData] = useState(initialExpedienteData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = useCallback(async (nocaso) => {
        if (!nocaso) {
            setError("Por favor, ingrese un número de caso.");
            setExpedienteData(initialExpedienteData);
            return;
        }

        setLoading(true);
        setError(null);
        setExpedienteData(initialExpedienteData); 

        try {
            const data = await fetchExpedientePorNoCaso(nocaso);

            if (data.encontrado) {
                // Caso Existente (Reglas A o B)
                setExpedienteData({ 
                    ...data,
                    fechaetapa: data.fechaetapa ? new Date(data.fechaetapa).toISOString().split('T')[0] : '', 
                    documentos: data.documentos || [], 
                });
                
            } else {
                // Caso No encontrado -> Modo Creación Inicial (Regla C)
                setError(data.mensaje);
                setExpedienteData(prev => ({
                    ...initialExpedienteData,
                    nocaso: nocaso, // Mantenemos el NoCaso ingresado
                }));
            }
        } catch (err) {
            console.error("Error en useExpedienteLogic:", err);
            setError(err.message || 'Error al buscar el expediente.');
            setExpedienteData(initialExpedienteData);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handler para la tecla ENTER
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch(noCasoInput);
        }
    };

    // Handler genérico para cambios en los inputs
    const handleExpedienteChange = useCallback((e) => {
        const { name, value } = e.target;
        setExpedienteData(prev => ({ ...prev, [name]: value, }));
    }, []);


    // **********************************************
    // LÓGICA DE REGLAS A, B, C
    // **********************************************
    const { 
        isCaseFound, 
        isCaseClosed, 
        isCreateModeInitial, // Caso no encontrado, listo para presionar 'Crear'
        isInputsDisabled,
        isFullEditable,      // Caso existente y abierto (Regla B) O se presionó 'Crear'
        isGuardarDisabled 
    } = useMemo(() => {
        const found = !!expedienteData.idexpediente;
        
        // Regla A: Caso Existente CON Fecha Fin
        const closed = found && !!expedienteData.fechafin_caso; 
        
        // Regla C: Caso no encontrado, pero hay un NoCaso listo para ser creado
        const createInitial = !found && !!noCasoInput && !loading;
        
        // Se considera editable si está en modo "caso abierto" (Regla B) 
        // o si ya se presionó el botón 'Crear' (idexpediente === 'NUEVO').
        const editable = (found && !closed) || expedienteData.idexpediente === 'NUEVO'; 

        // Los inputs están deshabilitados si:
        // 1. Caso Cerrado (Regla A)
        // 2. Modo de Creación Inicial (Regla C - antes de presionar 'Crear')
        const disabled = closed || createInitial;
        
        // El botón Guardar se deshabilita si:
        // 1. Caso Cerrado (Regla A)
        // 2. No hay datos cargados Y no se ha iniciado el modo de creación.
        const guardarDisabled = closed || (!found && !editable);

        return { 
            isCaseFound: found,
            isCaseClosed: closed, 
            isCreateModeInitial: createInitial,
            isInputsDisabled: disabled,
            isFullEditable: editable,
            isGuardarDisabled: guardarDisabled,
        };
    }, [expedienteData, noCasoInput, loading]);
    
    // Handler para el botón de crear (Regla C)
    const handleCrearExpediente = useCallback(() => {
        if (!noCasoInput) return;

        // Prepara el estado para el modo editable de creación
        setExpedienteData(prev => ({
            ...initialExpedienteData, 
            nocaso: noCasoInput,
            idexpediente: 'NUEVO', // Marcador para habilitar la edición
        }));
        setError(null);
    }, [noCasoInput]);

    // Placeholder para la función de guardar expediente
    const handleGuardarExpediente = useCallback(() => {
        alert(`Guardando/Actualizando expediente ${expedienteData.idexpediente}... (Función a implementar)`);
    }, [expedienteData]);


    return {
        // Estado y Data
        noCasoInput, setNoCasoInput,
        expedienteData, loading, error,

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
        isFullEditable,      // Usado para todos los inputs
        isGuardarDisabled,
    };
}