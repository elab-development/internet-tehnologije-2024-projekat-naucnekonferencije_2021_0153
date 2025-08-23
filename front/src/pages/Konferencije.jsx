import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../css/conferences.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Konferencije() {
  const { isAuth } = useAuth();
  const [confs, setConfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // mapa: conferenceId -> { loading, items: TicketType[] }
  const [tickets, setTickets] = useState({});
  // lokalno pratimo rezervacije koje smo upravo napravili (da prikažemo "Rezervisano")
  const [reserved, setReserved] = useState({}); // { [conferenceId]: true }

  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/conferences");
        if (mounted) setConfs(res.data?.data || res.data || []); // u zavisnosti od resource odgovora
      } catch (e) {
        setErr(e?.response?.data?.message || "Greška pri učitavanju konferencija.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return confs;
    return confs.filter(c =>
      [c.title, c.acronym, c.location].filter(Boolean).some(v => String(v).toLowerCase().includes(term))
    );
  }, [q, confs]);

  const toggleTickets = async (confId) => {
    const state = tickets[confId];
    if (state?.items) {
      // collapse / clear items da ne gomilamo
      setTickets(prev => ({ ...prev, [confId]: { ...prev[confId], items: undefined } }));
      return;
    }
    // load
    setTickets(prev => ({ ...prev, [confId]: { loading: true, items: undefined } }));
    try {
      const res = await axios.get(`/conferences/${confId}/ticket-types`);
      setTickets(prev => ({ ...prev, [confId]: { loading: false, items: res.data } }));
    } catch (e) {
      setTickets(prev => ({ ...prev, [confId]: { loading: false, items: [], error: "Nema dostupnih karata ili greška." } }));
    }
  };

  const reserve = async (confId, ticketTypeId) => {
    if (!isAuth) {
      alert("Morate biti prijavljeni da biste napravili rezervaciju.");
      return;
    }
    // opciono: ovde možeš slati i dodatna polja (npr. status='pending')
    try {
      await axios.post(`/conferences/${confId}/registrations`, {
        ticket_type_id: ticketTypeId,
        status: "pending",
      });
      // jednostavan UX feedback
      setReserved(prev => ({ ...prev, [confId]: true }));
      alert("Rezervacija uspešna! (status: pending)");
    } catch (e) {
      const msg = e?.response?.data?.message || "Greška pri rezervaciji.";
      alert(msg);
    }
  };

  return (
    <div className="container confs__page">
      <header className="confs__head card">
        <div>
          <h1 className="confs__title">Konferencije</h1>
          <p className="confs__lead">
            Pregledaj sve konferencije, pogledaj dostupne tipove karata i napravi rezervaciju.
          </p>
        </div>

        <div className="confs__tools">
          <input
            className="field__input confs__search"
            placeholder="Pretraga (naziv, akronim, lokacija)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {!isAuth ? (
            <Link className="btn btn--accent" to="/login">Prijava</Link>
          ) : (
            <Link className="btn btn--ghost" to="/profile">Moj profil</Link>
          )}
        </div>
      </header>

      {loading && <div>Učitavanje…</div>}
      {err && <div className="alert alert--error">{err}</div>}

      <section className="grid confs__grid">
        {filtered.map(conf => {
          const tState = tickets[conf.id] || {};
          const isOpen = !!tState.items;
          return (
            <article className="card confs__item" key={conf.id}>
              <div className="confs__itemHead">
                <div className="confs__titleWrap">
                  <h3 className="confs__itemTitle">
                    {conf.title} {conf.acronym ? <span className="confs__acronym">({conf.acronym})</span> : null}
                  </h3>
                  <div className="confs__meta">
                    {conf.status ? <span className="tag">{conf.status}</span> : null}
                    {conf.location ? <span>• {conf.location}</span> : null}
                    {(conf.start_date || conf.end_date) && (
                      <span>
                        • {fmtDate(conf.start_date)} – {fmtDate(conf.end_date)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="confs__headActions">
                  {reserved[conf.id] ? (
                    <span className="tag tag--ok">Rezervisano</span>
                  ) : null}
                  <button className="btn btn--ghost" onClick={() => toggleTickets(conf.id)}>
                    {isOpen ? "Sakrij karte" : "Prikaži karte"}
                  </button>
                </div>
              </div>

              {conf.description ? <p className="confs__desc">{conf.description}</p> : null}

              {/* Ticket panel */}
              {tState.loading && <div className="confs__tickets">Učitavanje karata…</div>}
              {tState.error && <div className="alert alert--error">{tState.error}</div>}

              {tState.items && (
                <div className="confs__tickets">
                  {tState.items.length ? (
                    <div className="grid confs__ticketsGrid">
                      {tState.items.map(tt => (
                        <div className="card ticket" key={tt.id}>
                          <div className="ticket__head">
                            <span className="ticket__name">{tt.name}</span>
                            <span className="ticket__price">{formatMoney(tt.price, tt.currency)}</span>
                          </div>
                          <div className="ticket__meta">
                            {tt.sales_start || tt.sales_end ? (
                              <span>
                                Prodaja: {fmtDate(tt.sales_start)} – {fmtDate(tt.sales_end)}
                              </span>
                            ) : null}
                            {tt.quota ? <span> • Kvote: {tt.quota}</span> : null}
                          </div>
                          <div className="ticket__actions">
                            <button
                              className="btn btn--primary"
                              onClick={() => reserve(conf.id, tt.id)}
                              disabled={!!reserved[conf.id]}
                            >
                              {reserved[conf.id] ? "Rezervisano" : "Rezerviši"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="prof__empty">Nema dostupnih tipova karata.</div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return String(d);
  }
}
function formatMoney(amount, currency) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}
