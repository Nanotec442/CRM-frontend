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

// Panel Superadmin
import SuperAdminLayout from "../pages/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import EmpresasList from "../pages/superadmin/EmpresasList";
import EmpresaDetalle from "../pages/superadmin/EmpresaDetalle";

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
import Inbox from "../pages/private/Inbox";

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

        {/* ── Panel Superadmin ── */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute requireSuperAdmin>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="empresas" element={<EmpresasList />} />
          <Route path="empresas/:tenantId" element={<EmpresaDetalle />} />
        </Route>

        {/* ── Panel CRM ── */}
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
          <Route path="inbox" element={<Inbox />} />
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