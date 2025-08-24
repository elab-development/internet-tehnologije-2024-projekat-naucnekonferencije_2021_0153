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

      {/* Registracije (kupovine karata) */}
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
      <div className="card prof__item" key={s.id}>
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
              Otvori
            </a>
          ) : (
            <span className="prof__empty">Nema fajla</span>
          )}
        </div>
      </div>
    )) : <Empty text="Nema radova." />}
  </div>
</Section>

{/* Submissions gde je korespondentni autor */}
<Section title="Moji radovi (korespondent)">
  <div className="grid prof__list">
    {user?.corresponding_submissions?.length ? user.corresponding_submissions.map((s) => (
      <div className="card prof__item" key={s.id}>
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
              Otvori
            </a>
          ) : (
            <span className="prof__empty">Nema fajla</span>
          )}
        </div>
      </div>
    )) : <Empty text="Nema radova." />}
  </div>
</Section>


      {/* Assignmenti (recenzent) */}
      <Section title="Dodele za recenziju">
        <div className="grid prof__list">
          {user?.reviewer_assignments?.length ? user.reviewer_assignments.map((a) => (
            <div className="card prof__item" key={a.id}>
              <h3 className="prof__itemTitle">{a.submission?.title || "Submission"}</h3>
              <div className="prof__itemMeta">
                {a.accepted_at ? <span className="tag">accepted</span> : a.declined_at ? <span className="tag">declined</span> : <span className="tag">invited</span>}
                {a.due_at ? <span>• Rok: {new Date(a.due_at).toLocaleDateString()}</span> : null}
              </div>
              <div className="prof__actions">
                <Link to={`/submissions/${a.submission_id}`} className="btn btn--ghost">Detalji</Link>
              </div>
            </div>
          )) : <Empty text="Nema dodela." />}
        </div>
      </Section>

      {/* Reviews */}
      <Section title="Moje recenzije">
        <div className="grid prof__list">
          {user?.reviews?.length ? user.reviews.map((r) => (
            <div className="card prof__item" key={r.id}>
              <h3 className="prof__itemTitle">{r.submission?.title || "Submission"}</h3>
              <div className="prof__itemMeta">
                <span className="tag">{r.recommendation || "n/a"}</span>
                {typeof r.score_overall === "number" ? <span>• Score: {r.score_overall}</span> : null}
                {r.submitted_at ? <span>• {new Date(r.submitted_at).toLocaleDateString()}</span> : null}
              </div>
              <div className="prof__actions">
                <Link to={`/reviews/${r.id}`} className="btn btn--ghost">Otvori</Link>
              </div>
            </div>
          )) : <Empty text="Nema recenzija." />}
        </div>
      </Section>
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
  const t = type.split("\\").pop(); // 'App\Models\Conference' -> 'Conference'
  if (t === "Conference") return `Konferencija: ${obj?.title || "—"}`;
  if (t === "Issue") return `Issue #${obj?.id || "—"}`;
  return t;
}
