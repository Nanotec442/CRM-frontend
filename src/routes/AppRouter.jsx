import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Páginas públicas
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import RetornoWebpay from "../pages/public/RetornoWebpay";
import LandingReservas from "../pages/public/LandingReservas";
import FirmaPublica from "../pages/public/FirmaPublica";


// Panel Superadmin
import SuperAdminLayout from "../pages/superAdmin/SuperAdminLayout";
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard";
import EmpresasList from "../pages/superAdmin/EmpresasList";
import EmpresaDetalle from "../pages/superAdmin/EmpresaDetalle";

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
import CompletarRegistro from "../pages/public/CompletarRegistro";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Rutas Públicas ── */}
        <Route path="/" element={<PublicLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="retorno-pago" element={<RetornoWebpay />} />
          <Route path="reservar/:tenantId" element={<LandingReservas />} />
          <Route path="completar-registro" element={<CompletarRegistro />} />
          <Route path="/firma/:token" element={<FirmaPublica />} />

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