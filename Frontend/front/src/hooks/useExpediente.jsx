// src/hooks/useExpediente.jsx

import React, { useState, useCallback } from "react"; 
import { fetchExpedientePorNoCaso } from "../api/expedienteApi";

// Estado inicial del formulario de expediente
const initialExpedienteData = {
    nocaso: '',
    idexpediente: '',
    noetapa: '',
    fechaetapa: '', 
    nometapa: '',
    nominstancia: '',
    nombre_abogado: '',
    ciudad: '',
    nombre_impugnacion: '',
    suceso: '',
    resultado: '',
    documentos: [], 
};

export function useExpedienteLogic() {
    
    // ESTADO DE LA INTERFAZ
    const [nocasoInput, setNocasoInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expedienteEncontrado, setExpedienteEncontrado] = useState(null);
    
    // ESTADO DE LOS DATOS
    const [expedienteData, setExpedienteData] = useState(initialExpedienteData);

    const handleNocasoInputChange = useCallback((e) => {
        setNocasoInput(e.target.value);
    }, []);

    // FUNCIÓN: Búsqueda del Expediente
    const handleSearchExpediente = useCallback(async (nocaso) => {
        if (!nocaso) {
            setError("Por favor, ingrese un número de caso.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setExpedienteEncontrado(null);
        setExpedienteData(initialExpedienteData);

        try {
            const data = await fetchExpedientePorNoCaso(nocaso);
            
            setExpedienteData({
                nocaso: data.nocaso || nocaso,
                idexpediente: data.idexpediente || '',
                noetapa: data.noetapa || '',
                // Formato la fecha para que se muestre correctamente en el input type="date"
                fechaetapa: data.fechaetapa ? new Date(data.fechaetapa).toISOString().split('T')[0] : '', 
                nometapa: data.nometapa || '',
                nominstancia: data.nominstancia || '',
                nombre_abogado: data.nombre_abogado || '',
                ciudad: data.ciudad || '',
                nombre_impugnacion: data.nombre_impugnacion || '',
                suceso: data.suceso || '',
                resultado: data.resultado || '',
                documentos: data.documentos || [],
            });
            setExpedienteEncontrado(true);

        } catch (err) {
            // Manejar errores de no encontrado (404) y otros
            setError(err.message);
            setExpedienteEncontrado(false);
            setExpedienteData(prevState => ({...prevState, nocaso: nocaso})); 
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Handler para el botón de búsqueda
    const handleClickSearch = useCallback(() => {
        handleSearchExpediente(nocasoInput);
    }, [handleSearchExpediente, nocasoInput]);


    // Handler para el botón de crear (limpia y prepara para un nuevo registro)
    const handleCrearExpediente = useCallback(() => {
        // Establecer solo el nocaso ingresado y limpiar el resto para el modo creación
        setExpedienteData(prevState => ({
            ...initialExpedienteData, 
            nocaso: nocasoInput,
            // Asumimos que aquí se podría obtener el siguiente IDEXPEDIENTE, si lo hubiera
            idexpediente: 'NUEVO', 
            // Esto pondría el resto de campos en modo editable
        }));
        setExpedienteEncontrado(false); // Indica que no estamos viendo un expediente existente
        setError(null);
        alert("Modo de creación de nuevo expediente activado. Rellene los campos y Guarde.");
    }, [nocasoInput]);
    
    // Placeholder para la función de guardar expediente
    const handleGuardarExpediente = useCallback(() => {
        // Lógica de Guardar/Actualizar (POST/PUT) aquí
        alert(`Guardando expediente ${expedienteData.idexpediente}... (Función a implementar)`);
    }, [expedienteData]);

    return {
        nocasoInput,
        handleNocasoInputChange,
        handleClickSearch,
        expedienteData,
        expedienteEncontrado,
        isLoading,
        error,
        handleGuardarExpediente,
        handleCrearExpediente,
    };
}