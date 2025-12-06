
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink 
          to="/caso" 
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Caso
        </NavLink>

        <NavLink 
          to="/expediente" 
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Expediente
        </NavLink>
      </div>
    </nav>
  );
}
