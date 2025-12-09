// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CasoPage from "./pages/CasoPage";
import ExpedientePage from "./pages/ExpedientePage";

export default function App() {
  return (
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
  );
}
