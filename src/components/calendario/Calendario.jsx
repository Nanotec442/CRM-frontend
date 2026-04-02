import { reservasService } from "../../services/reservasService";
import { useState, useMemo, useEffect } from "react";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const hoy = new Date();

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function fmtHora(date) {
  return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}
function fmtFecha(date) {
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}
function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = 0; i < startDow; i++) {
    days.push({ date: new Date(year, month, -startDow + i + 1), outside: true });
  }
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) days.push({ date: new Date(year, month, i), outside: false });
  while (days.length % 7 !== 0) {
    const next = new Date(days[days.length - 1].date);
    next.setDate(next.getDate() + 1);
    days.push({ date: next, outside: true });
  }
  return days;
}

// ── EventCard ──────────────────────────────────────────────────────────────
function EventCard({ ev }) {
  const [hovered, setHovered] = useState(false);
  const partes = ev.title.split(" – ");
  const cliente = partes[0] ?? ev.title;
  const hora = fmtHora(ev.start);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: hovered ? "#2563eb" : "#3b82f6",
        borderRadius: 6,
        padding: "3px 7px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.15s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: hovered
          ? "0 3px 10px rgba(59,130,246,0.35)"
          : "0 1px 3px rgba(59,130,246,0.15)",
      }}
    >
      <div style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.6)", flexShrink:0 }} />
      <span style={{ fontSize:10, color:"rgba(255,255,255,0.85)", fontWeight:500, flexShrink:0, letterSpacing:"0.01em" }}>
        {hora}
      </span>
      <span style={{ fontSize:11, color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
        {cliente}
      </span>
    </div>
  );
}

// ── Vista Mes ──────────────────────────────────────────────────────────────
function VistaMes({ year, month, eventos }) {
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign:"center", padding:"10px 0", fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", letterSpacing:"0.05em", textTransform:"uppercase" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
        {days.map(({ date, outside }, i) => {
          const evs = eventos.filter(e => isSameDay(e.start, date));
          const esHoy = isSameDay(date, hoy);
          return (
            <div
              key={i}
              style={{ minHeight:100, borderRight:"0.5px solid var(--color-border-tertiary)", borderBottom:"0.5px solid var(--color-border-tertiary)", padding:"6px 5px 5px", background:"transparent", transition:"background 0.15s" }}
              onMouseEnter={e => { if (!outside) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display:"flex", justifyContent:"center", marginBottom:5 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:esHoy?700:400, background:esHoy?"#1e293b":"transparent", color:esHoy?"#fff":outside?"#cbd5e1":"#334155", boxShadow:esHoy?"0 2px 8px rgba(30,41,59,0.18)":"none", transition:"all 0.15s" }}>
                  {date.getDate()}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {evs.slice(0,2).map((ev, j) => (
                  <EventCard key={j} ev={ev} />
                ))}
                {evs.length > 2 && (
                  <div style={{ fontSize:10, fontWeight:500, color:"#64748b", padding:"1px 5px", textAlign:"center", letterSpacing:"0.02em" }}>
                    +{evs.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vista Agenda ───────────────────────────────────────────────────────────
function VistaAgenda({ year, month, eventos }) {
  const evs = useMemo(() =>
    eventos
      .filter(e => e.start.getFullYear() === year && e.start.getMonth() === month)
      .sort((a, b) => a.start - b.start),
    [eventos, year, month]
  );

  if (evs.length === 0) {
    return (
      <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--color-text-secondary)", fontSize:14 }}>
        No hay reservas en este mes
      </div>
    );
  }

  return (
    <div style={{ padding:"12px 0" }}>
      {evs.map((ev, i) => (
        <div key={i}
          style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 18px", borderBottom:"0.5px solid var(--color-border-tertiary)", transition:"background 0.1s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ width:86, flexShrink:0, fontSize:13, color:"var(--color-text-secondary)" }}>{fmtFecha(ev.start)}</div>
          <div style={{ width:4, alignSelf:"stretch", background:"#3b82f6", borderRadius:2, flexShrink:0 }} />
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</div>
            <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{fmtHora(ev.start)} – {fmtHora(ev.end)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
const VIEWS = [
  { key:"month",  label:"Mes" },
  { key:"agenda", label:"Agenda" },
];

export default function Calendario() {
  const [view, setView]         = useState("month");
  const [current, setCurrent]   = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const year  = current.getFullYear();
  const month = current.getMonth();

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reservasService.listar();
        setReservas(data ?? []);
      } catch (err) {
        console.error("Error cargando reservas:", err);
        setError("No se pudieron cargar las reservas.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const eventos = useMemo(() =>
    reservas.map(r => ({
      title: `${r.cliente?.nombre_completo || "Sin cliente"} – ${r.activo?.nombre || "Activo"}`,
      start: new Date(r.fecha_inicio),
      end:   new Date(r.fecha_fin),
      raw:   r,
    })),
    [reservas]
  );

  const goHoy = () => setCurrent(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const prev  = () => setCurrent(new Date(year, month - 1, 1));
  const next  = () => setCurrent(new Date(year, month + 1, 1));

  const headerLabel = `${MESES[month]} ${year}`;

  return (
    <div style={{ padding:"24px", fontFamily:"var(--font-sans, sans-serif)", background:"#f1f5f9", minHeight:"100vh" }}>
      <div style={{ background:"#ffffff", borderRadius:18, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.08)" }}>

        {/* Toolbar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid #e2e8f0", background:"#f8fafc", flexWrap:"wrap" }}>
          <button onClick={goHoy} style={btnOutline}>Hoy</button>
          <button onClick={prev}  style={{ ...btnOutline, padding:"5px 10px" }}>‹</button>
          <button onClick={next}  style={{ ...btnOutline, padding:"5px 10px" }}>›</button>
          <span style={{ flex:1, fontWeight:500, fontSize:15, color:"var(--color-text-primary)", marginLeft:4 }}>{headerLabel}</span>
          <div style={{ display:"flex", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, overflow:"hidden" }}>
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{ padding:"5px 14px", border:"none", cursor:"pointer", fontSize:13, background:view===v.key?"#1e293b":"transparent", color:view===v.key?"#fff":"var(--color-text-secondary)", transition:"all 0.15s", borderRight:"0.5px solid var(--color-border-tertiary)" }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--color-text-secondary)", fontSize:14 }}>
            Cargando reservas…
          </div>
        )}
        {!loading && error && (
          <div style={{ padding:"32px 24px", textAlign:"center", color:"#ef4444", fontSize:14 }}>{error}</div>
        )}

        {/* Contenido */}
        {!loading && !error && view === "month"  && <VistaMes   year={year} month={month} eventos={eventos} />}
        {!loading && !error && view === "agenda" && <VistaAgenda year={year} month={month} eventos={eventos} />}
      </div>
    </div>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const btnOutline = {
  padding: "6px 14px",
  background: "#f8fafc",
  color: "#334155",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  transition: "all 0.2s",
};