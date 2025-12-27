// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/home.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ brand = "SciCon" }) {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const role = (user?.role || "").toLowerCase().trim();
  const isAdmin = isAuth && role === "admin";
  const isReviewer = isAuth && role === "reviewer";
  const canSubmit = isAuth && (role === "attendee" || role === "author");

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
              {isAdmin ? (
                // ADMIN vidi samo admin meni
                <>
                  <Link to="/admin" className="btn btn--ghost">Konferencije (admin)</Link>
                  <Link to="/admin/submissions" className="btn btn--ghost">Submisije</Link>
                  <button className="btn btn--primary" onClick={handleLogout}>Odjavi se</button>
                </>
              ) : (
                // SVI OSTALI (reviewer/author/attendee…)
                <>
                  {isReviewer && (
                    <Link to="/reviewer" className="btn btn--ghost">Moje recenzije</Link>
                  )}

                  {/* Attendee (i/ili author) mogu da vide konferencije */}
                  <Link to="/conferences">Konferencije</Link>

                  {/* Attendee/Author: Pošalji rad */}
                  {canSubmit && (
                    <Link to="/submissions/new" className="btn btn--accent">Pošalji rad</Link>
                  )}

                  <span className="tag" title={`Uloga: ${user?.role || "-"}`}>{user?.role || "korisnik"}</span>
                  <Link to="/profile" className="btn btn--ghost">Moj profil</Link>
                  <button className="btn btn--primary" onClick={handleLogout}>Odjavi se</button>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
