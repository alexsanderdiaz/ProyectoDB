// src/hooks/useCasoPageLogic.jsx (NUEVO ARCHIVO)

import { useCallback, useMemo } from 'react';
import { useCaso } from '../context/CasoContext'; // Importar el Contexto
import { createNewCase } from "../api/casoApi"; 

export function useCasoPageLogic() {
    // 1. CONSUMIR ESTADO Y SETTERS DEL CONTEXTO
    const {
        clienteCod,
        clienteExiste,
        nombreApellido,
        clienteDoc,
        casoData,
        isCreatingNewCase,
        
        // Setters y funciones necesarios
        setNombreApellido, 
        setClienteDoc,
        setCasoData, // 👈 Lo necesitamos para manejar los inputs
        handleSearch,
        resetState, // 👈 Lo necesitamos para la limpieza
        
    } = useCaso();


    // 2. HANDLERS DE INPUTS (Ahora están en la lógica de la vista)
    const handleNombreApellidoChange = (name) => {
        setNombreApellido(name); 
        setClienteDoc(''); 
        resetState(); // Llama a la limpieza del Contexto
    };
    
    const handleDocChange = (e) => {
        const doc = e.target.value;
        setClienteDoc(doc);
        if (doc.length > 0) {
            setNombreApellido('');
        }
        resetState(); // Llama a la limpieza del Contexto
    };

    const handleCasoChange = (e) => {
        // Usa el setter del Contexto
        setCasoData({ ...casoData, [e.target.name]: e.target.value });
    };


    // 3. LÓGICA DE VALIDACIÓN (Específica de CasoPage)
    const isCaseInputDisabled = useMemo(() => {
        // Deshabilitado si no hay cliente (null) O no estamos en modo creación O no hay casos para seleccionar
        return clienteExiste === null || (clienteExiste && !isCreatingNewCase && casoData.nocaso);
    }, [clienteExiste, isCreatingNewCase, casoData.nocaso]);


    // LÓGICA DE VALIDACIÓN DEL BOTÓN GUARDAR
    const isSaveButtonDisabled = useMemo(() => {
        if (!isCreatingNewCase) {
            return true;
        }
        
        const { nocaso, fechaInicio, especializacion, valor } = casoData;
        const valorNumerico = parseFloat(valor);
        
        return (
            !nocaso || 
            !fechaInicio || 
            !especializacion || 
            !valor || 
            isNaN(valorNumerico) ||
            valorNumerico <= 0 ||
            clienteExiste === null // Requiere que se haya validado la existencia del cliente antes
        );

    }, [isCreatingNewCase, casoData, clienteExiste]);


    // 4. FUNCIÓN DE GUARDADO (Específica de CasoPage)
    const handleGuardarCaso = useCallback(async () => {
        if (isSaveButtonDisabled) {
            alert("Rellene todos los campos obligatorios antes de guardar.");
            return;
        }

        try {
            const resultado = await createNewCase(clienteCod, casoData);
            
            alert(`Caso ${resultado.nocaso} registrado con éxito.`);

            // Opcional: Recargar el estado del cliente para ver el nuevo caso
            handleSearch(); // Usamos la función core del Contexto
            
        } catch (error) {
            console.error("Error al guardar el caso:", error);
            alert(`Fallo al registrar caso: ${error.message}`);
        }
    }, [isSaveButtonDisabled, clienteCod, casoData, handleSearch]);


    // FUNCIÓN: Handler para el botón Acuerdo de Pago
    const handleAcuerdoPago = useCallback(() => {
        if (window.confirm("¿Desea incluir un acuerdo de pago para este caso?")) {
            console.log("Acuerdo de pago aceptado por el usuario.");
        } else {
            console.log("Acuerdo de pago cancelado por el usuario.");
        }
    }, []);

    // 5. DEVOLVER LA LÓGICA DE LA VISTA
    return {
        // Handlers de la vista
        handleNombreApellidoChange,
        handleDocChange,
        handleCasoChange,
        handleGuardarCaso,
        handleAcuerdoPago,
        
        // Estados derivados de la vista
        isCaseInputDisabled,
        isSaveButtonDisabled,
    };
}