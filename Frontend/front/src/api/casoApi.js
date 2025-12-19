// src/api/casoApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

// Lógica de Búsqueda (ya corregida para manejar parámetros dinámicos)
export async function fetchClienteConCasoActivo(nombre, apellido, documento) {
    
    const params = new URLSearchParams();

    if (nombre) {
        params.append('nombre', nombre);
    }
    if (apellido) {
        params.append('apellido', apellido);
    }
    if (documento) { 
        params.append('documento', documento);
    }

    const url = `${API_BASE_URL}gestion-caso/buscar-cliente/?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status}`);
    }
    return response.json();
}

// Obtener el siguiente número de caso consecutivo
export async function fetchSiguienteNoCaso() {
    // ASUMIMOS que mapeaste esta URL en tu urls.py del backend
    const url = `${API_BASE_URL}gestion-caso/siguiente-nocaso/`; 
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener consecutivo de caso: ${response.status}`);
    }
    const data = await response.json();
    // El backend devuelve: {"siguiente_nocaso": N}
    return data.siguiente_nocaso; 
}

//Lista de especializaciones

export async function fetchEspecializaciones() {
    const url = `${API_BASE_URL}datos-auxiliares/especializaciones/`; 
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener especializaciones: ${response.status}`);
    }
    return response.json(); 
}

export async function fetchFormasPago() {
    // Usamos la nueva ruta mapeada en urls.py
    const url = `${API_BASE_URL}datos-auxiliares/formas-pago/`; 
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener formas de pago: ${response.status}`);
    }
    return response.json(); 
}

// Registrar Acuerdo de Pago
export async function registrarAcuerdoPago(acuerdoData) {
    const url = `${API_BASE_URL}gestion-caso/registrar-pago/`; 

    const payload = { 
        // Convertir a número antes de enviar, usando 0 si es inválido
        valorAcuerdo: parseFloat(acuerdoData.valorAcuerdo) || 0,
        formaPago: acuerdoData.formaPago,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
            error: 'Respuesta sin JSON o error desconocido.' 
        }));
        throw new Error(`Error al registrar acuerdo de pago: ${response.status} - ${errorData.error || errorData.message}`);
    }
    return response.json();
}


export async function createNewCase(clienteId, caseData) {
    const url = `${API_BASE_URL}gestion-caso/crear/`; 

    const payload = { 
        cod_cliente: clienteId,
        nocaso: caseData.nocaso,
        fechaInicio: caseData.fechaInicio,
        // Usamos null si está vacío, el backend debe manejar esto
        fechaFin: caseData.fechaFin || null, 
        especializacion: caseData.especializacion,
        // Asegurar que sea número y manejar valores vacíos/nulos
        valor: parseFloat(caseData.valor) || 0, 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Lógica mejorada para capturar el mensaje de error del backend
        const errorData = await response.json().catch(() => ({ 
            error: 'Respuesta sin JSON o error desconocido.' 
        }));
        // El error 500 del backend debe devolver su propio mensaje de error
        throw new Error(`Error al crear caso: ${response.status} - ${errorData.error || errorData.message}`);
    }
    return response.json();
}

//Nueva funcion para traer datos del back 
