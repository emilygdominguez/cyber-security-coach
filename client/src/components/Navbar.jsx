import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/educate", label: "Educate" },
];

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand-mark">
        <div className="brand-icon">AC</div>
        <div>
          <p className="brand-eyebrow">Hackathon MVP</p>
          <h1>AI Cyber Safety Coach</h1>
        </div>
      </NavLink>

      <nav className="nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
