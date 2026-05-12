import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import ClienteForm from "../../components/clientes/ClienteForm";
import ClienteList from "./../../components/clientes/ClienteList";
import PipelineClientes from "../../components/clientes/PipelineClientes";
import NuevoClienteVista from "../../components/clientes/NuevoClienteVista";
import { clientesService } from "../../services/clientesService";
import { tarjetasService } from "../../services/tarjetasService";
import ModalFirmaLegal from "../../components/firmas/ModalFirmaLegal";
import FirmaFisica from "../../components/firmas/FirmaFisica";
import { toast } from "react-toastify";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [vista, setVista] = useState("pipeline");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [firmaLegalState, setFirmaLegalState] = useState({ isOpen: false, clienteId: null });
  const [firmaFisicaState, setFirmaFisicaState] = useState({ isOpen: false, clienteId: null });

  // ── Permisos desde el JWT ─────────────────────────────────────────────────
  const esSuperAdmin = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const payload = jwtDecode(token);
      return payload.is_superadmin === true;
    } catch {
      return false;
    }
  })();

  // ── Cargar clientes ───────────────────────────────────────────────────────
  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.listar();
      const raw = Array.isArray(data) ? data : data.clientes ?? [];

      const mapped = raw.map((c) => ({
        id: c.id ?? c.cliente_id,
        nombre: c.nombre_completo ?? c.nombre,
        email: c.email,
        telefono: c.telefono,
        empresa: c.empresa ?? "",
        notas: c.notas ?? "",
        estado: c.estado ?? "Activo",
      }));

      setClientes(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  const handleGuardar = async (formData) => {
    try {
      if (clienteEditando) {
        const idActual = clienteEditando.id ?? clienteEditando.cliente_id;

        const payload = {
          nombre_completo: formData.nombre ?? formData.nombre_completo,
          email: formData.email,
          telefono: formData.telefono ?? "",
          empresa: formData.empresa ?? "",
          rut_documento: formData.rut ?? formData.rut_documento ?? "",
          estado: formData.estado,
        };

        const actualizado = await clientesService.modificar(idActual, payload);

        setClientes((prev) =>
          prev.map((c) =>
            (c.id ?? c.cliente_id) === idActual
              ? {
                  id: actualizado.id ?? idActual,
                  nombre: actualizado.nombre_completo ?? payload.nombre_completo,
                  email: actualizado.email,
                  telefono: actualizado.telefono,
                  empresa: actualizado.empresa ?? payload.empresa,
                  notas: actualizado.notas ?? "",
                  estado: actualizado.estado,
                }
              : c
          )
        );

        setClienteEditando(null);
        toast.success("Cliente actualizado correctamente.");
      } else {
        const payload = {
          nombre: formData.nombre ?? formData.nombre_completo,
          email: formData.email,
          telefono: formData.telefono ?? "",
          empresa: formData.empresa ?? "",
          rut: formData.rut ?? formData.rut_documento ?? "",
          origen: formData.origen ?? "manual",
        };

        const nuevo = await clientesService.crear(payload);
        const idRealCliente = nuevo.id ?? nuevo.cliente_id;

        const mapped = {
          id: idRealCliente,
          nombre: nuevo.nombre_completo ?? payload.nombre,
          email: nuevo.email,
          telefono: nuevo.telefono,
          empresa: nuevo.empresa ?? payload.empresa,
          notas: "",
          estado: nuevo.estado ?? "Nuevo",
        };

        setClientes((prev) => [mapped, ...prev]);

        // Crear tarjeta en el pipeline automáticamente
        try {
          const columnas = await tarjetasService.getColumnas();
          const columnasOrdenadas = columnas.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
          const primeraColumnaId = columnasOrdenadas[0]?.id;
          if (primeraColumnaId) {
            await tarjetasService.crearTarjeta({
              cliente_id: idRealCliente,
              stage_id: primeraColumnaId,
            });
          }
        } catch (errTarjeta) {
          console.warn("No se pudo crear la tarjeta automática:", errTarjeta);
        }

        toast.success("Cliente creado y añadido al pipeline.");
      }

      setFormVisible(false);
      setVista("pipeline");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al procesar la solicitud.");
      setError(err.response?.data?.detail || err.message);
    }
  };

  // ── Mover al pipeline manualmente ────────────────────────────────────────
  const handleMoverAPipeline = async (clienteId) => {
    const cliente = clientes.find((c) => (c.id ?? c.cliente_id) === clienteId);
    const estadoActual = (cliente?.estado ?? "").toLowerCase();

    if (estadoActual === "inactivo") {
      toast.warning("No puedes agregar un cliente inactivo al pipeline. Actívalo primero.");
      return;
    }

    try {
      const tablero = await tarjetasService.getTablero();
      const yaEnPipeline = tablero.some(
        (t) => String(t.cliente_id) === String(clienteId) && t.activa !== false
      );

      if (yaEnPipeline) {
        toast.warning("Este cliente ya tiene una oportunidad activa en el pipeline.");
        setVista("pipeline");
        return;
      }

      const columnas = await tarjetasService.getColumnas();
      const columnasOrdenadas = columnas.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      const primeraColumnaId = columnasOrdenadas[0]?.id;

      if (!primeraColumnaId) {
        toast.warning("No hay columnas configuradas en el tablero.");
        return;
      }

      await tarjetasService.crearTarjeta({
        cliente_id: clienteId,
        stage_id: primeraColumnaId,
      });

      toast.success("¡Oportunidad creada en el Pipeline!");
      setVista("pipeline");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo crear la tarjeta en el tablero.");
    }
  };

  // ── Activar / Desactivar cliente ─────────────────────────────────────────
  const handleToggleEstado = async (clienteId, estaActivo) => {
    const nuevoEstado = estaActivo ? "Inactivo" : "Activo";
    try {
      await clientesService.modificar(clienteId, { estado: nuevoEstado });
      setClientes((prev) =>
        prev.map((c) =>
          (c.id ?? c.cliente_id) === clienteId ? { ...c, estado: nuevoEstado } : c
        )
      );
      toast.success(`Cliente ${nuevoEstado === "Activo" ? "activado" : "desactivado"} correctamente.`);
    } catch (err) {
      toast.error("No se pudo cambiar el estado del cliente.");
    }
  };

  // ── Eliminar permanentemente — solo superadmin ────────────────────────────
  const handleEliminar = async (clienteId, nombre) => {
    if (
      !window.confirm(
        `¿Eliminar permanentemente a "${nombre}"?\n\nEsta acción no se puede deshacer y eliminará todos sus datos asociados.`
      )
    ) return;

    try {
      await clientesService.eliminar(clienteId);
      setClientes((prev) => prev.filter((c) => (c.id ?? c.cliente_id) !== clienteId));
      toast.success("Cliente eliminado permanentemente.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo eliminar el cliente.");
    }
  };

  // ── Editar ────────────────────────────────────────────────────────────────
  const handleEditar = (cliente) => {
    setClienteEditando(cliente);
    setFormVisible(true);
    setVista("lista");
  };

  const handleCancelar = () => {
    setClienteEditando(null);
    setFormVisible(false);
  };

  const handleGuardarFirmaFisica = async () => {
    try {
      toast.success("¡Firma guardada correctamente!");
      setFirmaFisicaState({ isOpen: false, clienteId: null });
    } catch {
      toast.error("Hubo un error al guardar la firma.");
    }
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  // Por defecto se ocultan los clientes inactivos
  const clientesFiltrados = clientes.filter((c) => {
    const esInactivo = (c.estado ?? "").toLowerCase() === "inactivo";

    if (esInactivo && !mostrarInactivos) return false;

    const q = busqueda.toLowerCase();
    return (
      (c.nombre ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.empresa ?? "").toLowerCase().includes(q)
    );
  });

  const totalActivos = clientes.filter(
    (c) => (c.estado ?? "").toLowerCase() !== "inactivo"
  ).length;

  const totalInactivos = clientes.filter(
    (c) => (c.estado ?? "").toLowerCase() === "inactivo"
  ).length;

  // ── Loading inicial ───────────────────────────────────────────────────────
  if (loading && clientes.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-slate-500 font-medium">Cargando base de datos de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-2 text-slate-600">
            Gestiona tu cartera de clientes y haz seguimiento de sus estados.
            Tienes <span className="font-semibold">{totalActivos}</span> registros activos.
            {totalInactivos > 0 && (
              <button
                onClick={() => setMostrarInactivos(!mostrarInactivos)}
                className={`ml-2 text-xs font-semibold underline transition-colors ${
                  mostrarInactivos
                    ? "text-amber-600 hover:text-amber-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {mostrarInactivos
                  ? `Ocultar inactivos (${totalInactivos})`
                  : `Ver inactivos (${totalInactivos})`}
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setVista("pipeline"); setFormVisible(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                vista === "pipeline"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pipeline Visual
            </button>
            <button
              onClick={() => { setVista("lista"); setFormVisible(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                vista === "lista" && !formVisible
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Lista Detallada
            </button>
          </div>

          <button
            onClick={() => {
              setClienteEditando(null);
              setFormVisible(false);
              setVista("nuevo");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            + Nuevo cliente
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <p>⚠ {error}</p>
          <button onClick={cargarClientes} className="font-semibold underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Vistas */}
      <section>
        {vista === "pipeline" && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <PipelineClientes clientes={clientesFiltrados} />
          </div>
        )}

        {vista === "nuevo" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <NuevoClienteVista
              onVolver={() => setVista("lista")}
              onGuardar={handleGuardar}
            />
          </div>
        )}

        {vista === "lista" && (
          <div className={`grid gap-6 ${formVisible ? "lg:grid-cols-[400px_1fr]" : "grid-cols-1"}`}>
            {formVisible && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 h-fit animate-in slide-in-from-left-4 duration-300">
                <ClienteForm
                  clienteEditando={clienteEditando}
                  onGuardar={handleGuardar}
                  onCancelar={handleCancelar}
                />
              </div>
            )}

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 h-fit overflow-hidden">
              <ClienteList
                clientes={clientesFiltrados}
                loading={loading}
                onEditar={handleEditar}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                onNuevo={() => { setClienteEditando(null); setVista("nuevo"); }}
                onMoverAPipeline={handleMoverAPipeline}
                onToggleEstado={handleToggleEstado}
                onEliminar={esSuperAdmin ? handleEliminar : null}
              />
            </div>
          </div>
        )}
      </section>

      {/* Modales de firma */}
      <ModalFirmaLegal
        isOpen={firmaLegalState.isOpen}
        onClose={() => setFirmaLegalState({ isOpen: false, clienteId: null })}
        reservaId={firmaLegalState.clienteId}
      />

      {firmaFisicaState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <FirmaFisica
            onGuardar={handleGuardarFirmaFisica}
            onCancelar={() => setFirmaFisicaState({ isOpen: false, clienteId: null })}
          />
        </div>
      )}
    </div>
  );
}

export default Clientes;