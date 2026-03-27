import { useState, useMemo } from "react";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

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
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1);
    days.push({ date: d, outside: true });
  }
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    days.push({ date: next, outside: true });
  }
  return days;
}

function getWeekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ slot, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [desde, setDesde] = useState(
    slot ? `${String(slot.start.getHours()).padStart(2, "0")}:${String(slot.start.getMinutes()).padStart(2, "0")}` : "09:00"
  );
  const [hasta, setHasta] = useState(
    slot ? `${String(slot.end.getHours()).padStart(2, "0")}:${String(slot.end.getMinutes()).padStart(2, "0")}` : "10:00"
  );

  const handleSave = () => {
    if (!title.trim()) return;
    const [dh, dm] = desde.split(":").map(Number);
    const [hh, hm] = hasta.split(":").map(Number);
    const start = new Date(slot.date);
    start.setHours(dh, dm, 0, 0);
    const end = new Date(slot.date);
    end.setHours(hh, hm, 0, 0);
    onSave({ title: title.trim(), start, end });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 12, padding: "24px 28px", width: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)" }}>Nueva reserva — {slot && fmtFecha(slot.date)}</h3>
        <label style={lbl}>Nombre</label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="Nombre de la reserva"
          style={{ ...inp, marginBottom: 14 }}
        />
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Desde</label>
            <input type="time" value={desde} onChange={e => setDesde(e.target.value)} style={inp} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Hasta</label>
            <input type="time" value={hasta} onChange={e => setHasta(e.target.value)} style={inp} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSecondary}>Cancelar</button>
          <button onClick={handleSave} style={btnPrimary}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── Vista Mes ─────────────────────────────────────────────────────────────
