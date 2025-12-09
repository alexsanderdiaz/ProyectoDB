// src/hooks/useCaso.jsx

import React, { useState, useCallback, useEffect } from "react";
import { 
    fetchClienteConCasoActivo, 
    fetchSiguienteNoCaso,
    fetchEspecializaciones 
} from "../api/casoApi"; 

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
    
    // 3. ESTADO DEL CASO Y LISTAS
    const [casoData, setCasoData] = useState(initialCasoData);
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 
    const [listaEspecializaciones, setListaEspecializaciones] = useState([]); 

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // 🛑 EFECTO: Cargar las especializaciones
    useEffect(() => {
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

    // 🛑 NUEVO HANDLER: Limpia el documento cuando el usuario escribe en Nombre/Apellido
    const handleNombreApellidoChange = (name) => {
        // La variable 'name' ahora es directamente el string del valor del input
        setNombreApellido(name); 
        
        // CORRECCIÓN: Limpieza de estados
        setClienteDoc(''); 
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true);
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
    };
    
    // Handler para el campo de documento (si estuviera habilitado)
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

    // 5. LÓGICA DE BÚSQUEDA (handleSearch)
    const handleSearch = useCallback(async () => {
        
        // La limpieza inicial ya está en handleNombreApellidoChange y handleDocChange
        
        let nombreBusqueda = undefined;
        let apellidoBusqueda = undefined;
        
        // busquedaDocumento ahora será undefined si el usuario escribió en Nombre/Apellido
        let busquedaDocumento = clienteDoc.trim() || undefined; 
        
        // Si NO hay documento (se limpió), intentamos buscar por nombre/apellido
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
                
                // Actualizar los campos con la data nueva
                setClienteDoc(data.cliente.documento || ''); // Se vuelve a llenar el documento
                setNombreApellido(`${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim()); 
                setClienteCod(data.cliente.cod_cliente); 

                // ... (el resto de la lógica de casos activos) ...
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
                // ... (lógica de cliente no encontrado) ...
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

    // ... (handleSelectCaso, handleCrearCaso, handleCasoChange) ...

    const handleSelectCaso = useCallback((numeroCaso) => {
        // ... (código existente) ...
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

    const handleCrearCaso = useCallback(async () => {
        
        if (!clienteCod) {
            alert("Primero debe buscar o crear un cliente válido.");
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
            setIsCaseInputDisabled(false); 
            setCasoActivoExiste(false); 

        } catch (error) {
            console.error("Error al obtener el número de caso consecutivo:", error);
            alert("No se pudo obtener el número de caso consecutivo. Inténtelo de nuevo.");
        }
    }, [clienteCod]); 

    const handleCasoChange = (e) => {
        setCasoData({ ...casoData, [e.target.name]: e.target.value });
    };


    // 6. DEVOLVER TODOS LOS ESTADOS Y FUNCIONES QUE EL COMPONENTE NECESITA
    return {
        nombreApellido,
        setNombreApellido: handleNombreApellidoChange, // EXPORTAR EL HANDLER CORREGIDO
        clienteDoc,
        handleDocChange,
        clienteExiste,
        casoActivoExiste,
        casoData,
        listaCasosActivos,
        listaEspecializaciones,
        handleSearch,
        handleCrearCaso,
        handleSelectCaso,
        isCaseInputDisabled,
        handleCasoChange,
    };
}