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
        abogadosList,
        lugaresList,
        isCaseFound,
        isCaseClosed,
        isCreateModeInitial,
        isCreateModeActive, 
        isFullEditable,
        isGuardarDisabled,
    } = useExpedienteLogic(); 

    const caseNotFound = error && !isCaseFound && !isCreateModeInitial && !isCreateModeActive && !loading;

    return (
        <div className="page-container">
            
            {/* ======= MENSAJES DE ESTADO ======= */}
            {loading && <div className="loading">Cargando datos...</div>}
            {caseNotFound && <div className="error">{error}</div>}
            
            {/* Mensajes de modo (Reglas A, B, C, D) */}
            {isCaseClosed && <div className="info">Caso Cerrado. Solo Modo Lectura.</div>}
            {isCreateModeInitial && <div className="warning">Caso {expedienteData.nocaso} NO encontrado. Presione 'Crear'.</div>}
            {isCreateModeActive && <div className="warning">Modo Creación Activo. Complete los campos y Guarde.</div>}
            {isCaseFound && !isCaseClosed && <div className="success">Caso Abierto. Se permite Actualizar.</div>}


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
                            readOnly // i. No se puede modificar
                        />
                        {/* 🛑 BOTÓN CREAR (Aparece solo en modo isCreateModeInitial) 🛑 */}
                        {isCreateModeInitial && (
                            <button 
                                className="btn-secondary"
                                onClick={handleCrearExpediente}
                                disabled={loading}
                            >
                                Crear
                            </button>
                        )}
                    </div>

                    <label>No. Etapa</label>
                    <input 
                        type="text" 
                        name="noetapa"
                        placeholder="Número de etapa" 
                        value={expedienteData.noetapa || ''}
                        readOnly // ii. No se puede modificar
                        disabled={!isFullEditable}
                    />

                    <label>Fecha etapa</label>
                    <input 
                        type="date" 
                        name="fechaetapa"
                        value={expedienteData.fechaetapa || ''}
                        readOnly // iii. No se puede modificar
                        disabled={!isFullEditable}
                    />

                    <label>Nombre Etapa</label>
                    <input 
                        type="text" 
                        name="nometapa"
                        placeholder="Nombre de la etapa" 
                        value={expedienteData.nometapa || ''}
                        readOnly // iv. No se puede modificar
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
                    <input 
                        type="text" 
                        placeholder="Número de caso"
                        value={noCasoInput} 
                        onChange={(e) => setNoCasoInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading || isCreateModeActive} // No editable si se presionó Crear
                    />

                    <label>Abogado</label>
                    {/* 🛑 v. Lista desplegable de Abogados 🛑 */}
                    <select
                        name="nombre_abogado"
                        value={expedienteData.nombre_abogado || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    >
                        <option value="">-- Seleccione un Abogado --</option>
                        {abogadosList.map(abogado => (
                            // La opción value debe ser lo que se guarda en EXPEDIENTE.CEDULA
                            <option key={abogado.cedula} value={abogado.nombre_completo}> 
                                {abogado.nombre_completo}
                            </option>
                        ))}
                    </select>

                    <label>Ciudad</label>
                    {/* 🛑 vi. Lista desplegable de Ciudades 🛑 */}
                    <select
                        name="ciudad"
                        value={expedienteData.ciudad || ''}
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    >
                        <option value="">-- Seleccione una Ciudad --</option>
                        {lugaresList.map(lugar => (
                            // La opción value debe ser lo que se guarda en EXPEDIENTE.CODLUGAR
                            <option key={lugar.codlugar} value={lugar.nomlugar}> 
                                {lugar.nomlugar}
                            </option>
                        ))}
                    </select>
                    
                    <label>Entidad</label>
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
                    {expedienteData.documentos.map((doc, index) => (
                        <div key={index} className="row-inline">
                            <input 
                                type="text" 
                                placeholder={doc.tipo_doc_nombre || `Documento ${index + 1}`}
                                value={doc.nombre_doc || ''} 
                                readOnly
                            />
                            <span className="icon-doc">📄</span>
                        </div>
                    ))}
                    <button className="btn-secondary" disabled={!isFullEditable}>Imprimir 🖨️</button>
                </div>
            </div>

            {/* ======= BOTONES DE NAVEGACIÓN Y GUARDAR ======= */}
            <div className="bottom-controls">
                <button className="arrow-btn" disabled={true}>⬅️</button>
                <button className="arrow-btn" disabled={true}>➡️</button>
                <button 
                    className="btn-primary"
                    onClick={handleGuardarExpediente}
                    disabled={isGuardarDisabled || loading} 
                >
                    Guardar
                </button>
            </div>
        </div>
    );
}