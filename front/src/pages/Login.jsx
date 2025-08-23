import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";

/* ---------------- Reusable UI elements ---------------- */

function Button({ children, variant = "primary", loading, ...rest }) {
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

function TextField({ label, error, ...rest }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={`field__input ${error ? "field__input--error" : ""}`} {...rest} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="field field--password">
      <span className="field__label">{props.label}</span>
      <div className="field__passwordWrap">
        <input
          className={`field__input ${props.error ? "field__input--error" : ""}`}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          {...props}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sakrij lozinku" : "Prikaži lozinku"}
        >
          {show ? "Sakrij" : "Prikaži"}
        </button>
      </div>
      {props.error ? <span className="field__error">{props.error}</span> : null}
    </div>
  );
}

/* ---------------- API helper (axios instance) ---------------- */

const api = axios.create({
  baseURL:  "http://localhost:8000/api",
});

/* ---------------- Role → route mapa ---------------- */

const roleRedirect = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "organizer":
      return "/organizer";
    case "editor":
      return "/editor";
    case "reviewer":
      return "/reviewer";
    case "author":
      return "/author";
    case "attendee":
    default:
      return "/profile";
  }
};

/* ---------------- Page component ---------------- */

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErr("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Neispravan odgovor servera.");

      // Sačuvaj token & podesi default Authorization header
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Preusmeravanje po ulozi (ili na /profile ako ti je to default)
      navigate(roleRedirect(user.role), { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 422 ? "Pogrešan email ili lozinka." : null) ||
        "Došlo je do greške. Pokušajte ponovo.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="container auth__wrap">
        <div className="auth__card">
          <div className="auth__brand">
            <span className="brand__dot" />
            <span>ResearchFlow</span>
          </div>

          <h1 className="auth__title">Prijava</h1>
          <p className="auth__lead">
            Ulogujte se da upravljate konferencijama, rukopisima i recenzijama.
          </p>

          {err ? <div className="alert alert--error">{err}</div> : null}

          <form className="auth__form" onSubmit={onSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
            <PasswordField
              label="Lozinka"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />

            <div className="auth__actions">
              <Button type="submit" loading={loading}>
                Uloguj se
              </Button>
              <Link to="/register" className="btn btn--ghost">
                Kreiraj nalog
              </Link>
            </div>
          </form>

          <div className="auth__meta">
            <a className="link" href="/forgot-password">Zaboravljena lozinka?</a>
          </div>
        </div>

        {/* Dekor / info panel (opciono) */}
        <aside className="auth__aside" aria-hidden="true">
          <div className="auth__asideInner">
            <h3>Dobrodošli nazad!</h3>
            <p>
              Jedinstvena kontrolna tabla za organizatore, urednike, recenzente i autore.
              Brzo pristupite svojim konferencijama i rukopisima.
            </p>
            <ul className="auth__bullets">
              <li>• Upravljanje konferencijama</li>
              <li>• Prodaja karata i registracije</li>
              <li>• Peer-review tok</li>
              <li>• Časopis i specijalni brojevi</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
