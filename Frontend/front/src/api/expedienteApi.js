// src/api/expedienteApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

/**
 * Busca la información completa de un expediente por número de caso (NoCaso).
 * @param {string} nocaso - El número de caso.
 * @returns {Promise<Object>} Datos del expediente.
 */
export async function fetchExpedientePorNoCaso(nocaso) {
    
    if (!nocaso) {
        throw new Error("El número de caso es obligatorio para buscar el expediente.");
    }
    
    const params = new URLSearchParams();
    params.append('nocaso', nocaso);

    const url = `${API_BASE_URL}gestion-expediente/buscar/?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // Capturar mensaje de error del backend si existe (e.g., 404 Not Found)
        const errorData = await response.json().catch(() => ({ 
            mensaje: 'Error desconocido al buscar expediente.' 
        }));
        throw new Error(errorData.mensaje || `Error en la búsqueda de expediente: ${response.status}`);
    }
    
    return response.json();
}