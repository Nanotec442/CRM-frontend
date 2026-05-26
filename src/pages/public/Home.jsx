import { Link } from "react-router-dom";

import {
  ArrowRight,
  Sparkles,
  Users,
  CalendarDays,
  BarChart3,
  Bot,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";

function Home() {
  const features = [
    {
      title: "Clientes",
      description:
        "Administra información, historial y seguimiento desde una sola plataforma.",
      icon: Users,
    },

    {
      title: "Reservas",
      description:
        "Consulta disponibilidad y organiza servicios en tiempo real.",
      icon: CalendarDays,
    },

    {
      title: "Reportes",
      description:
        "Visualiza métricas estratégicas para tomar mejores decisiones.",
      icon: BarChart3,
    },

    {
      title: "Asistente IA",
      description:
        "Automatiza tareas y obtén apoyo inteligente para tu operación.",
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#dfe6ee] font-sans">

      <Navbar />

      <main className="relative">

        {/* BACKGROUND GLOWS */}
        <div
          className="
            absolute top-0 left-0
            h-[500px] w-[500px]
            rounded-full
            bg-[#416ee5]/10
            blur-3xl
          "
        />

        <div
          className="
            absolute right-0 top-40
            h-[400px] w-[400px]
            rounded-full
            bg-blue-200/20
            blur-3xl
          "
        />

        {/* HERO */}
        <section
          className="
            relative z-10
            mx-auto
            grid
            min-h-[calc(100vh-88px)]
            max-w-7xl
            items-center
            gap-14
            px-4 sm:px-6
            py-14 lg:py-20
            lg:grid-cols-2
          "
        >

          {/* LEFT */}
          <div className="max-w-2xl">

            {/* BADGE */}
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-white/40
                bg-white/60
                px-5 py-2
                text-xs font-semibold
                uppercase tracking-[0.2em]
                text-[#416ee5]
                backdrop-blur-xl
                shadow-sm
              "
            >
              <Sparkles size={14} />
              Plataforma inteligente de gestión
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-7
                text-4xl
                font-black
                leading-[1.05]
                tracking-tight
                text-[#1d2b53]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Organiza clientes, reservas y operaciones desde un solo lugar
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-7
                max-w-xl
                text-lg
                leading-relaxed
                text-[#5f77b7]
              "
            >
              Pivot 360 centraliza la administración de clientes,
              activos, reservas y reportes con una experiencia moderna,
              rápida y potenciada por Inteligencia Artificial.
            </p>

            {/* ACTIONS */}
            <div className="mt-10 flex flex-wrap items-center gap-4">

              {/* PRIMARY CTA */}
              <Link
                to="/register"
                className="
                  group
                  inline-flex items-center gap-2
                  rounded-2xl
                  bg-[#416ee5]
                  px-7 py-4
                  text-sm font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(65,110,229,0.25)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#3158c9]
                "
              >
                Crear cuenta

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>

              {/* SECONDARY CTA */}
              <Link
                to="/login"
                className="
                  rounded-2xl
                  border border-white/40
                  bg-white/60
                  px-7 py-4
                  text-sm font-semibold
                  text-[#416ee5]
                  backdrop-blur-xl
                  transition-all
                  hover:bg-white
                  hover:shadow-lg
                "
              >
                Iniciar sesión
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-12 flex flex-wrap gap-8">

              <div>
                <p className="text-3xl font-black text-[#1d2b53]">
                  +99%
                </p>

                <p className="mt-1 text-sm text-[#6b84c5]">
                  Disponibilidad operativa
                </p>
              </div>

              <div>
                <p className="text-3xl font-black text-[#1d2b53]">
                  IA
                </p>

                <p className="mt-1 text-sm text-[#6b84c5]">
                  Automatización inteligente
                </p>
              </div>

              <div>
                <p className="text-3xl font-black text-[#1d2b53]">
                  24/7
                </p>

                <p className="mt-1 text-sm text-[#6b84c5]">
                  Acceso desde cualquier lugar
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              relative
              rounded-[36px]
              border border-white/40
              bg-white/60
              p-7
              backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(65,110,229,0.10)]
            "
          >

            {/* TOP CARD */}
            <div
              className="
                rounded-[28px]
                bg-gradient-to-br
                from-[#416ee5]
                to-[#3158c9]
                p-7
                text-white
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">
                    Centro operativo
                  </p>

                  <h3 className="mt-2 text-3xl font-bold">
                    Pivot 360
                  </h3>
                </div>

                <div
                  className="
                    rounded-2xl
                    bg-white/10
                    p-4
                    backdrop-blur-md
                  "
                >
                  <ShieldCheck size={28} />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Reservas activas
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    128
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/70">
                    Clientes
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    540
                  </p>
                </div>
              </div>
            </div>

            {/* FEATURES */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="
                      group
                      rounded-[26px]
                      border border-white/40
                      bg-white/70
                      p-6
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:bg-white
                      hover:shadow-xl
                    "
                  >
                    <div
                      className="
                        inline-flex
                        rounded-2xl
                        bg-[#416ee5]/10
                        p-3
                        text-[#416ee5]
                      "
                    >
                      <Icon size={22} />
                    </div>

                    <h3
                      className="
                        mt-5
                        text-lg
                        font-bold
                        text-[#1d2b53]
                      "
                    >
                      {feature.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-[#6b84c5]
                      "
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* BOTTOM STATUS */}
            <div
              className="
                mt-6
                flex items-center gap-3
                rounded-2xl
                border border-emerald-100
                bg-emerald-50
                px-5 py-4
              "
            >
              <CheckCircle2
                size={20}
                className="text-emerald-500"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Sistema operativo y sincronizado
                </p>

                <p className="text-xs text-emerald-600">
                  Todos los módulos funcionando correctamente.
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