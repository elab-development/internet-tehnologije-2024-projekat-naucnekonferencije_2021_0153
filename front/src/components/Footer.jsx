import React from "react";
import "../css/home.css";

export default function Footer({ brand = "SciCon" }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="brand brand--footer">
          <span className="brand__dot" />
          <span>{brand}</span>
        </div>

        <div className="footer__links">
          <a href="/terms">Uslovi</a>
          <a href="/privacy">Privatnost</a>
          <a href="/contact">Kontakt</a>
        </div>

        <div className="footer__copy">© {new Date().getFullYear()} {brand}</div>
      </div>
    </footer>
  );
}
