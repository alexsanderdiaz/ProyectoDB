import { useCasoLogic } from "../hooks/useCaso"; // IMPORTAR EL HOOK
import "../styles/Pages.css"; 

export default function CasoPage() {
    // 1. OBTENER LA LÓGICA Y EL ESTADO DEL CUSTOM HOOK
    const {
        nombreApellido,
        setNombreApellido,
        clienteDoc,
        handleDocChange, // 🛑 Obtener el nuevo handler
        clienteExiste,
        casoActivoExiste,
        casoData,
        handleSearch,
        handleCrearCaso,
        isCaseInputDisabled,
        handleCasoChange,
    } = useCasoLogic();

    return (
        <div className="page-container">
            {/* Contenedor de columnas */}
            <div className="form-section">

                {/* Columna izquierda (Datos del Caso) */}
                <div className="form-column">
                    {/* ... (Código de Columna Izquierda, sin cambios aquí) ... */}
                    <label>No Caso</label>
                    <div className="row-inline">
                        <input 
                            type="text" 
                            value={casoData.nocaso} 
                            disabled={true} 
                        />
                        {/* Botón "Crear" que aparece frente a No Caso */}
                        {clienteExiste && !casoActivoExiste && (
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
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled}
                    />

                    <label>Fecha Fin</label>
                    <input 
                        type="date" 
                        name="fechaFin"
                        value={casoData.fechaFin} 
                        onChange={handleCasoChange}
                        disabled={true} // Siempre deshabilitado
                    />

                    <label>Especialización</label>
                    <input 
                        type="text" 
                        name="especializacion"
                        value={casoData.especializacion} 
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled}
                        placeholder="Especialización" 
                    />

                    <label>Valor</label>
                    <input 
                        type="number" 
                        name="valor"
                        value={casoData.valor} 
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled}
                        placeholder="Valor" 
                    />

                    {/* Botones */}
                    <button className="btn-primary" disabled={isCaseInputDisabled}>Guardar Caso</button>
                    <button className="btn-primary" disabled={isCaseInputDisabled}>Acuerdo Pago</button> 
                </div>

                {/* Columna derecha (Datos del Cliente) */}
                <div className="form-column">

                    <label>Cliente</label>
                    <div className="row-inline">
                        <input 
                            type="text" 
                            placeholder="Nombre y Apellido" 
                            value={nombreApellido}
                            onChange={(e) => setNombreApellido(e.target.value)}
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
                        //onChange={handleDocChange}
                        disabled={true}
                        placeholder="Documento"
                    />
                    
                </div>

            </div>
        </div>
    );
}