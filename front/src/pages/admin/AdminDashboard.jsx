import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../css/admin.css";  
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";

const emptyForm = {
  title: "",
  acronym: "",
  location: "",
  start_date: "",
  end_date: "",
  status: "draft",
  description: "",
  max_capacity: "",
};

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("start_date_asc"); // start_date_asc|start_date_desc|title_asc|title_desc

  // forma (kreiranje/izmena)
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // učitaj konferencije
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get("/conferences?per_page=100");
      const list = res.data?.data || res.data || [];
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju konferencija.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = rows;
    if (term) {
      list = list.filter(c =>
        [c.title, c.acronym, c.location].filter(Boolean)
          .some(v => String(v).toLowerCase().includes(term))
      );
    }
    // sortiranje
    const byTitle = (a,b) => String(a.title || "").localeCompare(String(b.title || ""), undefined, {sensitivity:"base"});
    const byStart  = (a,b) => new Date(a.start_date || 0) - new Date(b.start_date || 0);

    if (sort === "title_asc")      list = [...list].sort(byTitle);
    if (sort === "title_desc")     list = [...list].sort((a,b)=>-byTitle(a,b));
    if (sort === "start_date_asc") list = [...list].sort(byStart);
    if (sort === "start_date_desc")list = [...list].sort((a,b)=>-byStart(a,b));

    return list;
  }, [rows, q, sort]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = async (row) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      acronym: row.acronym || "",
      location: row.location || "",
      start_date: (row.start_date || "").slice(0,10),
      end_date: (row.end_date || "").slice(0,10),
      status: row.status || "draft",
      description: row.description || "",
      max_capacity: row.max_capacity ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = {
      ...form,
      max_capacity: form.max_capacity === "" ? null : Number(form.max_capacity),
    };

    try {
      if (editingId) {
        await axios.put(`/conferences/${editingId}`, payload);
      } else {
        await axios.post(`/conferences`, payload);
      }
      await load();
      setEditingId(null);
      setForm(emptyForm);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri čuvanju.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Obriši konferenciju?")) return;
    try {
      await axios.delete(`/conferences/${id}`);
      setRows(rows => rows.filter(r => r.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju.");
    }
  };

  const publish = async (id) => {
    try {
      await axios.put(`/conferences/${id}/publish`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri publish-u.");
    }
  };

  const close = async (id) => {
    try {
      await axios.put(`/conferences/${id}/close`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri zatvaranju.");
    }
  };

  return (
    <div className="container admin__container">
      <header className="admin__head card">
        <div>
          <h1 className="admin__title">Admin • Konferencije</h1>
          <p className="admin__lead">Kreiraj, uređuj, objavljuj ili zatvori konferencije.</p>
        </div>

        <div className="admin__tools">
          <input
            className="field__input admin__search"
            placeholder="Pretraga (naziv, akronim, lokacija)…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <select
            className="field__input admin__sort"
            value={sort}
            onChange={(e)=>setSort(e.target.value)}
            title="Sortiranje"
          >
            <option value="start_date_asc">Po datumu (rasteće)</option>
            <option value="start_date_desc">Po datumu (opadajuće)</option>
            <option value="title_asc">Po nazivu (A–Z)</option>
            <option value="title_desc">Po nazivu (Z–A)</option>
          </select>
          <button className="btn btn--accent" onClick={startCreate}>+ Nova konferencija</button>
        </div>
      </header>

      {/* Forma */}
      <section className="card admin__form">
        <h2>{editingId ? "Izmeni konferenciju" : "Nova konferencija"}</h2>
        <form onSubmit={save} className="admin__formGrid">
          <TextField label="Naziv" name="title" value={form.title} onChange={onChange} required />
          <TextField label="Akronim" name="acronym" value={form.acronym} onChange={onChange} />
          <TextField label="Lokacija" name="location" value={form.location} onChange={onChange} />

          <label className="field">
            <span className="field__label">Početak</span>
            <input type="date" name="start_date" className="field__input" value={form.start_date} onChange={onChange} />
          </label>

          <label className="field">
            <span className="field__label">Kraj</span>
            <input type="date" name="end_date" className="field__input" value={form.end_date} onChange={onChange} />
          </label>

          <label className="field">
            <span className="field__label">Status</span>
            <select name="status" className="field__input" value={form.status} onChange={onChange}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="closed">closed</option>
            </select>
          </label>

          <label className="field field--full">
            <span className="field__label">Opis</span>
            <textarea
              name="description"
              rows={3}
              className="field__input"
              value={form.description}
              onChange={onChange}
            />
          </label>

          <TextField
            label="Kapacitet (max)"
            name="max_capacity"
            type="number"
            min="0"
            value={form.max_capacity}
            onChange={onChange}
          />

          <div className="admin__formActions">
            <Button type="submit" loading={saving}>
              {editingId ? "Sačuvaj izmene" : "Kreiraj"}
            </Button>
            {editingId && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
              >
                Otkaži
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Lista */}
      {loading && <div>Učitavanje…</div>}
      {err && <div className="alert alert--error">{err}</div>}

      <section className="grid admin__grid">
        {filtered.map(c => (
          <article className="card admin__item" key={c.id}>
            <div className="admin__itemHead">
              <div>
                <h3 className="admin__itemTitle">
                  {c.title} {c.acronym ? <span className="admin__acronym">({c.acronym})</span> : null}
                </h3>
                <div className="admin__meta">
                  {c.status ? <span className="tag">{c.status}</span> : null}
                  {c.location ? <span>• {c.location}</span> : null}
                  {(c.start_date || c.end_date) && (
                    <span>• {fmtDate(c.start_date)} – {fmtDate(c.end_date)}</span>
                  )}
                </div>
              </div>
              <div className="admin__actions">
                {c.status !== "published" && (
                  <button className="btn btn--ghost" onClick={() => publish(c.id)}>Objavi</button>
                )}
                {c.status !== "closed" && (
                  <button className="btn btn--ghost" onClick={() => close(c.id)}>Zatvori</button>
                )}
                <button className="btn btn--primary" onClick={() => startEdit(c)}>Izmeni</button>
                <button className="btn btn--danger" onClick={() => remove(c.id)}>Obriši</button>
              </div>
            </div>

            {c.description ? <p className="admin__desc">{c.description}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return String(d); }
}
