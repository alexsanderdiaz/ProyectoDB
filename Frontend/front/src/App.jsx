// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CasoPage from "./pages/CasoPage";
import ExpedientePage from "./pages/ExpedientePage";
// 🛑 IMPORTAR EL PROVEEDOR DEL CONTEXTO
import { CasoProvider } from "./context/CasoContext"; 

export default function App() {
  return (
    // 1. ENVUELVE TODO EL ÁRBOL DE COMPONENTES DE RUTAS CON EL PROVEEDOR
    <CasoProvider> 
        <BrowserRouter>
          <Navbar />

          <div style={{ paddingTop: "80px", paddingLeft: "20px", paddingRight: "20px" }}>
            <Routes>
              <Route path="/caso" element={<CasoPage/>} />
              <Route path="/expediente" element={<ExpedientePage />} />
              <Route path="*" element={<CasoPage />} />
            </Routes>
          </div>
        </BrowserRouter>
    </CasoProvider> 
    // Ahora, CasoPage y ExpedientePage son 'nietos' del CasoProvider y comparten el estado.
  );
}