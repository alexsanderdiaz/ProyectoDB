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
    const [listaCasosActivos, setListaCasosActivos] = useState([]); 

    // 4. ESTADO DE LA INTERFAZ
    const [clienteExiste, setClienteExiste] = useState(null);
    const [casoActivoExiste, setCasoActivoExiste] = useState(false);
    const [isCaseInputDisabled, setIsCaseInputDisabled] = useState(true);

    // --- HANDLERS ---
    
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
        
        // --- LIMPIEZA INICIAL ---
        setClienteCod(null);
        setClienteExiste(null);
        setCasoActivoExiste(false);
        setIsCaseInputDisabled(true); 
        setCasoData(initialCasoData);
        setListaCasosActivos([]);
        // -------------------------

        // Usar undefined como valor por defecto.
        let nombreBusqueda = undefined;
        let apellidoBusqueda = undefined;
        // Si clienteDoc.trim() es una cadena vacía, busquedaDocumento será undefined.
        let busquedaDocumento = clienteDoc.trim() || undefined; 
        
        // Si NO hay documento, intentamos buscar por nombre/apellido
        if (!busquedaDocumento) { 
            const tokens = nombreApellido.trim().split(/\s+/).filter(Boolean);

            // Requisito: Se necesitan al menos dos palabras (nombre y apellido)
            if (tokens.length < 2) {
                alert("Por favor, ingrese el Documento O al menos Nombre y Apellido completos (dos palabras).");
                return; // Detener la ejecución si no hay criterios válidos
            }

            nombreBusqueda = tokens[0];
            // Tomamos el resto de tokens como apellido (más flexible)
            apellidoBusqueda = tokens.slice(1).join(' '); 
        }

        try {
            // Llamar a la API. Los parámetros undefined deben ser omitidos en la URL.
            const data = await fetchClienteConCasoActivo(nombreBusqueda, apellidoBusqueda, busquedaDocumento); 

            // Lógica para actualizar los estados
            if (data && data.encontrado) { 
                setClienteExiste(true);
                
                setClienteDoc(data.cliente.documento || ''); 
                setNombreApellido(`${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim()); 
                setClienteCod(data.cliente.cod_cliente); 

                if (data.casos_activos && data.casos_activos.length > 0) {
                    setListaCasosActivos(data.casos_activos);
                    setCasoActivoExiste(true);

                    //  Mostrar el último/más reciente
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
                    // Cliente encontrado pero sin casos activos
                    setCasoActivoExiste(false);
                    setListaCasosActivos([]);
                }
            } else {
                // Cliente NO encontrado (aunque la API respondió 200 con {encontrado: false} o 404)
                const crearNuevo = window.confirm(
                    (data && data.mensaje) || "Cliente no encontrado. ¿Desea crear un nuevo cliente?"
                );

                if (crearNuevo) {
                    setClienteExiste(false);
                    setClienteDoc(busquedaDocumento || ''); 
                } else {
                    // Limpiar la interfaz de búsqueda
                    setNombreApellido('');
                    setClienteDoc(''); 
                    setClienteExiste(null);
                }
            }
        } catch (error) {
            // Lógica para manejar errores de red o 404 (Cliente no encontrado)
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

    // ... (handleSelectCaso, handleCrearCaso y handleCasoChange permanecen iguales) ...
    const handleSelectCaso = useCallback((numeroCaso) => {
        // Aseguramos que el numeroCaso (string) se compare correctamente.
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

    const handleCrearCaso = () => {
        const nuevoNoCaso = `TEMP-${clienteCod}-${Date.now().toString().slice(-4)}`; 

        setCasoData({
            nocaso: nuevoNoCaso,
            fechaInicio: new Date().toISOString().slice(0,10),
            fechaFin: '',
            especializacion: '',
            valor: ''
        });
        setIsCaseInputDisabled(false);
        setCasoActivoExiste(false);
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
        listaCasosActivos,
        handleSearch,
        handleCrearCaso,
        handleSelectCaso,
        isCaseInputDisabled,
        handleCasoChange,
    };
}