import { useCasoLogic } from "../hooks/useCaso"; 
import "../styles/Pages.css"; 

export default function CasoPage() {
    // 1. OBTENER LA LÓGICA Y EL ESTADO DEL CUSTOM HOOK
    const {
        nombreApellido,
        setNombreApellido,
        clienteDoc,
        handleDocChange, 
        clienteExiste,
        casoActivoExiste,
        casoData,
        listaCasosActivos, // 🛑 Nuevo
        handleSearch,
        handleCrearCaso,
        handleSelectCaso, // 🛑 Nuevo
        isCaseInputDisabled,
        handleCasoChange,
    } = useCasoLogic();

    // Requisito: Todos los elementos están deshabilitados con excepción el nombre Cliente.
    // Esto se maneja con el estado isCaseInputDisabled, que es true por defecto.

    return (
        <div className="page-container">
            {/* Contenedor de columnas */}
            <div className="form-section">

                {/* Columna izquierda (Datos del Caso) */}
                <div className="form-column">
                    <label>No Caso</label>
                    <div className="row-inline">
                        
                        {/* 🛑 Implementación de lista desplegable (Requisito c) */}
                        {casoActivoExiste && listaCasosActivos.length > 1 ? (
                            <select
                                value={casoData.nocaso}
                                onChange={(e) => handleSelectCaso(e.target.value)}
                                disabled={!isCaseInputDisabled} // Solo si no estamos en modo "crear"
                            >
                                {listaCasosActivos.map(caso => (
                                    <option key={caso.numero_caso} value={caso.numero_caso}>
                                        {caso.numero_caso} - {caso.especializacion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            // Si solo hay 0 o 1 caso, o si estamos creando uno nuevo (no se usa select), usa un INPUT
                            <input 
                                type="text" 
                                value={casoData.nocaso} 
                                disabled={true} 
                            />
                        )}

                        {/* Botón "Crear" (Requisito e) */}
                        {/* Aparece si el cliente existe Y los inputs de caso están deshabilitados (no estamos editando/creando) */}
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
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled} // Habilitado solo en modo "Crear" (Requisito f)
                    />

                    <label>Fecha Fin</label>
                    <input 
                        type="date" 
                        name="fechaFin"
                        value={casoData.fechaFin} 
                        onChange={handleCasoChange}
                        disabled={true} // Siempre deshabilitado (Requisito h)
                    />

                    <label>Especialización</label>
                    <input 
                        type="text" //  Aquí podrías usar un <select> si tienes una lista estática de especializaciones
                        name="especializacion"
                        value={casoData.especializacion} 
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled} // Habilitado solo en modo "Crear" (Requisito f)
                        placeholder="Especialización" 
                    />

                    <label>Valor</label>
                    <input 
                        type="number" 
                        name="valor"
                        value={casoData.valor} 
                        onChange={handleCasoChange}
                        disabled={isCaseInputDisabled} // Habilitado solo en modo "Crear" (Requisito f)
                        placeholder="Valor" 
                    />

                    {/* Botones */}
                    {/* Solo habilitados si isCaseInputDisabled es FALSE (modo crear/editar) */}
                    <button className="btn-primary" disabled={isCaseInputDisabled}>Guardar Caso</button>
                    {/* Requisito (g) */}
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
                            // Requisito: ÚNICO campo habilitado inicialmente
                        />
                        {/* Botón Lupa para buscar */}
                        <button className="search-btn" onClick={handleSearch}>
                            🔍
                        </button>
                    </div>
                    
                    {/* Botón Crear Cliente (Requisito a) */}
                    {clienteExiste === false && (
                        <button className="btn-secondary">Crear Cliente</button> 
                    )}

                    <label>Documento</label>
                    <input 
                        type="text" 
                        value={clienteDoc} 
                        // onChange={handleDocChange} // Se mantiene comentado/eliminado según tu petición
                        disabled={true} // Se mantiene deshabilitado según tu petición
                        placeholder="Documento"
                    />
                    
                </div>

            </div>
        </div>
    );
}