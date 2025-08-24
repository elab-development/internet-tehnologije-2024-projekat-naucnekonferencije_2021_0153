import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../css/conferences.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const CURRENCY_DEFAULT = "EUR";

export default function Konferencije() {
  const { isAuth } = useAuth();
  const [confs, setConfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // tickets panel state: conferenceId -> { loading, items: TicketType[] }
  const [tickets, setTickets] = useState({});
  const [reserved, setReserved] = useState({}); // conferenceId -> true

  const [q, setQ] = useState("");

  // sorting
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'title'
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  // --- NOVO: valutni prikaz (frontend-only konverzija) ---
  const [dispCurrency, setDispCurrency] = useState(
    localStorage.getItem("disp_currency") || CURRENCY_DEFAULT
  );
  const [rates, setRates] = useState(null);     // { EUR:1, USD:1.08, ... } bazirano na EUR
  const [symbols, setSymbols] = useState(null); // { USD: "US Dollar", ... }
  const [fxErr, setFxErr] = useState("");

  // učitaj konferencije
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/conferences");
        if (mounted) setConfs(res.data?.data || res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Greška pri učitavanju konferencija.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // učitaj valute i kurseve (bez ključa, browser-friendly)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [symsRes, ratesRes] = await Promise.all([
          fetch("https://api.frankfurter.dev/v1/currencies").then(r => r.json()),
          fetch("https://api.frankfurter.dev/v1/latest?base=EUR").then(r => r.json()),
        ]);
        if (!mounted) return;
        setSymbols(symsRes || {});
        const r = ratesRes?.rates || {};
        setRates({ EUR: 1, ...r }); // obezbedi EUR:1
      } catch {
        setFxErr("Nisam uspeo da preuzmem kurseve. Prikazujem izvorne cene.");
      }
    })();
    return () => { mounted = false; };
  }, []);

  // sačuvaj izbor valute
  useEffect(() => {
    localStorage.setItem("disp_currency", dispCurrency);
  }, [dispCurrency]);

  // filter + sort
  const view = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = !term
      ? [...confs]
      : confs.filter(c =>
          [c.title, c.acronym, c.location]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(term))
        );

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortBy === "title") {
        const na = (a.title || "").toLowerCase();
        const nb = (b.title || "").toLowerCase();
        if (na < nb) return -1 * dir;
        if (na > nb) return  1 * dir;
        return 0;
      } else {
        const da = a.start_date ? new Date(a.start_date).getTime() : (a.end_date ? new Date(a.end_date).getTime() : 0);
        const db = b.start_date ? new Date(b.start_date).getTime() : (b.end_date ? new Date(b.end_date).getTime() : 0);
        if (da < db) return -1 * dir;
        if (da > db) return  1 * dir;
        const na = (a.title || "").toLowerCase();
        const nb = (b.title || "").toLowerCase();
        if (na < nb) return -1 * dir;
        if (na > nb) return  1 * dir;
        return 0;
      }
    });

    return list;
  }, [q, confs, sortBy, sortDir]);

  const toggleTickets = async (confId) => {
    const state = tickets[confId];
    if (state?.items) {
      setTickets(prev => ({ ...prev, [confId]: { ...prev[confId], items: undefined } }));
      return;
    }
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
    try {
      await axios.post(`/conferences/${confId}/registrations`, {
        ticket_type_id: ticketTypeId,
        status: "pending",
      });
      setReserved(prev => ({ ...prev, [confId]: true }));
      alert("Rezervacija uspešna! (status: pending)");
    } catch (e) {
      const msg = e?.response?.data?.message || "Greška pri rezervaciji.";
      alert(msg);
    }
  };

  // --- KONVERZIJA ---
  const convert = (amount, from, to) => {
    if (amount == null || !from || !to || !rates) return null;
    const rFrom = rates[from] ?? (from === "EUR" ? 1 : null);
    const rTo   = rates[to]   ?? (to   === "EUR" ? 1 : null);
    if (!rFrom || !rTo) return null;
    return amount * (rTo / rFrom);
  };

  const formatIn = (amount, fromCur, toCur) => {
    const target = toCur || CURRENCY_DEFAULT;
    try {
      const val = convert(amount, fromCur || "EUR", target);
      const num = (val == null) ? amount : val;
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: target,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      const val = convert(amount, fromCur || "EUR", target) ?? amount;
      return `${val} ${target}`.trim();
    }
  };

  // dostupne valute za selektor (iz rates, da ne nudimo one koje nemamo)
  const currencyOptions = useMemo(() => {
    if (!rates) return [CURRENCY_DEFAULT];
    const keys = Object.keys(rates);
    // EUR uvek na vrhu
    return ["EUR", ...keys.filter(k => k !== "EUR").sort()];
  }, [rates]);

  return (
    <div className="container confs__page">
      <header className="confs__head card">
        <div>
          <h1 className="confs__title">Konferencije</h1>
          <p className="confs__lead">
            Pregledaj sve konferencije, pogledaj dostupne tipove karata i napravi rezervaciju.
          </p>
          {fxErr && <div className="alert alert--warn">{fxErr}</div>}
        </div>

        <div className="confs__tools">
          <input
            className="field__input confs__search"
            placeholder="Pretraga (naziv, akronim, lokacija)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="confs__sort">
            <select
              className="field__input confs__sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sortiraj po"
            >
              <option value="date">Po datumu</option>
              <option value="title">Po nazivu</option>
            </select>

            <select
              className="field__input confs__sortDir"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              aria-label="Smer sortiranja"
            >
              {sortBy === "title" ? (
                <>
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </>
              ) : (
                <>
                  <option value="asc">Najskorije prvo</option>
                  <option value="desc">Najdalje prvo</option>
                </>
              )}
            </select>
          </div>

          {/* NOVO: valuta prikaza */}
          <div className="confs__currencyWrap">
            <select
              className="field__input confs__currency"
              value={dispCurrency}
              onChange={(e) => setDispCurrency(e.target.value)}
              aria-label="Valuta prikaza"
              disabled={!rates}
              title={symbols?.[dispCurrency] ? symbols[dispCurrency] : dispCurrency}
            >
              {currencyOptions.map(code => (
                <option key={code} value={code}>
                  {code} {symbols?.[code] ? `– ${symbols[code]}` : ""}
                </option>
              ))}
            </select>
            {rates && (
              <small className="confs__currencyNote">
                Izvor kursa: ECB (Frankfurter)
              </small>
            )}
          </div>

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
        {view.map(conf => {
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
                      <span>• {fmtDate(conf.start_date)} – {fmtDate(conf.end_date)}</span>
                    )}
                  </div>
                </div>

                <div className="confs__headActions">
                  {reserved[conf.id] ? <span className="tag tag--ok">Rezervisano</span> : null}
                  <Link className="btn btn--primary" to={`/conferences/${conf.id}`}>Detalji</Link>
                  <button className="btn btn--ghost" onClick={() => toggleTickets(conf.id)}>
                    {isOpen ? "Sakrij karte" : "Prikaži karte"}
                  </button>
                </div>
              </div>

              {conf.description ? <p className="confs__desc">{conf.description}</p> : null}

              {tState.loading && <div className="confs__tickets">Učitavanje karata…</div>}
              {tState.error && <div className="alert alert--error">{tState.error}</div>}

              {tState.items && (
                <div className="confs__tickets">
                  {tState.items.length ? (
                    <div className="grid confs__ticketsGrid">
                      {tState.items.map(tt => {
                        const converted = rates ? convert(tt.price, tt.currency || "EUR", dispCurrency) : null;
                        const showConverted = rates && converted != null && (tt.currency || "EUR") !== dispCurrency;
                        return (
                          <div className="card ticket" key={tt.id}>
                            <div className="ticket__head">
                              <span className="ticket__name">{tt.name}</span>
                              <span className="ticket__price">
                                {showConverted
                                  ? (
                                      <>
                                        {formatIn(tt.price, tt.currency || "EUR", dispCurrency)}
                                        <small className="ticket__orig">
                                          {" "}
                                          ({formatMoney(tt.price, tt.currency || "EUR")})
                                        </small>
                                      </>
                                    )
                                  : formatMoney(tt.price, tt.currency || dispCurrency)}
                              </span>
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
                                onClick={() => reserve(conf.id, tt.id)}
                                disabled={!!reserved[conf.id]}
                              >
                                {reserved[conf.id] ? "Rezervisano" : "Rezerviši"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
  try { return new Date(d).toLocaleDateString(); } catch { return String(d); }
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
