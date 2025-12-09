// src/api/casoApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

// Lógica de Búsqueda
// 🛑 CORRECCIÓN: Aceptar los tres parámetros y construir la URL dinámicamente
export async function fetchClienteConCasoActivo(nombre, apellido, documento) {
    
    const params = new URLSearchParams();

    // 1. Agregar solo los parámetros que tienen valor (no null, no undefined, no cadena vacía)
    if (nombre) {
        params.append('nombre', nombre);
    }
    if (apellido) {
        params.append('apellido', apellido);
    }
    // Usamos el documento si existe, ya que solo uno de los dos caminos se usa en el hook.
    if (documento) { 
        params.append('documento', documento);
    }

    // 2. Construir la URL con los parámetros generados
    const url = `${API_BASE_URL}gestion-caso/buscar-cliente/?${params.toString()}`;
    
    // Si no hay parámetros (ej: se buscaron 2 palabras en nombre y apellido que resultaron ser undefined), 
    // podrías añadir una validación aquí, aunque el hook ya lo maneja.

    const response = await fetch(url);
    if (!response.ok) {
        // Lanza un error con el estado para ser capturado en el hook (404)
        throw new Error(`Error en la búsqueda: ${response.status}`);
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