import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";

import Dashboard from "../pages/private/Dashboard";
import Clientes from "../pages/private/clientes/Clientes";
import Reservas from "../pages/private/reservas/Reservas";
import Calendario from "../pages/private/Calendario";
import Servicios from "../pages/private/servicios/Servicios";
import Reportes from "../pages/private/reportes/Reportes";
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
          <Route path="calendario" element={<Calendario />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="asistente-ia" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;