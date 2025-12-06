import React from "react";
import "../styles/Pages.css";

export default function Expediente() {
  return (
    <div className="page-container">

      {/* ======= SECCIÓN SUPERIOR (2 COLUMNAS) ======= */}
      <div className="form-section">

        {/* ---- Columna izquierda (Etapas) ---- */}
        <div className="form-column">

          <label>No. Expediente</label>
          <div className="row-inline">
            <input type="text" placeholder="Número de expediente" />
            <button className="btn-secondary">Crear</button>
          </div>

          <label>No. Etapa</label>
          <input type="text" placeholder="Número de etapa" />

          <label>Fecha etapa</label>
          <input type="date" />

          <label>Nombre Etapa</label>
          <input type="text" placeholder="Nombre de la etapa" />

          <label>Instancia</label>
          <input type="text" placeholder="Instancia" />

        </div>

        {/* ---- Columna derecha (Datos del caso) ---- */}
        <div className="form-column">

          <label>No Caso</label>
          <input type="text" placeholder="Número de caso" />

          <label>Abogado</label>
          <input type="text" placeholder="Abogado responsable" />

          <label>Ciudad</label>
          <input type="text" placeholder="Ciudad" />

          <label>Entidad</label>
          <input type="text" placeholder="Entidad" />

          <label>Impugnación</label>
          <input type="text" placeholder="Impugnación" />

        </div>
      </div>

      {/* ======= SECCIÓN INFERIOR (3 columnas) ======= */}
      <div className="three-section">

        {/* Suceso */}
        <div className="three-column">
          <label>Suceso</label>
          <textarea rows="10" placeholder="Descripción del suceso"></textarea>
        </div>

        {/* Resultado */}
        <div className="three-column">
          <label>Resultado</label>
          <textarea rows="10" placeholder="Resultado del caso"></textarea>
        </div>

        {/* Documentos */}
        <div className="three-column">
          <label>Documentos</label>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="row-inline">
              <input type="text" placeholder={`Documento ${i}`} />
              <span className="icon-doc">📄</span>
            </div>
          ))}

          <button className="btn-secondary">Imprimir 🖨️</button>
        </div>

      </div>

      {/* ======= BOTONES DE NAVEGACIÓN Y GUARDAR ======= */}
      <div className="bottom-controls">

        <button className="arrow-btn">⬅️</button>
        <button className="arrow-btn">➡️</button>

        <button className="btn-primary">Guardar</button>
      </div>

    </div>
  );
}
