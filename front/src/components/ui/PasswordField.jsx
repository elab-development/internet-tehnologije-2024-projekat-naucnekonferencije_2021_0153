import React, { useState } from "react";
import "../../css/login.css";

export default function PasswordField({ label, error, ...rest }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field field--password">
      {label && <span className="field__label">{label}</span>}

      <div className="field__passwordWrap">
        <input
          className={`field__input ${error ? "field__input--error" : ""}`}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          {...rest}
        />

        <button
          type="button"
          className="field__toggle"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? "Sakrij lozinku" : "Prikaži lozinku"}
        >
          {show ? "Sakrij" : "Prikaži"}
        </button>
      </div>

      {error ? <span className="field__error">{error}</span> : null}
    </div>
  );
}
