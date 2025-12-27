import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css"; // koristi isti stil (auth layout, polja)
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

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "attendee",       // backend default je attendee; ostavljamo i ručno ovde
    affiliation: "",
    orcid: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErr("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // jednostavna klijentska validacija
    if (form.password.length < 8) {
      setErr("Lozinka mora imati najmanje 8 karaktera.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Lozinke se ne poklapaju.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role || undefined,              // ostavi attendee ili author (po želji)
        affiliation: form.affiliation || undefined,
        orcid: form.orcid || undefined,
      };

      const res = await axios.post("/auth/register", payload);
      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Neispravan odgovor servera.");

      // upiši u context + localStorage (radi AuthProvider)
      login(user, token);

      navigate(roleRedirect(user.role), { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 422 ? "Proverite unete podatke." : null) ||
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

          <h1 className="auth__title">Registracija</h1>
          <p className="auth__lead">
            Kreirajte nalog i započnite sa prijavama i upravljanjem konferencijama.
          </p>

          {err ? <div className="alert alert--error">{err}</div> : null}

          <form className="auth__form" onSubmit={onSubmit}>
            <TextField
              label="Ime i prezime"
              name="name"
              type="text"
              placeholder="npr. Ana Marković"
              value={form.name}
              onChange={onChange}
              required
            />
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

            
           <label className="field">
            <span className="field__label">Uloga</span>
            <select
                className="field__input"
                name="role"
                value={form.role}
                onChange={onChange}
            >
                <option value="attendee">Attendee</option>
                <option value="reviewer">Reviewer</option>
            </select>
            </label>
            <small className="field__help">
            „Attendee” je polaznik konferencija (može slati radove). „Reviewer” dobija pristup recenziranju.
            </small>


          <TextField
            label="Affiliation (opciono)"
            name="affiliation"
            type="text"
            placeholder="npr. Fakultet organizacionih nauka"
            value={form.affiliation}
            onChange={onChange}
            />
            <small className="field__help">
            Institucija ili organizacija sa kojom ste povezani (npr. fakultet, institut, kompanija).
            </small>

            <TextField
            label="ORCID (opciono)"
            name="orcid"
            type="text"
            placeholder="0000-0000-0000-0000"
            value={form.orcid}
            onChange={onChange}
            />
            <small className="field__help">
            ORCID je jedinstveni identifikator istraživača koji omogućava lakše prepoznavanje i povezivanje autora.
            Ako ga imate, unesite svoj ORCID ID.
            </small>


            <PasswordField
              label="Lozinka"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
            <PasswordField
              label="Potvrdi lozinku"
              name="confirm"
              placeholder="••••••••"
              value={form.confirm}
              onChange={onChange}
              required
            />

            <div className="auth__actions">
              <Button type="submit" loading={loading}>Kreiraj nalog</Button>
              <Link to="/login" className="btn btn--ghost">Već imaš nalog? Prijava</Link>
            </div>
          </form>
        </div>

        {/* Info panel (opciono) */}
        <aside className="auth__aside" aria-hidden="true">
          <div className="auth__asideInner">
            <h3>Dobro došli!</h3>
            <p>
              Nakon registracije možete prijaviti rad, kupiti kartu i upravljati svojim ulogama.
            </p>
            <ul className="auth__bullets">
              <li>• Kreiranje i praćenje prijava</li>
              <li>• Kupovina karata i check-in</li>
              <li>• Peer-review i recenziranje</li>
              <li>• Objave u časopisu</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
