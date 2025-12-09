import React, { useState, useCallback } from "react";
import { fetchClienteConCasoActivo } from "../api/casoApi"; 

// *************************************************************
// 1. DEFINICIÓN DEL HOOK y EXPORTACIÓN NOMBRADA
// *************************************************************
export function useCasoLogic() {
    // 2. ESTADO DEL CLIENTE
    const [nombreApellido, setNombreApellido] = useState(''); 
    const [clienteDoc, setClienteDoc] = useState('');
    const [clienteCod, setClienteCod] = useState(null); 
    
    // 3. ESTADO DEL CASO
    const [casoData, setCasoData] = useState({
        nocaso: '',
        fechaInicio: '',
        fechaFin: '',
        especializacion: '',
        valor: ''
    });

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // 5. LÓGICA DE BÚSQUEDA (handleSearch)
    const handleSearch = useCallback(async () => {
        // Obtener la dependencia (nombreApellido) que está definida en el estado
        const [nombre, apellido] = nombreApellido.trim().split(/\s+/); 
        
        if (!nombre || !apellido) {
            alert("Por favor, ingresa el Nombre y el Apellido.");
            return;
        }

        try {
            // Llama a la función de la API
            const data = await fetchClienteConCasoActivo(nombre, apellido); 

            // Lógica para actualizar los estados (clienteExiste, casoData, etc.)
            if (data.encontrado) {
                 setClienteExiste(true);
                 setClienteDoc(data.cliente.documento);
                 setClienteCod(data.cliente.cod_cliente); 

                 if (data.caso_activo) {
                     setCasoActivoExiste(true);
                     setCasoData({
                         nocaso: data.caso_activo.numero_caso,

                         fechaInicio: (data.caso_activo.fecha_inicio || '').slice(0,10),
                         fechaFin: (data.caso_activo.fecha_fin || '').slice(0,10),

                         especializacion: data.caso_activo.especializacion,
                         valor: data.caso_activo.valor
                     });
                     setIsCaseInputDisabled(true); 
                 } else {
                     setCasoActivoExiste(false);
                 }
             } else {
                 setClienteExiste(false);
                 alert(data.mensaje); 
             }
        } catch (error) {
            console.error("Error al buscar cliente:", error);
            alert(error.message || "Error de conexión o en la API.");
        }
    }, [nombreApellido]); // Las dependencias del useCallback deben estar aquí

    // Lógica para crear caso (placeholder)
    const handleCrearCaso = () => {
         // ... (implementación pendiente) ...
         setIsCaseInputDisabled(false);
    };

    const handleCasoChange = (e) => {
        setCasoData({ ...casoData, [e.target.name]: e.target.value });
    };

    // 6. DEVOLVER TODOS LOS ESTADOS Y FUNCIONES QUE EL COMPONENTE NECESITA
    return {
        nombreApellido,
        setNombreApellido,
        clienteDoc,
        clienteExiste,
        casoActivoExiste,
        casoData,
        handleSearch,
        handleCrearCaso,
        isCaseInputDisabled,
        handleCasoChange,
    };
}