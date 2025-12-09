import React, { useState, useCallback } from "react";
// ASUMIMOS que fetchClienteConCasoActivo se ha actualizado para aceptar (nombre, apellido, documento)
import { fetchClienteConCasoActivo } from "../api/casoApi"; 

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
    const [clienteDoc, setClienteDoc] = useState(''); // 🛑 Ahora editable para búsqueda
    const [clienteCod, setClienteCod] = useState(null); 
    
    // 3. ESTADO DEL CASO
    const [casoData, setCasoData] = useState(initialCasoData);

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // --- HANDLERS ---
    
    // Handler para el campo de documento editable. Limpia campos irrelevantes al teclear.
    const handleDocChange = (e) => {
        const doc = e.target.value;
        setClienteDoc(doc);
        // Limpiar nombre/apellido al empezar a escribir en documento (para forzar la búsqueda por doc)
        if (doc.length > 0) {
            setNombreApellido('');
        }
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true);
        setCasoData(initialCasoData);
    };

    // 5. LÓGICA DE BÚSQUEDA (handleSearch)
    const handleSearch = useCallback(async () => {
        
        // --- LIMPIEZA INICIAL ---
        setClienteCod(null);
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true); 
        setCasoData(initialCasoData);
        // -------------------------

        const documentoBusqueda = clienteDoc.trim();
        let nombreBusqueda = null;
        let apellidoBusqueda = null;
        
        // 1. Determinar criterios de búsqueda
        if (!documentoBusqueda) {
            // Si el documento está vacío, buscar por nombre/apellido
            const tokens = nombreApellido.trim().split(/\s+/).filter(Boolean);

            if (tokens.length < 2) {
                alert("Por favor, ingrese el Documento O el Nombre y Apellido completos.");
                return;
            }

            nombreBusqueda = tokens[0];
            apellidoBusqueda = tokens[1] || null;
        }

        try {
            // Llama a la API con los tres parámetros. El backend decidirá la prioridad.
            const data = await fetchClienteConCasoActivo(nombreBusqueda, apellidoBusqueda, documentoBusqueda); 

            // Lógica para actualizar los estados
            if (data && data.encontrado) { // Asegurarse de que data no es null y que se encontró
                setClienteExiste(true);
                
                // Autocompletar el campo de búsqueda de cliente y el documento
                setClienteDoc(data.cliente.documento || ''); // Asegura que el doc es el correcto
                setNombreApellido(`${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim()); // Rellena el nombre completo
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
                // Cliente NO encontrado. 
                const crearNuevo = window.confirm(
                    (data && data.mensaje) || "Cliente no encontrado. ¿Desea crear un nuevo cliente?"
                );

                if (crearNuevo) {
                    setClienteExiste(false);
                } else {
                    // Limpiar la interfaz de búsqueda
                    setNombreApellido('');
                    setClienteDoc(''); 
                    setClienteExiste(null);
                }
            }
        } catch (error) {
            console.error("Error al buscar cliente:", error);
            alert(error.message || "Error de conexión o en la API.");
        }
        
    }, [nombreApellido, clienteDoc]); // Añadir clienteDoc a las dependencias

    // Lógica para crear caso (placeholder)
    const handleCrearCaso = () => {
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
        handleDocChange,
        clienteExiste,
        casoActivoExiste,
        casoData,
        handleSearch,
        handleCrearCaso,
        isCaseInputDisabled,
        handleCasoChange,
    };
}