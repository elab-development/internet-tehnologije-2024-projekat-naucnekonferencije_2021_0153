import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/profile.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profil() {
  const { isAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // mapa: submissionId -> { open, loading, err, items: [] }
  const [reviewsBySub, setReviewsBySub] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/auth/me");
        if (mounted) setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Ne možemo da učitamo profil.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleReviews = async (submissionId) => {
    setReviewsBySub((m) => {
      const cur = m[submissionId] || { open: false, loading: false, err: "", items: [] };
      // ako već otvoreno -> samo zatvori
      if (cur.open) return { ...m, [submissionId]: { ...cur, open: false } };
      // ako već imamo učitano -> samo otvori
      if (cur.items?.length) return { ...m, [submissionId]: { ...cur, open: true } };
      // inače kreni da učitavaš
      return { ...m, [submissionId]: { ...cur, open: true, loading: true, err: "" } };
    });

    // tek ako nemamo items, povuci sa API
    if (!(reviewsBySub[submissionId]?.items?.length)) {
      try {
        const res = await axios.get(`/submissions/${submissionId}/reviews`);
        setReviewsBySub((m) => ({
          ...m,
          [submissionId]: {
            open: true,
            loading: false,
            err: "",
            items: res.data || [],
          },
        }));
      } catch (e) {
        setReviewsBySub((m) => ({
          ...m,
          [submissionId]: {
            open: true,
            loading: false,
            items: [],
            err: e?.response?.data?.message || "Ne možemo da učitamo recenzije.",
          },
        }));
      }
    }
  };

  if (!isAuth) {
    return (
      <div className="container prof__container">
        <div className="card prof__card">
          <h2>Profil</h2>
          <p>Morate biti prijavljeni da biste videli svoj profil.</p>
          <Link className="btn btn--primary" to="/login">Prijava</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container prof__container">Učitavanje…</div>;
  if (err) return <div className="container prof__container"><div className="alert alert--error">{err}</div></div>;

  const { user, stats } = data || {};
  return (
    <div className="container prof__container">
      {/* Glava profila */}
      <section className="card prof__header">
        <div className="prof__avatar" aria-hidden="true">{(user?.name || "?").slice(0,1)}</div>
        <div className="prof__info">
          <h1 className="prof__name">{user?.name}</h1>
          <div className="prof__meta">
            <span className="tag">{user?.role}</span>
            <span>{user?.email}</span>
            {user?.affiliation ? <span>• {user.affiliation}</span> : null}
            {user?.orcid ? <span>• ORCID: {user.orcid}</span> : null}
          </div>
        </div>
      </section>

      {/* Stat kartice */}
      <section className="grid prof__stats">
        <StatCard label="Registracije" value={stats?.registrations_count} />
        <StatCard label="Moji radovi (autor)" value={stats?.authored_submissions_count} />
        <StatCard label="Korespondent" value={stats?.corresponding_count} />
        <StatCard label="Dodele za recenziju" value={stats?.assignments_count} />
        <StatCard label="Predate recenzije" value={stats?.reviews_count} />
      </section>

      {/* Registracije */}
      <Section title="Moje registracije">
        <div className="grid prof__list">
          {user?.registrations?.length ? user.registrations.map((r) => (
            <div className="card prof__item" key={r.id}>
              <h3 className="prof__itemTitle">{r.conference?.title || "Konferencija"}</h3>
              <div className="prof__itemMeta">
                <span className="tag">{r.status}</span>
                {r.ticket_type?.name ? <span>• {r.ticket_type.name}</span> : null}
                {r.conference?.location ? <span>• {r.conference.location}</span> : null}
              </div>
              <div className="prof__actions">
                <Link to={`/conferences/${r.conference_id}`} className="btn btn--ghost">Detalji</Link>
              </div>
            </div>
          )) : <Empty text="Nema registracija." />}
        </div>
      </Section>

      {/* Submissions gde je autor */}
      <Section title="Moji radovi (kao autor)">
        <div className="grid prof__list">
          {user?.authored_submissions?.length ? user.authored_submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              s={s}
              reviewsState={reviewsBySub[s.id]}
              onToggleReviews={() => toggleReviews(s.id)}
            />
          )) : <Empty text="Nema radova." />}
        </div>
      </Section>

      {/* Submissions gde je korespondentni autor */}
      <Section title="Moji radovi (korespondent)">
        <div className="grid prof__list">
          {user?.corresponding_submissions?.length ? user.corresponding_submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              s={s}
              reviewsState={reviewsBySub[s.id]}
              onToggleReviews={() => toggleReviews(s.id)}
            />
          )) : <Empty text="Nema radova." />}
        </div>
      </Section>
    </div>
  );
}

function SubmissionCard({ s, reviewsState, onToggleReviews }) {
  return (
    <div className="card prof__item">
      <h3 className="prof__itemTitle">{s.title}</h3>
      <div className="prof__itemMeta">
        <span className="tag">{s.status}</span>
        <span>• {shortTarget(s.submitable_type, s.submitable)}</span>
      </div>
      <div className="prof__actions">
        {s.manuscript_path ? (
          <a
            href={s.manuscript_path}
            className="btn btn--ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Otvori PDF
          </a>
        ) : (
          <span className="prof__empty">Nema fajla</span>
        )}
        <button className="btn btn--primary" onClick={onToggleReviews}>
          {reviewsState?.open ? "Sakrij recenzije" : "Prikaži recenzije"}
        </button>
      </div>

      {reviewsState?.open && (
        <div className="prof__reviews">
          {reviewsState.loading && <div>Učitavanje recenzija…</div>}
          {reviewsState.err && <div className="alert alert--error">{reviewsState.err}</div>}
          {!reviewsState.loading && !reviewsState.err && (
            reviewsState.items?.length ? (
              <ul className="prof__reviewsList">
                {reviewsState.items.map((rv) => (
                  <li key={rv.id} className="prof__reviewItem">
                    <div className="prof__reviewHead">
                      <strong>{rv.reviewer?.name || "Recenzent"}</strong>
                      {rv.submitted_at ? (
                        <span className="prof__reviewDate">
                          • {new Date(rv.submitted_at).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    <div className="prof__reviewMeta">
                      {rv.recommendation ? <span className="tag">{rv.recommendation}</span> : null}
                      {typeof rv.score_overall === "number" ? <span>• score: {rv.score_overall}</span> : null}
                    </div>
                    {rv.comments_to_authors ? (
                      <p className="prof__reviewText">{rv.comments_to_authors}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <em className="prof__empty">Još uvek nema recenzija.</em>
            )
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="prof__section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card prof__stat">
      <div className="prof__statValue">{value ?? 0}</div>
      <div className="prof__statLabel">{label}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="prof__empty">{text}</div>;
}

function shortTarget(type, obj) {
  if (!type) return "N/A";
  const t = type.split("\\").pop();
  if (t === "Conference") return `Konferencija: ${obj?.title || "—"}`;
  if (t === "Issue") return `Issue #${obj?.id || "—"}`;
  return t;
}
