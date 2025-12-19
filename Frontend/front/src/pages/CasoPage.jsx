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
        casoActivoExiste, 
        casoData,
        listaCasosActivos, 
        handleSearch,
        handleCrearCaso,
        handleSelectCaso, 
        isCaseInputDisabled,
        handleCasoChange,
        listaEspecializaciones,

        // ESTADOS Y HANDLERS PARA EL INSERT DE CASO
        handleGuardarCaso, 
        isSaveButtonDisabled, 
        
        // LÓGICA DE ACUERDO DE PAGO
        handleAcuerdoPago, // Alternar visibilidad del formulario
        showAcuerdoPagoForm,
        acuerdoPagoData,
        handleAcuerdoPagoChange,
        listaFormasPago,
        handleAceptarAcuerdoPago, // Nuevo Handler para registrar el Pago
        isAcuerdoPagoButtonDisabled, // Nuevo estado de deshabilitar el botón
        
    } = useCasoLogic();

    return (
        <div className="page-container">
            {/* Contenedor de columnas */}
            <div className="form-section">

                {/* Columna izquierda (Datos del Caso) */}
                <div className="form-column">
                    <label>No Caso</label>
                    <div className="row-inline">
                        
                        {/* lista desplegable para casos activos vs. input fijo */}
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

                        {/* Botón "Crear" Caso */}
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
                        
                        {/* Botón ACUERDO PAGO: Toglea el formulario */}
                        <button 
                            className="btn-primary" 
                            onClick={handleAcuerdoPago}
                            disabled={!casoActivoExiste} // Solo si hay un caso activo
                        >
                            {/* Texto dinámico */}
                            {showAcuerdoPagoForm ? 'Cancelar Acuerdo' : 'Acuerdo Pago'}
                        </button>
                    </div>

                    {/*CAMPOS Y BOTÓN PARA EL ACUERDO DE PAGO */}
                    {showAcuerdoPagoForm && (
                        <>
                            <hr style={{ marginTop: '10px', marginBottom: '10px' }}/>
                            <h3>Detalles de Acuerdo de Pago</h3>
                            <label>Valor de Acuerdo</label>
                            <input 
                                type="number" 
                                name="valorAcuerdo"
                                value={acuerdoPagoData.valorAcuerdo} 
                                onChange={handleAcuerdoPagoChange}
                                placeholder="Valor a pagar" 
                            />

                            <label>Forma de Pago</label>
                            <select
                                name="formaPago"
                                value={acuerdoPagoData.formaPago} 
                                onChange={handleAcuerdoPagoChange}
                            >
                                <option value="" disabled>Seleccione una forma de pago</option>
                                {/* Usando la lista cargada del backend */}
                                {listaFormasPago.map(fp => (
                                    <option 
                                        key={fp.cod_forma_pago} 
                                        value={fp.cod_forma_pago}
                                    >
                                        {fp.nombre_forma_pago}
                                    </option>
                                ))}
                            </select>
                            
                            {/* BOTÓN ACEPTAR PAGO */}
                            <button
                                className="btn-primary" 
                                onClick={handleAceptarAcuerdoPago}
                                disabled={isAcuerdoPagoButtonDisabled} // Deshabilitado si faltan campos
                                style={{ marginTop: '10px' }}
                            >
                                Aceptar Pago
                            </button>
                        </>
                    )}

                    {/* Botón Guardar Caso (siempre visible, habilitado solo en modo creación) */}
                    <div className="buttons-group">
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
                        onChange={handleDocChange}
                        disabled={false}
                        placeholder="Documento"
                    />
                    
                </div>

            </div>
        </div>
    );
}