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
    const [clienteDoc, setClienteDoc] = useState(''); 
    const [clienteCod, setClienteCod] = useState(null); 
    
    // 3. ESTADO DEL CASO
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); // 🛑 Nuevo estado para la lista

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // --- HANDLERS ---
    
    // Este handler está definido, pero no se usa en CasoPage.jsx para cumplir con la petición de mantener el campo Documento deshabilitado.
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
        setListaCasosActivos([]); // Limpiar al teclear
    };

    // 5. LÓGICA DE BÚSQUEDA (handleSearch)
    const handleSearch = useCallback(async () => {
        
        // --- LIMPIEZA INICIAL ---
        setClienteCod(null);
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true); 
        setCasoData(initialCasoData);
        setListaCasosActivos([]); // 🛑 Limpiar la lista de casos
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
            if (data && data.encontrado) { 
                setClienteExiste(true);
                
                // Autocompletar el campo de búsqueda de cliente y el documento
                setClienteDoc(data.cliente.documento || ''); // Asegura que el doc es el correcto
                setNombreApellido(`${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim()); 
                setClienteCod(data.cliente.cod_cliente); 

                // 🛑 Lógica para Casos Activos
                if (data.casos_activos && data.casos_activos.length > 0) {
                    setListaCasosActivos(data.casos_activos);
                    setCasoActivoExiste(true);

                    // Requisito (b): Mostrar el último/más reciente (el primero en la lista ORDENADA por DESC)
                    const ultimoCaso = data.casos_activos[0]; 

                    setCasoData({
                        nocaso: ultimoCaso.numero_caso,
                        fechaInicio: (ultimoCaso.fecha_inicio || '').slice(0,10),
                        fechaFin: ultimoCaso.fecha_fin ? ultimoCaso.fecha_fin.slice(0,10) : '',
                        especializacion: ultimoCaso.especializacion,
                        valor: ultimoCaso.valor
                    });
                    setIsCaseInputDisabled(true); // Requisito (d): No modificable al consultar
                } else {
                    // Cliente existe, pero NO tiene casos activos (o están cerrados)
                    setCasoActivoExiste(false);
                    setListaCasosActivos([]);
                    // Mantener inputs deshabilitados para forzar el uso del botón "Crear"
                }
            } else {
                // Cliente NO encontrado. 
                const crearNuevo = window.confirm(
                    (data && data.mensaje) || "Cliente no encontrado. ¿Desea crear un nuevo cliente?"
                );

                if (crearNuevo) {
                    setClienteExiste(false);
                    setClienteDoc(documentoBusqueda); // Conservar el doc si se buscó por doc
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
        
    }, [nombreApellido, clienteDoc]); 

    // 🛑 Lógica para seleccionar un caso de la lista (Requisito c, d)
    const handleSelectCaso = useCallback((numeroCaso) => {
        const casoSeleccionado = listaCasosActivos.find(c => c.numero_caso === numeroCaso);
        if (casoSeleccionado) {
            setCasoData({
                nocaso: casoSeleccionado.numero_caso,
                fechaInicio: (casoSeleccionado.fecha_inicio || '').slice(0,10),
                fechaFin: casoSeleccionado.fecha_fin ? casoSeleccionado.fecha_fin.slice(0,10) : '',
                especializacion: casoSeleccionado.especializacion, 
                valor: casoSeleccionado.valor
            });
            // Requisito (d): Si se selecciona un caso, solo se podrá consultar (deshabilitar todo).
            setIsCaseInputDisabled(true); 
            setCasoActivoExiste(true); 
        }
    }, [listaCasosActivos]);


    // 🛑 Lógica para crear caso (Requisito e, f)
    const handleCrearCaso = () => {
        // 1. Generar número de caso (Simulación de consecutivo)
        // Normalmente esto se haría en el backend al guardar
        const nuevoNoCaso = `TEMP-${clienteCod}-${Date.now().toString().slice(-4)}`; 

        // 2. Habilitar casillas y prellenar
        setCasoData({
            nocaso: nuevoNoCaso, // Número de caso generado
            fechaInicio: new Date().toISOString().slice(0,10), // Fecha actual (Requisito f)
            fechaFin: '', // Requisito (h): NULL/vacío
            especializacion: '',
            valor: ''
        });
        setIsCaseInputDisabled(false); // Habilitar inputs de caso
        setCasoActivoExiste(false); // No es un caso activo existente, es uno nuevo
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
        listaCasosActivos, // 🛑 Nuevo
        handleSearch,
        handleCrearCaso,
        handleSelectCaso, // 🛑 Nuevo
        isCaseInputDisabled,
        handleCasoChange,
    };
}