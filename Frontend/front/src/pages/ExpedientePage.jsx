// src/pages/ExpedientePage.jsx

import React from "react";
import "../styles/Pages.css";
import { useExpedienteLogic } from "../hooks/useExpedienteLogic"; 

export default function ExpedientePage() {
    const {
        noCasoInput,
        setNoCasoInput,
        expedienteData,
        loading,
        error,
        handleKeyDown,
        handleExpedienteChange,
        handleGuardarExpediente,
        handleCrearExpediente,
        isCaseFound,
        isCaseClosed,
        isCreateModeInitial,
        isFullEditable,      // Controla si los campos son editables
        isGuardarDisabled,
    } = useExpedienteLogic(); 

    // Determina si se debe mostrar un mensaje de 'No Encontrado'
    const caseNotFound = error && !isCaseFound && !isCreateModeInitial && !loading;

    return (
        <div className="page-container">
            
            {/* ======= MENSAJES DE ESTADO ======= */}
            {loading && <div className="loading">Cargando expediente...</div>}
            {caseNotFound && <div className="error">{error}</div>}
            
            {/* Mensajes de modo (Reglas A, B, C) */}
            {isCaseClosed && <div className="info">Caso Cerrado. Solo Modo Lectura .</div>}
            {isCreateModeInitial && <div className="warning">Caso {expedienteData.nocaso} NO encontrado. Debe registrar un caso con ese ID.</div>}
            {isFullEditable && !isCaseClosed && expedienteData.idexpediente !== 'NUEVO' && <div className="success">Caso Abierto. Se permite Actualizar.</div>}
            {expedienteData.idexpediente === 'NUEVO' && <div className="warning">Modo Creación Activo. Rellene los campos y Guarde.</div>}


            {/* ======= SECCIÓN SUPERIOR (2 COLUMNAS) ======= */}
            <div className="form-section">

                {/* ---- Columna izquierda (Etapas) ---- */}
                <div className="form-column">

                    <label>No. Expediente</label>
                    <div className="row-inline">
                        <input 
                            type="text" 
                            placeholder="Número de expediente" 
                            value={expedienteData.idexpediente || ''}
                            readOnly 
                        />
                        {/* 🛑 BOTÓN CREAR (Habilitado solo en modo 'isCreateModeInitial') 🛑 */}
                        <button 
                            className="btn-secondary"
                            onClick={handleCrearExpediente}
                            // Habilitado si se debe iniciar el modo creación (Regla C)
                            disabled={!isCreateModeInitial || expedienteData.idexpediente === 'NUEVO'}
                        >
                            Crear
                        </button>
                    </div>

                    <label>No. Etapa</label>
                    <input 
                        type="text" 
                        name="noetapa"
                        placeholder="Número de etapa" 
                        value={expedienteData.noetapa || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable} // Aplica Reglas A y C inicial
                    />

                    <label>Fecha etapa</label>
                    <input 
                        type="date" 
                        name="fechaetapa"
                        value={expedienteData.fechaetapa || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    />

                    <label>Nombre Etapa</label>
                    <input 
                        type="text" 
                        name="nometapa"
                        placeholder="Nombre de la etapa" 
                        value={expedienteData.nometapa || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    />

                    <label>Instancia</label>
                    <input 
                        type="text" 
                        name="nominstancia"
                        placeholder="Instancia" 
                        value={expedienteData.nominstancia || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    />

                </div>

                {/* ---- Columna derecha (Datos del caso) ---- */}
                <div className="form-column">

                    <label>No Caso</label>
                    {/* Input de búsqueda: Siempre habilitado si no está cargando */}
                    <input 
                        type="text" 
                        placeholder="Número de caso"
                        value={noCasoInput} 
                        onChange={(e) => setNoCasoInput(e.target.value)}
                        onKeyDown={handleKeyDown} // Búsqueda al presionar Enter
                        disabled={loading}
                    />

                    <label>Abogado</label>
                    <input 
                        type="text" 
                        name="nombre_abogado"
                        placeholder="Abogado responsable" 
                        value={expedienteData.nombre_abogado || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    />

                    <label>Ciudad</label>
                    <input 
                        type="text" 
                        name="ciudad"
                        placeholder="Ciudad" 
                        value={expedienteData.ciudad || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    />

                    <label>Entidad</label>
                    {/* ASUMIMOS que entidad también es editable si isFullEditable es TRUE */}
                    <input type="text" placeholder="Entidad" disabled={!isFullEditable} />

                    <label>Impugnación</label>
                    <input 
                        type="text" 
                        name="nombre_impugnacion"
                        placeholder="Impugnación" 
                        value={expedienteData.nombre_impugnacion || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
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
                        name="suceso"
                        placeholder="Descripción del suceso"
                        value={expedienteData.suceso || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    ></textarea>
                </div>

                {/* Resultado */}
                <div className="three-column">
                    <label>Resultado</label>
                    <textarea 
                        rows="10" 
                        name="resultado"
                        placeholder="Resultado del caso"
                        value={expedienteData.resultado || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    ></textarea>
                </div>

                {/* Documentos */}
                <div className="three-column">
                    <label>Documentos ({expedienteData.documentos.length})</label>

                    {/* Mapea la lista de documentos (solo lectura) */}
                    {expedienteData.documentos.map((doc, index) => (
                        <div key={index} className="row-inline">
                            <input 
                                type="text" 
                                placeholder={doc.tipo_doc_nombre || `Documento ${index + 1}`}
                                value={doc.nombre_doc || ''} 
                                readOnly
                                disabled={!isFullEditable} 
                            />
                            <span className="icon-doc">📄</span>
                        </div>
                    ))}
                    
                    {/* Placeholder si no hay documentos */}
                    {expedienteData.documentos.length === 0 && (
                         <div className="row-inline">
                            <input type="text" placeholder={`Documento 1`} disabled={!isFullEditable} />
                            <span className="icon-doc">📄</span>
                        </div>
                    )}

                    <button className="btn-secondary" disabled={!isFullEditable}>Imprimir 🖨️</button>
                </div>

            </div>

            {/* ======= BOTONES DE NAVEGACIÓN Y GUARDAR ======= */}
            <div className="bottom-controls">

                {/* Los botones de navegación no son funcionales por ahora */}
                <button className="arrow-btn" disabled={true}>⬅️</button>
                <button className="arrow-btn" disabled={true}>➡️</button>

                {/* 🛑 BOTÓN GUARDAR 🛑 */}
                <button 
                    className="btn-primary"
                    onClick={handleGuardarExpediente}
                    // Deshabilitado por Regla A o si no se ha encontrado/creado un expediente.
                    disabled={isGuardarDisabled || loading} 
                >
                    Guardar
                </button>
            </div>

        </div>
    );
}