import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/home.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ brand = "SciCon" }) {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <div className="brand">
          <span className="brand__dot" />
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span>{brand}</span>
          </Link>
        </div>

        <nav className="nav__links">


          {!isAuth ? (
            <>
              <Link to="/register" className="btn btn--ghost">Registracija</Link>
              <Link to="/login" className="btn btn--accent">Uloguj se</Link>
            </>
          ) : (
            <>
              {/* mali badge sa ulogom */}
              <span className="tag" title={`Uloga: ${user?.role || "-"}`}>
                {user?.role || "korisnik"}
              </span>
              <Link to="/profile" className="btn btn--ghost">
                Moj profil
              </Link>
              <button className="btn btn--primary" onClick={handleLogout}>
                Odjavi se
              </button>
            </>
          )}
        </nav>

      
      </div>
    </header>
  );
}
