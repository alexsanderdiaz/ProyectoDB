// src/pages/ExpedientePage.jsx

import React from "react";
import "../styles/Pages.css"; // Archivo de estilos
import { useExpedienteLogic } from "../hooks/useExpedienteLogic"; // El hook que contiene toda la lógica

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
        handleCrearExpediente, // Handler para el botón Crear
        abogadosList, // Lista de abogados para el select
        lugaresList, // Lista de lugares para el select
        isCaseFound,
        isCaseClosed,
        isCreateModeInitial, // Regla C (Botón Crear visible)
        isCreateModeActive,  // Regla D (Modo Creación Activo)
        isFullEditable,      // Regla B o D (Habilita la edición)
        isGuardarDisabled,
    } = useExpedienteLogic(); 

    const caseNotFound = error && !isCaseFound && !isCreateModeInitial && !isCreateModeActive && !loading;
    
    // Determinar si los campos de búsqueda están bloqueados
    const isSearchDisabled = loading || isCreateModeActive;

    return (
        <div className="page-container">
            
            {/* ======= MENSAJES DE ESTADO ======= */}
            {loading && <div className="loading">Cargando datos...</div>}
            {caseNotFound && <div className="error">{error}</div>}
            
            {/* Mensajes de modo (Labels de estado: A, B, C, D) */}
            {isCaseClosed && <div className="info">Caso Cerrado. Solo Modo Lectura.</div>}
            {isCreateModeInitial && <div className="warning">Caso **{expedienteData.nocaso}** NO encontrado. Presione 'Crear' para registrar un nuevo expediente.</div>}
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
                            readOnly // D.i. No se puede modificar (Solo lectura)
                        />
                        {/* BOTÓN CREAR (Aparece solo en modo isCreateModeInitial - Regla C) */}
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
                        readOnly // D.ii. No se puede modificar (Solo lectura)
                        disabled={!isFullEditable}
                    />

                    <label>Fecha etapa</label>
                    <input 
                        type="date" 
                        name="fechaetapa"
                        value={expedienteData.fechaetapa || ''}
                        readOnly // D.iii. No se puede modificar (Solo lectura)
                        disabled={!isFullEditable}
                    />

                    <label>Nombre Etapa</label>
                    <input 
                        type="text" 
                        name="nometapa"
                        placeholder="Nombre de la etapa" 
                        value={expedienteData.nometapa || ''}
                        readOnly // D.iv. No se puede modificar (Solo lectura)
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
                        disabled={isSearchDisabled} // Deshabilitado si estamos cargando o en modo 'Creación Activa'
                    />

                    <label>Abogado</label>
                    {/* D.v. Lista desplegable de Abogados */}
                    <select
                        name="cedula_abogado" // CLAVE: Usa la Cédula para el cambio
                        value={expedienteData.cedula_abogado || ''} // CLAVE: El valor es la CEDULA
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    >
                        <option value="">-- Seleccione un Abogado --</option>
                        {abogadosList.map(abogado => (
                            <option key={abogado.cedula} value={abogado.cedula}>
                                {abogado.nombre_completo}
                            </option>
                        ))}
                    </select>

                    <label>Ciudad</label>
                    {/* D.vi. Lista desplegable de Ciudades */}
                    <select
                        name="codlugar" // CLAVE: Usa el CodLugar para el cambio
                        value={expedienteData.codlugar || ''} // CLAVE: El valor es el CODLUGAR
                        onChange={handleExpedienteChange}
                        disabled={!isFullEditable}
                    >
                        <option value="">-- Seleccione una Ciudad --</option>
                        {lugaresList.map(lugar => (
                            <option key={lugar.codlugar} value={lugar.codlugar}>
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