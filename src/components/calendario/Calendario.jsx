import { useState, useMemo, useEffect } from "react";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const hoy = new Date();

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtHora(date) {
  return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function fmtFecha(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function getDaysInMonth(year, month) {
  const days = [];
  const first = new Date(year, month, 1);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = 0; i < startDow; i++) {
    days.push({ date: new Date(year, month, -startDow + i + 1), outside: true });
  }
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
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
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 cursor-pointer overflow-hidden transition-all duration-150 ease-in-out ${
        hovered ? "bg-blue-600 scale-[1.02] shadow-md shadow-blue-500/30" : "bg-blue-500 shadow-sm shadow-blue-500/15"
      }`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
      <span className="text-[10px] text-white/85 font-medium shrink-0 tracking-wide">
        {hora}
      </span>
      <span className="text-[11px] text-white font-medium truncate flex-1">
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
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DIAS.map((d) => (
          <div key={d} className="text-center py-2.5 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(({ date, outside }, i) => {
          const evs = eventos.filter((e) => isSameDay(e.start, date));
          const esHoy = isSameDay(date, hoy);
          return (
            <div
              key={i}
              className={`min-h-[100px] border-r border-b border-gray-200 p-1.5 transition-colors duration-150 ${
                outside ? "bg-gray-50/50" : "hover:bg-slate-50 bg-white"
              }`}
            >
              <div className="flex justify-center mb-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                    esHoy
                      ? "bg-slate-800 text-white font-bold shadow-md"
                      : outside
                      ? "text-gray-400 font-normal"
                      : "text-slate-700 font-normal"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {evs.slice(0, 2).map((ev, j) => (
                  <EventCard key={j} ev={ev} />
                ))}
                {evs.length > 2 && (
                  <div className="text-[10px] font-medium text-slate-500 px-1 text-center tracking-wide">
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
  // Filtramos y ordenamos los eventos del mes
  const evs = useMemo(
    () =>
      eventos
        .filter((e) => e.start.getFullYear() === year && e.start.getMonth() === month)
        .sort((a, b) => a.start - b.start),
    [eventos, year, month]
  );

  // Agrupamos los eventos por fecha para que no se repita el día en cada fila
  const eventosAgrupados = useMemo(() => {
    const grupos = {};
    evs.forEach(ev => {
      // Formateamos: "Lunes, 15 de Abril"
      const fechaStr = ev.start.toLocaleDateString("es-CL", { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      if (!grupos[fechaStr]) grupos[fechaStr] = [];
      grupos[fechaStr].push(ev);
    });
    return grupos;
  }, [evs]);

  if (evs.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-slate-500 font-medium">No hay reservas agendadas en este mes.</p>
      </div>
    );
  }

  return (
    <div className="py-4 px-6 max-h-500 overflow-y-auto">
      {Object.entries(eventosAgrupados).map(([fecha, eventosDelDia], index) => (
        <div key={index} className="mb-6 last:mb-2">
          
          {/* Encabezado del Día (Pegajoso / Sticky) */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 border-b border-gray-100 mb-3">
            <h3 className="text-sm font-bold text-slate-700 capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
              {fecha}
            </h3>
          </div>

          {/* Lista de eventos tipo Timeline */}
          <div className="flex flex-col gap-3 pl-3 border-l-2 border-gray-100 ml-1">
            {eventosDelDia.map((ev, i) => {
              // Obtenemos el estado directo del dato original para colorear el borde
              const estado = ev.raw?.estado?.toLowerCase() || 'pendiente';
              const colorBorde = 
                estado === 'confirmada' ? 'border-green-500' : 
                estado === 'cancelada' ? 'border-red-500' : 'border-amber-500';

              return (
                <div
                  key={i}
                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${colorBorde} group cursor-pointer`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-semibold text-slate-800 truncate">
                      {ev.title}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      🕒 {fmtHora(ev.start)} – {fmtHora(ev.end)}
                    </span>
                  </div>
                  
                  {/* Badge de Estado */}
                  <div className="flex items-center self-start sm:self-auto shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                      {estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
const VIEWS = [
  { key: "month", label: "Mes" },
  { key: "agenda", label: "Agenda" },
];

export default function Calendario({reservas = []}) {
  const [view, setView] = useState("month");
  const [current, setCurrent] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();



  const eventos = useMemo(
    () =>
      reservas.map((r) => ({
        title: `${r.cliente?.nombre_completo || "Sin cliente"} – ${r.activo?.nombre || "Activo"}`,
        start: new Date(r.fecha_inicio),
        end: new Date(r.fecha_fin),
        raw: r,
      })),
    [reservas]
  );
  

  const goHoy = () => setCurrent(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const headerLabel = `${MESES[month]} ${year}`;

  return (
    // ELIMINADO EL minHeight:"100vh" Y EL FONDO EXCESIVO
    <div className="w-full font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-slate-50 flex-wrap">
          <button onClick={goHoy} className="px-3.5 py-1.5 bg-white text-slate-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            Hoy
          </button>
          <button onClick={prev} className="px-2.5 py-1.5 bg-white text-slate-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            ‹
          </button>
          <button onClick={next} className="px-2.5 py-1.5 bg-white text-slate-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            ›
          </button>
          
          <span className="flex-1 font-semibold text-[15px] text-slate-800 ml-2 capitalize">
            {headerLabel}
          </span>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-4 py-1.5 text-sm transition-colors ${
                  view === v.key
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                } ${v.key === "month" ? "border-r border-gray-300" : ""}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>



        {/* Contenido */}
        {view === "month" && (
          <VistaMes year={year} month={month} eventos={eventos} />
        )}
        {view === "agenda" && (
          <VistaAgenda year={year} month={month} eventos={eventos} />
        )}
      </div>
    </div>
  );
}