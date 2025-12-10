// src/pages/ExpedientePage.jsx

import React from "react";
import { useExpedienteLogic } from "../hooks/useExpediente"; 
import "../styles/Pages.css";

export default function ExpedientePage() {

    // 🛑 Usamos el hook
    const {
        nocasoInput,
        handleNocasoInputChange,
        handleClickSearch, // Función de búsqueda (se llama con Enter)
        expedienteData,
        expedienteEncontrado,
        isLoading,
        error,
        handleGuardarExpediente,
        handleCrearExpediente,
    } = useExpedienteLogic();

    // Control para deshabilitar campos de datos si no hay expediente encontrado o estamos cargando
    // Se habilita si expedienteEncontrado es true o si se está en modo creación (idexpediente === 'NUEVO')
    const isDataInputDisabled = !expedienteEncontrado && expedienteData.idexpediente !== 'NUEVO';
    
    // Función para manejar la tecla Enter en el input de No Caso
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleClickSearch(); // Llama a la función de búsqueda del hook
        }
    };
    
    return (
        <div className="page-container">
            
            {/* ======= MENSAJES DE ESTADO ======= */}
            {(error || expedienteEncontrado !== null) && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: error ? '#fdd' : (expedienteEncontrado ? '#dfd' : '#eee'), border: `1px solid ${error ? 'red' : (expedienteEncontrado ? 'green' : '#ccc')}` }}>
                    {isLoading && <p>Cargando expediente...</p>}
                    {error && <p className="error-message">Error: {error}</p>}
                    {expedienteEncontrado === true && <p className="success-message">Expediente {expedienteData.idexpediente} encontrado para el Caso {expedienteData.nocaso}.</p>}
                    {expedienteEncontrado === false && !error && expedienteData.nocaso && <p>No se encontró expediente para el caso {expedienteData.nocaso}. Presione 'Crear' para registrar uno.</p>}
                </div>
            )}

            {/* ======= SECCIÓN SUPERIOR (2 COLUMNAS) ======= */}
            <div className="form-section">

                {/* ---- Columna izquierda (Etapas) ---- */}
                <div className="form-column">

                    <label>No. Expediente</label>
                    <div className="row-inline">
                        <input 
                            type="text" 
                            placeholder="Número de expediente"
                            value={expedienteData.idexpediente}
                            readOnly
                            disabled={isDataInputDisabled}
                        />
                        <button 
                            className="btn-secondary"
                            onClick={handleCrearExpediente}
                            // Habilitar Crear solo si hay un NoCaso ingresado y NO hay un expediente encontrado
                            disabled={!nocasoInput || expedienteEncontrado}
                        >
                            Crear
                        </button>
                    </div>

                    <label>No. Etapa</label>
                    <input 
                        type="text" 
                        placeholder="Número de etapa" 
                        value={expedienteData.noetapa}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                    <label>Fecha etapa</label>
                    <input 
                        type="date" 
                        value={expedienteData.fechaetapa}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                    <label>Nombre Etapa</label>
                    <input 
                        type="text" 
                        placeholder="Nombre de la etapa" 
                        value={expedienteData.nometapa}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                    <label>Instancia</label>
                    <input 
                        type="text" 
                        placeholder="Instancia" 
                        value={expedienteData.nominstancia}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                </div>

                {/* ---- Columna derecha (Datos del caso) ---- */}
                <div className="form-column">

                    <label>No Caso</label>
                    {/* 🛑 AQUÍ SE CONECTA EL INPUT PARA CONSULTA Y DATOS 🛑 */}
                    <input 
                        type="text" 
                        placeholder="Número de caso"
                        value={nocasoInput}
                        onChange={handleNocasoInputChange}
                        onKeyDown={handleKeyDown} // Búsqueda al presionar Enter
                        disabled={isLoading}
                    />

                    <label>Abogado</label>
                    <input 
                        type="text" 
                        placeholder="Abogado responsable" 
                        value={expedienteData.nombre_abogado}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                    <label>Ciudad</label>
                    <input 
                        type="text" 
                        placeholder="Ciudad" 
                        value={expedienteData.ciudad}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                    <label>Entidad</label>
                    <input type="text" placeholder="Entidad" readOnly disabled={isDataInputDisabled} />

                    <label>Impugnación</label>
                    <input 
                        type="text" 
                        placeholder="Impugnación" 
                        value={expedienteData.nombre_impugnacion}
                        readOnly
                        disabled={isDataInputDisabled}
                    />

                </div>
            </div>

            {/* ======= SECCIÓN INFERIOR (3 columnas) ======= */}
            <div className="three-section">

                {/* Suceso */}
                <div className="three-column">
                    <label>Suceso</label>
                    <textarea 
                        rows="10" 
                        placeholder="Descripción del suceso"
                        value={expedienteData.suceso}
                        readOnly
                        disabled={isDataInputDisabled}
                    ></textarea>
                </div>

                {/* Resultado */}
                <div className="three-column">
                    <label>Resultado</label>
                    <textarea 
                        rows="10" 
                        placeholder="Resultado del caso"
                        value={expedienteData.resultado}
                        readOnly
                        disabled={isDataInputDisabled}
                    ></textarea>
                </div>

                {/* Documentos */}
                <div className="three-column">
                    <label>Documentos ({expedienteData.documentos.length})</label>

                    {/* Mapea la lista de documentos obtenida del hook */}
                    {expedienteData.documentos.map((doc, index) => (
                        <div key={index} className="row-inline">
                            <input 
                                type="text" 
                                placeholder={doc.tipo_doc_nombre || `Documento ${index + 1}`}
                                value={doc.nombre_doc} 
                                readOnly
                                disabled={isDataInputDisabled} 
                            />
                            <span className="icon-doc">📄</span>
                        </div>
                    ))}
                    
                    {/* Placeholder para mostrar al menos un campo si no hay documentos o está deshabilitado */}
                    {expedienteData.documentos.length === 0 && (
                         <div className="row-inline">
                            <input type="text" placeholder={`Documento 1`} disabled={isDataInputDisabled} />
                            <span className="icon-doc">📄</span>
                        </div>
                    )}

                    <button className="btn-secondary" disabled={isDataInputDisabled}>Imprimir 🖨️</button>
                </div>

            </div>

            {/* ======= BOTONES DE NAVEGACIÓN Y GUARDAR ======= */}
            <div className="bottom-controls">

                <button className="arrow-btn" disabled={true}>⬅️</button>
                <button className="arrow-btn" disabled={true}>➡️</button>

                <button 
                    className="btn-primary"
                    onClick={handleGuardarExpediente}
                    disabled={isDataInputDisabled}
                >
                    Guardar
                </button>
            </div>

        </div>
    );
}