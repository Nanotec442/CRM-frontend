import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../../components/layout/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          
          {/* Columna Izquierda: Textos y Botones */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700 uppercase tracking-widest shadow-sm">
              <Sparkles size={14} className="text-indigo-500" />
              Gestión moderna de clientes y servicios
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 tracking-tight">
              Organiza tu negocio, consulta disponibilidad y gestiona todo desde un solo lugar
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600 font-medium leading-relaxed">
              PIVOT te permite administrar clientes, reservas, activos y reportes
              de manera clara, rápida y eficiente con el poder de la Inteligencia Artificial.
            </p>

            {/* Botones de Acción (CTAs) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              
              {/* Botón Principal -> Va al Registro */}
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Comenzar gratis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Botón Secundario -> Va al Login */}
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas de Características */}
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <h3 className="text-lg font-bold text-slate-900">Clientes</h3>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Administra información, historial y seguimiento de tu cartera.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <h3 className="text-lg font-bold text-slate-900">Reservas</h3>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Consulta disponibilidad y organiza servicios fácilmente.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <h3 className="text-lg font-bold text-slate-900">Reportes</h3>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Visualiza métricas clave para tomar mejores decisiones.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <h3 className="text-lg font-bold text-slate-900">Asistente IA</h3>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Obtén apoyo inteligente para tareas, análisis y carga de datos.
                </p>
              </div>
            </div>
          </div>
          
        </section>
      </main>
    </div>
  );
}

export default Home;