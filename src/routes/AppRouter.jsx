import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";

import Dashboard from "../pages/private/Dashboard";
import Clientes from "../pages/private/Clientes";
import Reservas from "../pages/private/Reservas";
import Activos from "../pages/private/Activos";
import Reportes from "../pages/private/Reportes";
import AsistenteIA from "../pages/private/AsistenteIA";
import Configuracion from "../pages/private/Configuracion";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
        </Route>

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
          <Route path="reservas" element={<Reservas />} />
          <Route path="activos" element={<Activos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="asistente-ia" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;