import React from "react";
import "../../css/login.css";

export default function Button({ children, variant = "primary", loading, ...rest }) {
  const cls =
    variant === "ghost"
      ? "btn btn--ghost"
      : variant === "accent"
      ? "btn btn--accent"
      : "btn btn--primary";

  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? "Molimo sačekajte..." : children}
    </button>
  );
}
