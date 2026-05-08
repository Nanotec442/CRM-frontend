import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Páginas públicas
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import RetornoWebpay from "../pages/public/RetornoWebpay";
import LandingReservas from "../pages/public/LandingReservas";

// Páginas privadas
import Dashboard from "../pages/private/Dashboard";
import Clientes from "../pages/private/Clientes";
import ClienteDetalle from "../pages/private/ClienteDetalle";
import Reservas from "../pages/private/Reservas";
import Activos from "../pages/private/Activos";
import Reportes from "../pages/private/Reportes";
import Equipo from "../pages/private/Equipo";
import AsistenteIA from "../pages/private/AsistenteIA";
import Configuracion from "../pages/private/Configuracion";
import Documentos from "../pages/private/Documentos";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas Públicas ── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="retorno-pago" element={<RetornoWebpay />} />
          <Route path="reservar/:tenantId" element={<LandingReservas />} />
        </Route>

        {/* ── Rutas Privadas ── */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="activos" element={<Activos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="equipo" element={<Equipo />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="asistente-ia" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;