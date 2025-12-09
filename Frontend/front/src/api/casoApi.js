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


// Lógica de Creación (Próximo paso)
export async function createNewCase(clienteId, caseData) {
    const url = `${API_BASE_URL}gestion-caso/crear/`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...caseData, cod_cliente: clienteId }),
    });

    if (!response.ok) {
        throw new Error(`Error al crear caso: ${response.status}`);
    }
    return response.json();
}

