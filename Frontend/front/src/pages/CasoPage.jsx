// src/pages/CasoPage.jsx

import { useCaso } from "../context/CasoContext"; // Usar la ruta correcta si 'context/' está al mismo nivel que 'pages/'
import { useCasoPageLogic } from "../hooks/useCasoPageLogic"; // 🛑 NUEVA IMPORTACIÓN
import "../styles/Pages.css"; 

export default function CasoPage() {
    
    // ==========================================================
    // 1. OBTENER DATOS Y FUNCIONES CORE (DEL CONTEXTO)
    // ==========================================================
    const {
        nombreApellido,
        clienteDoc,
        clienteExiste,
        casoActivoExiste,
        casoData,
        listaCasosActivos, 
        listaEspecializaciones,
        
        // Funciones CORE (motores de la app)
        handleSearch,
        handleCrearCaso,
        handleSelectCaso, 
    } = useCaso();

    // ==========================================================
    // 2. OBTENER LÓGICA DE LA VISTA (DEL HOOK DE LÓGICA)
    // ==========================================================
    const {
        handleNombreApellidoChange, // Handler para el input de nombre/apellido
        handleDocChange,            // Handler para el input de documento
        handleCasoChange,           // Handler genérico de los inputs de caso
        handleGuardarCaso,          // Lógica de guardado/creación
        handleAcuerdoPago,          // Lógica de Acuerdo de Pago
        isCaseInputDisabled,        // Estado de deshabilitación de inputs de caso
        isSaveButtonDisabled,       // Estado de deshabilitación del botón Guardar
    } = useCasoPageLogic();

    return (
        <div className="page-container">
            <h1>Gestión de Caso</h1>
            
            {/* Contenedor de columnas */}
            <div className="form-section">

                {/* Columna izquierda (Datos del Caso) */}
                <div className="form-column">
                    <label>No Caso</label>
                    <div className="row-inline">
                        
                        {/* lista desplegable  */}
                        {casoActivoExiste && listaCasosActivos.length > 1 ? (
                            <select
                                value={casoData.nocaso}
                                onChange={(e) => handleSelectCaso(e.target.value)}
                                disabled={!isCaseInputDisabled} 
                            >
                                {listaCasosActivos.map(caso => (
                                    <option key={caso.numero_caso} value={caso.numero_caso}>
                                        {caso.numero_caso} - {caso.especializacion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            // Input fijo para el No Caso
                            <input 
                                type="text" 
                                value={casoData.nocaso} 
                                disabled={true} 
                            />
                        )}

                        {/* Botón "Crear" */}
                        {clienteExiste && isCaseInputDisabled && (
                            <button 
                                className="btn-secondary" 
                                onClick={handleCrearCaso}
                            >
                                Crear
                            </button>
                        )}
                        
                    </div>

                    <label>Fecha Inicio</label>
                    <input 
                        type="date" 
                        name="fechaInicio" 
                        value={casoData.fechaInicio} 
                        onChange={handleCasoChange} // 🛑 Usamos el handler del hook de lógica
                        disabled={isCaseInputDisabled} 
                    />

                    <label>Fecha Fin</label>
                    <input 
                        type="date" 
                        name="fechaFin"
                        value={casoData.fechaFin} 
                        onChange={handleCasoChange} // 🛑 Usamos el handler del hook de lógica
                        disabled={true} // Siempre deshabilitado 
                    />

                    <label>Especialización</label>
                    <select
                        name="especializacion"
                        value={casoData.especializacion} 
                        onChange={handleCasoChange} // 🛑 Usamos el handler del hook de lógica
                        disabled={isCaseInputDisabled} 
                    >
                        <option value="" disabled>Seleccione una especialización</option>

                        {listaEspecializaciones.map(esp => (
                            <option 
                                key={esp.cod_especializacion} 
                                value={esp.cod_especializacion}
                            >
                                {esp.nombre_especializacion}
                            </option>
                        ))}
                    </select>

                    <label>Valor</label>
                    {/* Contenedor para Valor y Acuerdo Pago */}
                    <div className="row-inline">
                        <input 
                            type="number" 
                            name="valor"
                            value={casoData.valor} 
                            onChange={handleCasoChange} // 🛑 Usamos el handler del hook de lógica
                            disabled={isCaseInputDisabled} 
                            placeholder="Valor" 
                        />
                        
                        {/* Botón ACUERDO PAGO */}
                        <button 
                            className="btn-primary"
                            onClick={handleAcuerdoPago} // 🛑 Usamos el handler del hook de lógica
                            disabled={!casoActivoExiste} 
                        >
                            Acuerdo Pago
                        </button>
                    </div>

                    {/* Botones: Solo dejamos Guardar Caso */}
                    <div className="buttons-group">
                        {/*Botón GUARDAR CASO */}
                        <button 
                            className="btn-primary" 
                            onClick={handleGuardarCaso} // 🛑 Usamos el handler del hook de lógica
                            disabled={isSaveButtonDisabled} 
                        >
                            Guardar Caso
                        </button>
                        
                    </div>
                </div>

                {/* Columna derecha (Datos del Cliente) */}
                <div className="form-column">

                    <label>Cliente</label>
                    <div className="row-inline">
                        <input 
                            type="text" 
                            placeholder="Nombre y Apellido" 
                            value={nombreApellido}
                            // 🛑 Usamos el handler del hook de lógica para que aplique el reseteo
                            onChange={(e) => handleNombreApellidoChange(e.target.value)}
                            disabled={clienteDoc.length > 0} 
                        />
                        {/* Botón Lupa para buscar */}
                        <button className="search-btn" onClick={handleSearch}>
                            🔍
                        </button>
                    </div>
                    
                    {/* Botón Crear Cliente */}
                    {clienteExiste === false && (
                        <button className="btn-secondary">Crear Cliente</button> 
                    )}

                    <label>Documento</label>
                    <input 
                        type="text" 
                        value={clienteDoc} 
                        // 🛑 Usamos el handler del hook de lógica para que aplique el reseteo
                        onChange={handleDocChange}
                        disabled={nombreApellido.length > 0 && clienteExiste !== false} 
                        placeholder="Documento"
                    />
                    
                </div>

            </div>
        </div>
    );
}