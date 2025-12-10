// src/api/expedienteApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

// 1. BÚSQUEDA (Reglas A, B, C)
export async function fetchExpedientePorNoCaso(nocaso) {
    const url = `${API_BASE_URL}gestion-expediente/buscar/?nocaso=${nocaso}`;
    const response = await fetch(url);
    
    // El backend devuelve 404 si no encuentra el EXPEDIENTE (Regla C)
    if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        // El backend devuelve CODESPECIALIZACION si el CASO existe.
        return { 
            encontrado: false, 
            mensaje: errorData.mensaje,
            codespecializacion: errorData.codespecializacion || null
        };
    }
    if (!response.ok) {
        throw new Error(`Error ${response.status} en la búsqueda del expediente.`);
    }
    return response.json();
}

// 2. DATOS INICIALES (Regla D)

export async function fetchSiguienteIdExpediente() {
    const url = `${API_BASE_URL}gestion-expediente/datos-creacion/siguiente-id/`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener consecutivo de expediente: ${response.status}`);
    }
    return (await response.json()).idexpediente;
}

export async function fetchPrimeraEtapa(codEspecialidad) {
    const url = `${API_BASE_URL}gestion-expediente/datos-creacion/primera-etapa/?codespecializacion=${codEspecialidad}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener la primera etapa: ${response.status}`);
    }
    return response.json();
}

export async function fetchAbogadosPorEspecialidad(codEspecialidad) {
    const url = `${API_BASE_URL}gestion-expediente/datos-creacion/abogados/?codespecializacion=${codEspecialidad}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener abogados: ${response.status}`);
    }
    return response.json();
}

export async function fetchLugares() {
    const url = `${API_BASE_URL}gestion-expediente/datos-creacion/lugares/`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al obtener lugares: ${response.status}`);
    }
    return response.json();
}

// 3. CREAR/ACTUALIZAR EXPEDIENTE (Reglas D y B)
export async function createNewExpediente(data) {
    const url = `${API_BASE_URL}gestion-expediente/manipular/`;
    const response = await fetch(url, {
        method: 'POST', // Usamos POST para CREAR (Regla D)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido.' }));
        throw new Error(errorData.error || `Error ${response.status} al crear expediente.`);
    }
    return response.json();
}

export async function updateExistingExpediente(data) {
    const url = `${API_BASE_URL}gestion-expediente/manipular/`;
    const response = await fetch(url, {
        method: 'PUT', // Usamos PUT para ACTUALIZAR (Regla B)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido.' }));
        throw new Error(errorData.error || `Error ${response.status} al actualizar expediente.`);
    }
    return response.json();
}