function VistasMes({ year, month, eventos, onSelectDay }) {
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {days.map(({ date, outside }, i) => {
          const evs = eventos.filter(e => isSameDay(e.start, date));
          const esHoy = isSameDay(date, hoy);
          return (
            <div
              key={i}
              onClick={() => !outside && onSelectDay(date)}
              style={{
                minHeight: 90,
                borderRight: "0.5px solid var(--color-border-tertiary)",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                padding: "6px 6px 4px",
                cursor: outside ? "default" : "pointer",
                background: "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!outside) e.currentTarget.style.background = "var(--color-background-secondary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "ffffff"; }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: esHoy ? 500 : 400,
                background: esHoy ? "#1e293b" : "transparent",
                color: esHoy ? "#fff" : outside ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                marginBottom: 4,
              }}>{date.getDate()}</div>
              {evs.slice(0, 2).map((ev, j) => (
                <div key={j} style={{ background: "#3b82f6", color: "#fff", borderRadius: 4, fontSize: 11, padding: "2px 5px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {fmtHora(ev.start)} {ev.title}
                </div>
              ))}
              {evs.length > 2 && <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>+{evs.length - 2} más</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vista Semana / Día ────────────────────────────────────────────────────
function VistaSemana({ days, eventos, onSelectSlot }) {
  const colW = `${100 / days.length}%`;
  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "auto", maxHeight: 560 }}>
      {/* header */}
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", position: "sticky", top: 0, background: "var(--color-background-primary)", zIndex: 10 }}>
        <div style={{ width: 52 }} />
        {days.map((d, i) => {
          const es = isSameDay(d, hoy);
          return (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderLeft: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 400 }}>{DIAS[(d.getDay() + 6) % 7]}</div>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", margin: "2px auto 0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 500,
                background: es ? "#1e293b" : "transparent",
                color: es ? "#fff" : "var(--color-text-primary)",
              }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      {/* body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* horas */}
        <div style={{ width: 52, flexShrink: 0 }}>
          {HOURS.map(h => (
            <div key={h} style={{ height: 48, borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "right", paddingRight: 6, paddingTop: 2 }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {/* columnas */}
        {days.map((day, di) => {
          const evs = eventos.filter(e => isSameDay(e.start, day));
          return (
            <div key={di} style={{ flex: 1, borderLeft: "0.5px solid var(--color-border-tertiary)", position: "relative" }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  style={{ height: 48, borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
                  onClick={() => {
                    const start = new Date(day); start.setHours(h, 0, 0, 0);
                    const end = new Date(day); end.setHours(h + 1, 0, 0, 0);
                    onSelectSlot({ date: day, start, end });
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                />
              ))}
              {evs.map((ev, ei) => {
                const startMin = ev.start.getHours() * 60 + ev.start.getMinutes();
                const endMin = ev.end.getHours() * 60 + ev.end.getMinutes();
                const top = (startMin / 60) * 48;
                const height = Math.max(((endMin - startMin) / 60) * 48, 20);
                return (
                  <div key={ei} style={{
                    position: "absolute", top, left: 2, right: 2, height,
                    background: "#3b82f6", color: "#fff", borderRadius: 4,
                    fontSize: 11, padding: "2px 5px", overflow: "hidden", zIndex: 2,
                  }}>
                    {fmtHora(ev.start)} {ev.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vista Agenda ──────────────────────────────────────────────────────────
function VistaAgenda({ year, month, eventos }) {
  const evs = eventos
    .filter(e => e.start.getFullYear() === year && e.start.getMonth() === month)
    .sort((a, b) => a.start - b.start);

  if (evs.length === 0) {
    return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>No hay reservas en este mes</div>;
  }

  return (
    <div style={{ padding: "12px 0" }}>
      {evs.map((ev, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ width: 80, flexShrink: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{fmtFecha(ev.start)}</div>
          <div style={{ width: 4, height: 32, background: "#3b82f6", borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{ev.title}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{fmtHora(ev.start)} – {fmtHora(ev.end)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function Calendario() {
  const [view, setView] = useState("month");
  const [current, setCurrent] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [eventos, setEventos] = useState([
    { title: "Reserva Daniel", start: new Date(2026, 2, 26, 14, 0), end: new Date(2026, 2, 26, 15, 0) },
  ]);
  const [modalSlot, setModalSlot] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();

  const goHoy = () => {
    setCurrent(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    if (view === "day") setDayRef(new Date(hoy));
  };

  const prev = () => {
    if (view === "month") setCurrent(new Date(year, month - 1, 1));
    else if (view === "week") {
      const d = new Date(weekRef); d.setDate(d.getDate() - 7);
      setWeekRef(d); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (view === "day") {
      const d = new Date(dayRef); d.setDate(d.getDate() - 1);
      setDayRef(d); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setCurrent(new Date(year, month - 1, 1));
    }
  };

  const next = () => {
    if (view === "month") setCurrent(new Date(year, month + 1, 1));
    else if (view === "week") {
      const d = new Date(weekRef); d.setDate(d.getDate() + 7);
      setWeekRef(d); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (view === "day") {
      const d = new Date(dayRef); d.setDate(d.getDate() + 1);
      setDayRef(d); setCurrent(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setCurrent(new Date(year, month + 1, 1));
    }
  };

  const [weekRef, setWeekRef] = useState(startOfWeek(hoy));
  const [dayRef, setDayRef] = useState(new Date(hoy));

  const weekDays = useMemo(() => getWeekDays(weekRef), [weekRef]);

  const headerLabel = () => {
    if (view === "month" || view === "agenda") return `${MESES[month]} ${year}`;
    if (view === "week") {
      const ws = weekDays[0], we = weekDays[6];
      if (ws.getMonth() === we.getMonth()) return `${ws.getDate()}–${we.getDate()} ${MESES[ws.getMonth()]} ${ws.getFullYear()}`;
      return `${ws.getDate()} ${MESES[ws.getMonth()]} – ${we.getDate()} ${MESES[we.getMonth()]} ${we.getFullYear()}`;
    }
    if (view === "day") return `${dayRef.getDate()} de ${MESES[dayRef.getMonth()]} de ${dayRef.getFullYear()}`;
    return "";
  };

  const openModal = (slot) => setModalSlot(slot);

  const handleSave = ({ title, start, end }) => {
    setEventos(prev => [...prev, { title, start, end }]);
    setModalSlot(null);
  };

  const handleSelectDay = (date) => {
    setDayRef(date);
    setView("day");
  };

  const VIEWS = [
    { key: "month", label: "Mes" },
    { key: "week", label: "Semana" },
    { key: "day", label: "Día" },
    { key: "agenda", label: "Agenda" },
  ];

  return (
    <div style={{
      padding: "24px",
      fontFamily: "var(--font-sans, sans-serif)",
      background: "#f1f5f9",
      minHeight: "100vh"
    }}>
      <h1 style={{
        fontSize: 22,
        fontWeight: 500,
        margin: "0 0 20px",
        color: "var(--color-text-primary)"
      }}>Calendario</h1>

      <div style={{
        background: "#ffffff",
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}>

        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
          flexWrap: "wrap"
        }}>

          <button onClick={goHoy} style={btnOutline}>Hoy</button>
          <button onClick={prev} style={{ ...btnOutline, padding: "5px 10px" }}>‹</button>
          <button onClick={next} style={{ ...btnOutline, padding: "5px 10px" }}>›</button>
          <span style={{ flex: 1, fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)", marginLeft: 4 }}>{headerLabel()}</span>
          <div style={{ display: "flex", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
            {VIEWS.map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                style={{
                  padding: "5px 14px", border: "none", cursor: "pointer", fontSize: 13,
                  background: view === v.key ? "#1e293b" : "transparent",
                  color: view === v.key ? "#fff" : "var(--color-text-secondary)",
                  transition: "all 0.15s",
                  borderRight: "0.5px solid var(--color-border-tertiary)",
                }}
              >{v.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        {view === "month" && (
          <VistasMes year={year} month={month} eventos={eventos}
            onSelectDay={handleSelectDay}
          />
        )}
        {view === "week" && (
          <VistaSemana days={weekDays} eventos={eventos}
            onSelectSlot={(slot) => openModal(slot)}
          />
        )}
        {view === "day" && (
          <VistaSemana days={[dayRef]} eventos={eventos}
            onSelectSlot={(slot) => openModal(slot)}
          />
        )}
        {view === "agenda" && (
          <VistaAgenda year={year} month={month} eventos={eventos} />
        )}
      </div>

      {modalSlot && (
        <Modal slot={modalSlot} onSave={handleSave} onClose={() => setModalSlot(null)} />
      )}
    </div>
  );
}

// ── Estilos helpers ───────────────────────────────────────────────────────
const lbl = {
  display: "block",
  fontSize: 12,
  color: "var(--color-text-secondary)",
  marginBottom: 4,
  fontWeight: 400
};

const inp = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "7px 10px",
  border: "0.5px solid var(--color-border-secondary)",
  borderRadius: 8,
  fontSize: 14,
  background: "#f8fafc",
  color: "var(--color-text-primary)",
  outline: "none"
};

const btnPrimary = {
  padding: "7px 18px",
  background: "#2563eb", // azul pro
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500
};

const btnSecondary = {
  padding: "7px 18px",
  background: "#f8fafc",
  color: "var(--color-text-secondary)",
  border: "0.5px solid var(--color-border-secondary)",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14
};
const btnOutline = {
  padding: "6px 14px",
  background: "#f8fafc",
  color: "#334155",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  transition: "all 0.2s"
};