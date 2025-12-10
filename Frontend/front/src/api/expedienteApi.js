// src/api/expedienteApi.js

const API_BASE_URL = "http://localhost:8000/api/"; 

// Función de búsqueda existente (debe devolver fechafin_caso)
export async function fetchExpedientePorNoCaso(nocaso) {
    const url = `${API_BASE_URL}gestion-expediente/buscar/?nocaso=${nocaso}`;
    const response = await fetch(url);
    if (response.status === 404) {
        return { encontrado: false, mensaje: `No se encontró un expediente para el NoCaso: ${nocaso}.` };
    }
    if (!response.ok) {
        throw new Error(`Error en la búsqueda del expediente: ${response.status}`);
    }
    return response.json();
}

// 🛑 FUNCIONES SIMULADAS PARA LA REGLA D (DEBEN SER IMPLEMENTADAS EN EL BACKEND) 🛑

// D i: Obtiene el siguiente consecutivo de EXPEDIENTE
export async function fetchSiguienteIdExpediente() {
    console.log("SIMULACIÓN: Llamando a fetchSiguienteIdExpediente...");
    return Math.floor(Math.random() * 100000) + 100; // Simula un ID
}

// D iv: Obtiene la primera etapa para la especialización del caso
export async function fetchPrimeraEtapa(codEspecialidad) {
    console.log(`SIMULACIÓN: Llamando a fetchPrimeraEtapa para ${codEspecialidad}...`);
    // En un caso real, esto consultaría ESPECIA_ETAPA y ETAPAPROCESAL con PASOETAPA=1
    return { 
        noetapa: 1, 
        nometapa: 'Inicio de Proceso / Análisis Inicial' 
    }; 
}

// D v: Obtiene abogados por especialidad
export async function fetchAbogadosPorEspecialidad(codEspecialidad) {
    console.log(`SIMULACIÓN: Llamando a fetchAbogadosPorEspecialidad para ${codEspecialidad}...`);
    // En un caso real, esto consultaría ABOGADO y ABOGA_ESPECIA
    return [ 
        { cedula: '111', nombre_completo: 'Laura Méndez (Especialista)' },
        { cedula: '222', nombre_completo: 'Roberto Castillo (Especialista)' },
    ];
}

// D vi: Obtiene la lista de lugares
export async function fetchLugares() {
    console.log("SIMULACIÓN: Llamando a fetchLugares...");
    return [ 
        { codlugar: 'BOG', nomlugar: 'Bogotá' },
        { codlugar: 'MED', nomlugar: 'Medellín' },
        { codlugar: 'CAL', nomlugar: 'Cali' },
        { codlugar: 'BAR', nomlugar: 'Barranquilla' },
    ];
}