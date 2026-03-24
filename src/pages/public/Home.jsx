import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-slate-200 px-4 py-1 text-sm font-medium text-slate-700">
              Gestión moderna de clientes y servicios
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900">
              Organiza tu negocio, consulta disponibilidad y gestiona todo desde un solo lugar
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Nuestro CRM te permite administrar clientes, reservas, servicios y reportes
              de manera clara, rápida y eficiente.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/"
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Ver disponibilidad
              </Link>

              <Link
                to="/login"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Clientes</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Administra información, historial y seguimiento.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Reservas</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Consulta disponibilidad y organiza servicios fácilmente.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Reportes</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Visualiza métricas clave para tomar mejores decisiones.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Asistente IA</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Obtén apoyo inteligente para tareas y análisis.
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