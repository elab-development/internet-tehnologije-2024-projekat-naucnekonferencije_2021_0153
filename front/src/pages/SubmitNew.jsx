import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/submit.css";
import { useAuth } from "../context/AuthContext";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function SubmitNew() {
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();

  const [confs, setConfs] = useState([]);
  const [loadingConfs, setLoadingConfs] = useState(true);
  const [errConfs, setErrConfs] = useState("");

  const [form, setForm] = useState({
    conference_id: "",
    title: "",
    abstract: "",
    manuscript_path: "",
    keywords: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/conferences");
        const list = res.data?.data || res.data || [];
        if (mounted) setConfs(list);
      } catch (e) {
        setErrConfs(e?.response?.data?.message || "Ne možemo da učitamo konferencije.");
      } finally {
        setLoadingConfs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErr("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!isAuth) {
      setErr("Morate biti prijavljeni da biste poslali rad.");
      return;
    }
    if (!form.conference_id) return setErr("Izaberite konferenciju.");
    if (!form.title.trim()) return setErr("Naslov je obavezan.");
    if (!form.manuscript_path.trim()) return setErr("Link do rada (manuscript_path) je obavezan.");

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        abstract: form.abstract || undefined,
        corresponding_author_id: user.id,
        manuscript_path: form.manuscript_path.trim(),
        supplementary_files: [], // uvek prazan niz
        keywords: form.keywords || undefined,
      };

      await axios.post(`/conferences/${form.conference_id}/submissions`, payload);

      navigate("/profile", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri slanju rada.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container submit__container">
      <section className="card submit__card">
        <div className="submit__head">
          <h1 className="submit__title">Pošalji rad</h1>
          <p className="submit__lead">Izaberi konferenciju i unesi podatke o radu.</p>
        </div>

        {loadingConfs && <div>Učitavanje konferencija…</div>}
        {errConfs && <div className="alert alert--error">{errConfs}</div>}

        <form className="submit__form" onSubmit={onSubmit}>
          {/* Konferencija */}
          <label className="field">
            <span className="field__label">Konferencija</span>
            <select
              className="field__input"
              name="conference_id"
              value={form.conference_id}
              onChange={onChange}
              required
            >
              <option value="">— izaberi —</option>
              {confs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.acronym ? `(${c.acronym})` : ""}
                </option>
              ))}
            </select>
          </label>

          <TextField
            label="Naslov"
            name="title"
            type="text"
            placeholder="Naslov rada"
            value={form.title}
            onChange={onChange}
            required
          />

          <label className="field">
            <span className="field__label">Apstrakt (opciono)</span>
            <textarea
              name="abstract"
              className="field__input"
              rows={4}
              placeholder="Kratak opis rada..."
              value={form.abstract}
              onChange={onChange}
            />
          </label>

          <TextField
            label="Link do rada (PDF)"
            name="manuscript_path"
            type="text"
            placeholder="npr. papers/my_paper.pdf ili https://…"
            value={form.manuscript_path}
            onChange={onChange}
            required
          />

          <TextField
            label="Ključne reči (opciono)"
            name="keywords"
            type="text"
            placeholder="npr. AI, ML, zdravstvo"
            value={form.keywords}
            onChange={onChange}
          />

          {err && <div className="alert alert--error">{err}</div>}

          <div className="submit__actions">
            <Button type="submit" loading={submitting}>
              Pošalji rad
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
