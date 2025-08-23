import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../css/conf-details.css";
import { useAuth } from "../context/AuthContext";

export default function ConferenceDetails() {
  const { id } = useParams();
  const { isAuth, user } = useAuth();

  const [conf, setConf] = useState(null);
  const [program, setProgram] = useState([]);     // [{day, start, end, room, title, speaker}]
  const [tickets, setTickets] = useState([]);     // [{id, name, price, currency, sales_start, sales_end, quota}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 3 paralelna poziva
        const [c, p, t] = await Promise.all([
          axios.get(`/conferences/${id}`),
          axios.get(`/conferences/${id}/program`).catch(() => ({ data: [] })),      // BE može vratiti [] ili {data:[]}
          axios.get(`/conferences/${id}/ticket-types`).catch(() => ({ data: [] })),  // isto i ovde
        ]);
        if (!mounted) return;

        const confObj = c.data?.data || c.data;

        // Normalizacija programa — pokrivamo više mogućih struktura odgovora
        const rawProgram =
          Array.isArray(p.data) ? p.data :
          Array.isArray(p.data?.data) ? p.data.data :
          Array.isArray(p.data?.program) ? p.data.program :
          Array.isArray(p.data?.program_json) ? p.data.program_json :
          Array.isArray(confObj?.program_json) ? confObj.program_json :
          [];

        // Normalizacija tipova karata (nekad je paginate, nekad plain array)
        const ticketList =
          Array.isArray(t.data) ? t.data :
          Array.isArray(t.data?.data) ? t.data.data : [];

        setConf(confObj);
        setProgram(rawProgram);
        setTickets(ticketList);
      } catch (e) {
        setErr(e?.response?.data?.message || "Ne možemo da učitamo konferenciju.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const groupedProgram = useMemo(() => {
    if (!Array.isArray(program)) return {};
    return program.reduce((acc, s) => {
      const day = s.day || "N/A";
      (acc[day] ||= []).push(s);
      return acc;
    }, {});
  }, [program]);

  const reserve = async (ticketTypeId) => {
    if (!isAuth) return alert("Prijavite se da biste rezervisali kartu.");
    if (!user?.id) return alert("Nije pronađen ID korisnika.");

    setReserving(true);
    try {
      await axios.post(`/conferences/${id}/registrations`, {
        user_id: user.id,             // BE ga traži po tvojoj validaciji
        ticket_type_id: ticketTypeId, // opcionalno
        status: "pending",
      });
      setReserved(true);
      alert("Rezervacija uspešna! (status: pending)");
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri rezervaciji.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="container confd__container">Učitavanje…</div>;
  if (err) return <div className="container confd__container"><div className="alert alert--error">{err}</div></div>;
  if (!conf) return <div className="container confd__container">Konferencija nije pronađena.</div>;

  return (
    <div className="container confd__container">
      {/* HEAD */}
      <section className="card confd__head">
        <div className="confd__titleWrap">
          <h1 className="confd__title">
            {conf.title} {conf.acronym ? <span className="confd__acronym">({conf.acronym})</span> : null}
          </h1>
          <div className="confd__meta">
            {conf.status ? <span className="tag">{conf.status}</span> : null}
            {conf.location ? <span>• {conf.location}</span> : null}
            {(conf.start_date || conf.end_date) ? (
              <span>• {fmtDate(conf.start_date)} – {fmtDate(conf.end_date)}</span>
            ) : null}
          </div>
        </div>

        <div className="confd__headActions">
          <Link to="/conferences" className="btn btn--ghost">Nazad</Link>
        </div>
      </section>

      {/* DESCRIPTION */}
      {conf.description ? (
        <section className="card confd__section">
          <h2>Opis</h2>
          <p className="confd__desc">{conf.description}</p>
        </section>
      ) : null}

      {/* TICKETS */}
      <section className="card confd__section">
        <h2>Tipovi karata</h2>
        {tickets.length ? (
          <div className="grid confd__ticketsGrid">
            {tickets.map(tt => (
              <div className="card ticket" key={tt.id}>
                <div className="ticket__head">
                  <span className="ticket__name">{tt.name}</span>
                  <span className="ticket__price">{formatMoney(tt.price, tt.currency)}</span>
                </div>
                <div className="ticket__meta">
                  {(tt.sales_start || tt.sales_end) && (
                    <span>Prodaja: {fmtDate(tt.sales_start)} – {fmtDate(tt.sales_end)}</span>
                  )}
                  {tt.quota ? <span> • Kvote: {tt.quota}</span> : null}
                </div>
                <div className="ticket__actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => reserve(tt.id)}
                    disabled={reserving || reserved}
                  >
                    {reserved ? "Rezervisano" : reserving ? "Slanje..." : "Rezerviši"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prof__empty">Nema objavljenih tipova karata.</div>
        )}
      </section>

      {/* PROGRAM */}
      <section className="card confd__section">
        <h2>Program</h2>
        {Object.keys(groupedProgram).length ? (
          <div className="confd__program">
            {Object.entries(groupedProgram).map(([day, sessions]) => (
              <div key={day} className="confd__day">
                <div className="confd__dayHeader">
                  <span className="pill">{fmtDate(day)}</span>
                </div>
                <ul className="confd__list">
                  {sessions.map((s, i) => (
                    <li key={i} className="confd__slot">
                      <span className="pill">{s.start}–{s.end}</span>
                      <strong>{s.title}</strong>
                      {s.speaker ? <span> • {s.speaker}</span> : null}
                      {s.room ? <span> • {s.room}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="prof__empty">Program još nije objavljen.</div>
        )}
      </section>
    </div>
  );
}

/* ------- helpers ------- */
function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return String(d); }
}
function formatMoney(amount, currency) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "EUR" }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}
