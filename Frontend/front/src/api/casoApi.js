// src/api/casoApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

// Lógica de Búsqueda
export async function fetchClienteConCasoActivo(nombre, apellido) {
    const url = `${API_BASE_URL}gestion-caso/buscar-cliente/?nombre=${nombre}&apellido=${apellido}`;
    
    // Aquí puedes añadir manejo de errores genérico o headers
    const response = await fetch(url);
    if (!response.ok) {
        // Lanza un error para ser capturado en el hook
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

// ... otras funciones (fetchEspecializaciones, etc.)