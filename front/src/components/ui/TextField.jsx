import React from "react";
import "../../css/login.css";

export default function TextField({ label, error, ...rest }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={`field__input ${error ? "field__input--error" : ""}`} {...rest} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
