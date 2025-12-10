import { useCasoLogic } from "../hooks/useCaso"; 
import "../styles/Pages.css"; 

export default function CasoPage() {
    // OBTENER LA LÓGICA Y EL ESTADO DEL CUSTOM HOOK
    const {
        nombreApellido,
        setNombreApellido,
        clienteDoc,
        handleDocChange, 
        clienteExiste,
        casoActivoExiste, // 🛑 USADO PARA HABILITAR ACUERDO PAGO
        casoData,
        listaCasosActivos, 
        handleSearch,
        handleCrearCaso,
        handleSelectCaso, 
        isCaseInputDisabled,
        handleCasoChange,
        listaEspecializaciones,

        // ESTADOS Y HANDLERS PARA EL INSERT
        handleGuardarCaso, 
        handleAcuerdoPago, 
        isSaveButtonDisabled, 

    } = useCasoLogic();

    return (
        <div className="page-container">
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
                    <select
                        name="especializacion"
                        value={casoData.especializacion} 
                        onChange={handleCasoChange}
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
                            onChange={handleCasoChange}
                            disabled={isCaseInputDisabled} 
                            placeholder="Valor" 
                        />
                        
                        {/* 🛑 Botón ACUERDO PAGO: Color primario y habilitado si casoActivoExiste es true */}
                        <button 
                            className="btn-primary" // CAMBIO 1: Usa la clase primaria para el color
                            onClick={handleAcuerdoPago}
                            disabled={!casoActivoExiste} // CAMBIO 2: Habilitado solo si existe un caso activo
                        >
                            Acuerdo Pago
                        </button>
                    </div>

                    {/* Botones: Solo dejamos Guardar Caso */}
                    <div className="buttons-group">
                        {/*Botón GUARDAR CASO */}
                        <button 
                            className="btn-primary" 
                            onClick={handleGuardarCaso} 
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

                        //Se implementa la busqueda por documento tambien
                        //onChange={handleDocChange}
                        disabled={true} 
                        placeholder="Documento"
                    />
                    
                </div>

            </div>
        </div>
    );
}