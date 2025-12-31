import { useState } from "react";
import "../Style/navbar.css";
import { NavLink } from "react-router-dom";
import Profile_Status from "./Profile";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="medbrief-navbar">
      <div className="medbrief-nav-left">
        <NavLink to="/Home" className="medbrief-logo" onClick={closeMenu}>
          MedBrief
        </NavLink>
      </div>

      <nav className={`medbrief-nav-center ${menuOpen ? "is-open" : ""}`}>
        {[
          { path: "/Home", label: "Home" },
          { path: "/Upload", label: "Upload" },
          { path: "/Reports", label: "Reports" },
          { path: "/SmartHelper", label: "Smart Helper" },
          { path: "/Help", label: "Help" },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "medbrief-nav-link active" : "medbrief-nav-link"
            }
            onClick={closeMenu}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="medbrief-nav-right">
        <Profile_Status />
        <button
          className="medbrief-mobile-toggle"
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
};

export default Navbar;