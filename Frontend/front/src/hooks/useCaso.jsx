import React, { useState, useCallback } from "react";
// 🛑 Importar la nueva función API
import { fetchClienteConCasoActivo, fetchSiguienteNoCaso } from "../api/casoApi"; 

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
    
    // 3. ESTADO DEL CASO
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // ... (handleDocChange y handleSearch permanecen iguales) ...
    
    const handleDocChange = (e) => {
        const doc = e.target.value;
        setClienteDoc(doc);
        if (doc.length > 0) {
            setNombreApellido('');
        }
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true);
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
    };

    const handleSearch = useCallback(async () => {
        // ... (Lógica de búsqueda existente) ...
        // [Código de handleSearch omitido por brevedad, debe ser el que ya funciona]
        
        // --- LIMPIEZA INICIAL ---
        setClienteCod(null);
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true); 
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
        // -------------------------

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
        }
    }, [listaCasosActivos]);


    // 🛑 FUNCIÓN handleCrearCaso MODIFICADA para ser asíncrona
    const handleCrearCaso = useCallback(async () => {
        
        if (!clienteCod) {
            alert("Primero debe buscar o crear un cliente válido.");
            return;
        }

        try {
            // 🛑 1. Obtener el siguiente NOCASO desde el backend
            const siguienteNoCaso = await fetchSiguienteNoCaso();

            // 2. Establecer el estado con el nuevo ID y habilitar edición
            setCasoData({
                nocaso: siguienteNoCaso, // 🛑 Usamos el número consecutivo
                fechaInicio: new Date().toISOString().slice(0,10), // Fecha actual
                fechaFin: '', // Requisito (h): NULL/vacío
                especializacion: '',
                valor: ''
            });
            setIsCaseInputDisabled(false); // Habilitar inputs de caso (Requisito f)
            setCasoActivoExiste(false); // No es un caso activo existente, es uno nuevo

        } catch (error) {
            console.error("Error al obtener el número de caso consecutivo:", error);
            alert("No se pudo obtener el número de caso consecutivo. Inténtelo de nuevo.");
        }
    }, [clienteCod]); // Depende de clienteCod

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
        listaCasosActivos,
        handleSearch,
        handleCrearCaso, // Exportar la función asíncrona
        handleSelectCaso,
        isCaseInputDisabled,
        handleCasoChange,
    };
}