import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../css/admin.css";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";

export default function AdminTicketTypes() {
  // UZMI :id IZ URL-a
  const { id } = useParams();
  const conferenceId = id;

  const [conf, setConf] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    currency: "EUR",
    sales_start: "",
    sales_end: "",
    quota: ""
  });
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (form.price === "" || Number(form.price) < 0) return false;
    return true;
  }, [form]);

  const load = async () => {
    if (!conferenceId) {
      setErr("Nema ID konferencije u URL-u.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const c = await axios.get(`/conferences/${conferenceId}`);
      setConf(c.data?.data || c.data || null);

      const t = await axios.get(`/conferences/${conferenceId}/ticket-types`);
      setTickets(Array.isArray(t.data) ? t.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [conferenceId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addTicket = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        currency: (form.currency || "EUR").toUpperCase(),
        sales_start: form.sales_start || null,
        sales_end: form.sales_end || null,
        quota: form.quota === "" ? null : Number(form.quota),
      };
      await axios.post(`/conferences/${conferenceId}/ticket-types`, payload);
      setForm({
        name: "",
        price: "",
        currency: "EUR",
        sales_start: "",
        sales_end: "",
        quota: ""
      });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri dodavanju karte.");
    } finally {
      setSaving(false);
    }
  };

  const removeTicket = async (ticketId) => {
    if (!window.confirm("Obriši tip karte?")) return;
    try {
      await axios.delete(`/ticket-types/${ticketId}`);
      setTickets((t) => t.filter((x) => x.id !== ticketId));
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju karte.");
    }
  };

  if (loading) return <div className="container admin__container">Učitavanje…</div>;

  if (err) {
    return (
      <div className="container admin__container">
        <div className="alert alert--error">{err}</div>
        <Link to="/admin" className="btn btn--ghost" style={{ marginTop: 8 }}>
          ← Nazad na admin dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container admin__container">
      <header className="admin__head card">
        <div>
          <h1 className="admin__title">
            Ticket Types — {conf?.title} {conf?.acronym ? <span className="admin__acronym">({conf.acronym})</span> : null}
          </h1>
          <p className="admin__lead">
            Dodavanje, pregled i brisanje tipova karata za izabranu konferenciju.
          </p>
        </div>
        <div className="admin__tools">
          <Link to="/admin" className="btn btn--ghost">← Admin dashboard</Link>
        </div>
      </header>

      <section className="card admin__ticketsCard">
        <h2 className="admin__ticketsTitle">Postojeće karte</h2>
        {tickets.length ? (
          <ul className="admin__ticketList">
            {tickets.map((t) => (
              <li key={t.id} className="admin__ticketRow">
                <div className="admin__ticketMain">
                  <strong className="admin__ticketName">{t.name}</strong>
                  <span className="admin__ticketPrice">
                    {Number(t.price).toFixed(2)} {t.currency}
                  </span>
                </div>
                <div className="admin__ticketMeta">
                  {t.sales_start || t.sales_end ? (
                    <span>Prodaja: {fmtDate(t.sales_start)} – {fmtDate(t.sales_end)}</span>
                  ) : <span>Prodaja: —</span>}
                  {t.quota != null && <span> • Kvote: {t.quota}</span>}
                </div>
                <div className="admin__ticketActions">
                  <button className="btn btn--danger btn--small" onClick={() => removeTicket(t.id)}>Obriši</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="prof__empty">Nema karata.</div>
        )}
      </section>

      <section className="card admin__ticketsCard">
        <h2 className="admin__ticketsTitle">Dodaj novu kartu</h2>
        <form className="admin__ticketForm" onSubmit={addTicket}>
          <TextField label="Naziv karte" name="name" value={form.name} onChange={onChange} required />
          <TextField label="Cena" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required />
          <label className="field">
            <span className="field__label">Valuta</span>
            <select name="currency" className="field__input" value={form.currency} onChange={onChange}>
              <option value="EUR">EUR</option>
              <option value="RSD">RSD</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Prodaja od</span>
            <input type="date" name="sales_start" className="field__input" value={form.sales_start} onChange={onChange} />
          </label>
          <label className="field">
            <span className="field__label">Prodaja do</span>
            <input type="date" name="sales_end" className="field__input" value={form.sales_end} onChange={onChange} />
          </label>
          <TextField label="Kvote (opciono)" name="quota" type="number" min="0" value={form.quota} onChange={onChange} />

          <div className="admin__formActions">
            <Button type="submit" loading={saving} disabled={!canSubmit}>
              Dodaj kartu
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return String(d); }
}
