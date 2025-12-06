import React from "react";
import "../styles/Pages.css"; 

export default function Caso() {
  return (
    <div className="page-container">

      {/* Contenedor de columnas */}
      <div className="form-section">

        {/* Columna izquierda */}
        <div className="form-column">

          <label>No Caso</label>
          <input type="text" placeholder="Número de caso" />

          <label>Fecha Inicio</label>
          <input type="date" />

          <label>Fecha Fin</label>
          <input type="date" />

          <label>Especialización</label>
          <input type="text" placeholder="Especialización" />

          <label>Valor</label>
          <input type="number" placeholder="Valor" />

          <button className="btn-primary">Guardar</button>
        </div>

        {/* Columna derecha */}
        <div className="form-column">

          <label>Cliente</label>
          <input type="text" placeholder="Nombre y Apellido" />

          <label>Documento</label>
          <input type="text" placeholder="Documento" />

          <button className="btn-secondary">Crear Cliente</button>
        </div>

      </div>
    </div>
  );
}
