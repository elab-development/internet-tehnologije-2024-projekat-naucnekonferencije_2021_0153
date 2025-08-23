import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import PasswordField from "../components/ui/PasswordField";
import { useAuth } from "../context/AuthContext";

const roleRedirect = (role) => {
  switch (role) {
    case "admin": return "/admin";
    case "organizer": return "/organizer";
    case "editor": return "/editor";
    case "reviewer": return "/reviewer";
    case "author": return "/author";
    default: return "/profile";
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      const res = await axios.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Neispravan odgovor servera.");

      // setuj u context + localStorage (radi AuthProvider)
      login(user, token);

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
            <span>SciCon</span>
          </div>

          <h1 className="auth__title">Prijava</h1>
          <p className="auth__lead">Ulogujte se da upravljate konferencijama, rukopisima i recenzijama.</p>

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
              <Button type="submit" loading={loading}>Uloguj se</Button>
              <Link to="/register" className="btn btn--ghost">Kreiraj nalog</Link>
            </div>
          </form>

          <div className="auth__meta">
            <a className="link" href="/forgot-password">Zaboravljena lozinka?</a>
          </div>
        </div>

        <aside className="auth__aside" aria-hidden="true">
          <div className="auth__asideInner">
            <h3>Dobrodošli nazad!</h3>
            <p>Jedinstvena kontrolna tabla za organizatore, urednike, recenzente i autore.</p>
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
