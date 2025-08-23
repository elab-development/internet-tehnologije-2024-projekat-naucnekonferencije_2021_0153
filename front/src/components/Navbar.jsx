import React from "react";
import "../css/home.css";

export default function Navbar({ brand = "SciCon" }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <div className="brand">
          <span className="brand__dot" />
          <span>{brand}</span>
        </div>

        <nav className="nav__links">
          <a href="#features">Funkcionalnosti</a>
          <a href="#confs">Konferencije</a>
          <a href="#journal">Časopis</a>
          <a href="#pricing" className="btn btn--ghost">Tipovi karata</a>
          <a href="/login" className="btn btn--accent">Uloguj se</a>
        </nav>

        <button className="nav__burger" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
