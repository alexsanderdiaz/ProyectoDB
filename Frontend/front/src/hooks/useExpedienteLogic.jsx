// src/hooks/useExpedienteLogic.jsx

import { useState, useCallback, useMemo } from 'react';
import { 
    fetchExpedientePorNoCaso,
    fetchSiguienteIdExpediente,
    fetchAbogadosPorEspecialidad,
    fetchLugares,
    fetchPrimeraEtapa,
    createNewExpediente,
    updateExistingExpediente 
} from '../api/expedienteApi'; 

// Estado inicial actualizado
const initialExpedienteData = {
    idexpediente: '', 
    nocaso: '',
    noetapa: '',
    fechaetapa: '',
    cedula_abogado: '', 
    nombre_abogado: '', 
    codlugar: '',     
    ciudad: '',       
    nometapa: '',
    nominstancia: '',
    nombre_impugnacion: '',
    suceso: '',
    resultado: '',
    documentos: [],
    fechafin_caso: null, 
    codespecializacion: null, 
    isNewCase: false, 
};

export function useExpedienteLogic() {
    // ESTADOS (STATES)
    const [noCasoInput, setNoCasoInput] = useState('');
    const [expedienteData, setExpedienteData] = useState(initialExpedienteData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [abogadosList, setAbogadosList] = useState([]);
    const [lugaresList, setLugaresList] = useState([]);

    
    // LÓGICA DE REGLAS
    const { 
        isCaseFound, 
        isCaseClosed, 
        isCreateModeInitial, 
        isCreateModeActive, 
        isFullEditable,      
        isGuardarDisabled 
    } = useMemo(() => {
        const found = !!expedienteData.idexpediente && !expedienteData.isNewCase;
        const closed = found && !!expedienteData.fechafin_caso; 
        
        // isCreateModeInitial: Caso no encontrado, hay NoCaso, no está cargando, Y se tiene la codespecializacion
        const createInitial = !found && !!noCasoInput && expedienteData.nocaso === noCasoInput && !loading && !!expedienteData.codespecializacion; 
        
        const createActive = expedienteData.isNewCase; 
        const editable = (found && !closed) || createActive; 
        const guardarDisabled = closed || !editable; 

        return { 
            isCaseFound: found,
            isCaseClosed: closed, 
            isCreateModeInitial: createInitial,
            isCreateModeActive: createActive,
            isInputsDisabled: closed || createInitial,
            isFullEditable: editable,
            isGuardarDisabled: guardarDisabled,
        };
    }, [expedienteData, noCasoInput, loading]);


    // LÓGICA DE BÚSQUEDA (Depende de Estados, pero no de la salida del useMemo)
    const handleSearch = useCallback(async (nocaso) => {
        if (!nocaso) {
            setError("Por favor, ingrese un número de caso.");
            setExpedienteData(initialExpedienteData);
            return;
        }

        setLoading(true);
        setError(null);
        setExpedienteData({...initialExpedienteData, nocaso: nocaso}); 

        try {
            const data = await fetchExpedientePorNoCaso(nocaso);

            if (data.encontrado) {
                // Caso Existente
                if (!data.fechafin_caso) {
                    setAbogadosList(await fetchAbogadosPorEspecialidad(data.codespecializacion));
                    setLugaresList(await fetchLugares());
                }

                setExpedienteData({ 
                    ...data,
                    fechaetapa: data.fechaetapa ? new Date(data.fechaetapa).toISOString().split('T')[0] : '', 
                    documentos: data.documentos || [], 
                    isNewCase: false,
                });
                
            } else {
                // Caso No encontrado -> Modo Creación
                setError(data.mensaje);
                setExpedienteData(prev => ({
                    ...initialExpedienteData,
                    nocaso: nocaso, 
                    codespecializacion: data.codespecializacion, 
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

    // FUNCIÓN CREAR EXPEDIENTE 
    const handleCrearExpediente = useCallback(async () => {
        if (!noCasoInput || !expedienteData.codespecializacion) return;

        setLoading(true);
        setError(null);
        
        const codEspecialidad = expedienteData.codespecializacion;

        try {
            const nextId = await fetchSiguienteIdExpediente(); 
            const today = new Date().toISOString().split('T')[0];
            const primeraEtapa = await fetchPrimeraEtapa(codEspecialidad);
            
            const abogados = await fetchAbogadosPorEspecialidad(codEspecialidad);
            setAbogadosList(abogados);

            const lugares = await fetchLugares();
            setLugaresList(lugares);

            setExpedienteData(prev => ({
                ...initialExpedienteData, 
                nocaso: noCasoInput,
                idexpediente: nextId.toString(), 
                noetapa: primeraEtapa.noetapa, 
                fechaetapa: today, 
                nometapa: primeraEtapa.nometapa, 
                codespecializacion: codEspecialidad,
                
                cedula_abogado: abogados.length > 0 ? abogados[0].cedula : '', 
                nombre_abogado: abogados.length > 0 ? abogados[0].nombre_completo : '', 
                codlugar: lugares.length > 0 ? lugares[0].codlugar : '', 
                ciudad: lugares.length > 0 ? lugares[0].nomlugar : '', 
                
                isNewCase: true, 
            }));
            
        } catch (err) {
            console.error("Error al iniciar la creación:", err);
            setError('Error al obtener datos iniciales para crear el expediente.');
            setExpedienteData(initialExpedienteData);
        } finally {
            setLoading(false);
        }
    }, [noCasoInput, expedienteData.codespecializacion]);


    // HANDLER DE CAMBIOS
    const handleExpedienteChange = useCallback((e) => {
        const { name, value } = e.target;
        
        setExpedienteData(prev => {
            if (name === 'cedula_abogado') {
                const selectedAbogado = abogadosList.find(a => a.cedula === value);
                return { 
                    ...prev, 
                    cedula_abogado: value, 
                    nombre_abogado: selectedAbogado ? selectedAbogado.nombre_completo : prev.nombre_abogado
                };
            }
            
            if (name === 'codlugar') {
                const selectedLugar = lugaresList.find(l => l.codlugar === value);
                return { 
                    ...prev, 
                    codlugar: value, 
                    ciudad: selectedLugar ? selectedLugar.nomlugar : prev.ciudad 
                };
            }

            return { ...prev, [name]: value };
        });
    }, [abogadosList, lugaresList]);


    // FUNCIÓN GUARDAR 
    const handleGuardarExpediente = useCallback(async () => {
        if (isGuardarDisabled) return;

        setLoading(true);
        setError(null);

        const payload = {
            idexpediente: expedienteData.idexpediente,
            nocaso: expedienteData.nocaso,
            noetapa: expedienteData.noetapa,
            fechaetapa: expedienteData.fechaetapa,
            cedula_abogado: expedienteData.cedula_abogado, 
            codlugar: expedienteData.codlugar,             
            codespecializacion: expedienteData.codespecializacion, 
            suceso: expedienteData.suceso,
            resultado: expedienteData.resultado,
            nominstancia: expedienteData.nominstancia,
            nombre_impugnacion: expedienteData.nombre_impugnacion,
        };
        
        try {
            if (expedienteData.isNewCase) {
                // MODO CREAR
                await createNewExpediente(payload);
                alert(`Expediente ${payload.idexpediente} creado con éxito.`);
            } else {
                // MODO ACTUALIZAR
                await updateExistingExpediente(payload); 
                alert(`Expediente ${payload.idexpediente} actualizado con éxito.`);
            }

            // Recargar el estado del expediente después de una operación exitosa
            setNoCasoInput(expedienteData.nocaso);
            await handleSearch(expedienteData.nocaso); 

        } catch (err) {
            console.error("Error al guardar expediente:", err);
            setError(err.message || 'Fallo al guardar el expediente.');
        } finally {
            setLoading(false);
        }
    }, [isGuardarDisabled, expedienteData, handleSearch]);


    // Handlers genéricos
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch(noCasoInput);
        }
    };
    

    // RETURN
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