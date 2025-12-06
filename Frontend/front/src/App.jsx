// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Caso from "./pages/Caso";
import Expediente from "./pages/Expediente";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div style={{ paddingTop: "80px", paddingLeft: "20px", paddingRight: "20px" }}>
        <Routes>
          <Route path="/caso" element={<Caso />} />
          <Route path="/expediente" element={<Expediente />} />
          <Route path="*" element={<Caso />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
