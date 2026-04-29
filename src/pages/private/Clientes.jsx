import { useState, useEffect, useCallback } from "react";
import ClienteForm from "../../components/clientes/ClienteForm";
import ClienteList from "./../../components/clientes/ClienteList";
import PipelineClientes from "../../components/clientes/PipelineClientes";
import NuevoClienteVista from "../../components/clientes/NuevoClienteVista";
import { clientesService } from "../../services/clientesService";
import { tarjetasService } from "../../services/tarjetasService"; // Importamos el servicio de tarjetas

// --- IMPORTAMOS LOS COMPONENTES DE FIRMA ---
import ModalFirmaLegal from "../../components/firmas/ModalFirmaLegal"; 
import FirmaFisica from "../../components/firmas/FirmaFisica";
import { toast } from "react-toastify";

/**
 * Vista de administración de clientes.
 * Permite alternar entre un tablero visual (Pipeline), una lista detallada, la creación con IA y gestión de firmas.
 */
function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [vista, setVista] = useState("pipeline"); 

  // --- ESTADOS PARA LAS FIRMAS ---
  const [firmaLegalState, setFirmaLegalState] = useState({ isOpen: false, clienteId: null });
  const [firmaFisicaState, setFirmaFisicaState] = useState({ isOpen: false, clienteId: null });

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.listar();

      const raw = Array.isArray(data) ? data : data.clientes ?? [];

      const mapped = raw.map((c) => ({
        id: c.id ?? c.cliente_id,
        nombre: c.nombre_completo, 
        email: c.email,
        telefono: c.telefono,
        empresa: c.empresa,
        notes: c.notas,
        estado: c.estado,
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

  // --- MANEJADOR PRINCIPAL DE GUARDADO ---
  const handleGuardar = async (formData) => {
    try {
      if (clienteEditando) {
        // --- FLUJO DE EDICIÓN ---
        const idActual = clienteEditando.id ?? clienteEditando.cliente_id;
        const actualizado = await clientesService.modificar(idActual, formData);
        
        setClientes((prev) =>
          prev.map((c) =>
            (c.id ?? c.cliente_id) === idActual
              ? {
                  id: actualizado.id,
                  nombre: actualizado.nombre_completo,
                  email: actualizado.email,
                  telefono: actualizado.telefono,
                  empresa: actualizado.empresa,
                  notas: actualizado.notas,
                  estado: actualizado.estado,
                }
              : c
          )
        );
        setClienteEditando(null);
        toast.success("Cliente actualizado correctamente.");
      } else {
        // --- FLUJO DE CREACIÓN ---
        const nuevo = await clientesService.crear(formData);
        
        // Aseguramos extraer el ID real (FastAPI suele usar cliente_id o id)
        const idRealCliente = nuevo.id ?? nuevo.cliente_id;
        
        const mapped = {
          id: idRealCliente,
          nombre: nuevo.nombre_completo,
          email: nuevo.email,
          telefono: nuevo.telefono,
          empresa: nuevo.empresa,
          notas: nuevo.notas,
          estado: nuevo.estado,
        };
        setClientes((prev) => [mapped, ...prev]);

        // ✨ Creación dinámica de la tarjeta en el Kanban ✨
        try {
          const columnas = await tarjetasService.getColumnas();
          const columnasOrdenadas = columnas.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
          const primeraColumnaId = columnasOrdenadas[0]?.id;

          if (primeraColumnaId) {
            await tarjetasService.crearTarjeta({
              cliente_id: idRealCliente,
              stage_id: primeraColumnaId
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
      setError("Error al procesar la solicitud: " + err.message);
    }
  };

  // --- NUEVA FUNCIÓN: ENVIAR CLIENTE EXISTENTE AL PIPELINE ---
  const handleMoverAPipeline = async (clienteId) => {
    try {
      // 1. Buscamos la primera columna disponible
      const columnas = await tarjetasService.getColumnas();
      const columnasOrdenadas = columnas.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      const primeraColumnaId = columnasOrdenadas[0]?.id;

      if (!primeraColumnaId) {
        toast.warning("No hay columnas configuradas en el tablero.");
        return;
      }

      // 2. Creamos la tarjeta
      await tarjetasService.crearTarjeta({
        cliente_id: clienteId,
        stage_id: primeraColumnaId
      });

      toast.success("¡Oportunidad creada en el Pipeline!");
      setVista("pipeline"); // Cambiamos de vista para ver el resultado

    } catch (err) {
      console.error("Error al mover al pipeline:", err);
      toast.error(err.response?.data?.detail || "No se pudo crear la tarjeta en el tablero.");
    }
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente);
    setFormVisible(true);
    setVista("lista"); 
  };

  const handleCancelar = () => {
    setClienteEditando(null);
    setFormVisible(false);
  };

  // --- MANEJADORES DE FIRMA ---
  const handleGuardarFirmaFisica = async (imagenBase64) => {
    try {
      console.log("Firma guardada para cliente:", firmaFisicaState.clienteId);
      toast.success("¡Firma guardada correctamente!");
      setFirmaFisicaState({ isOpen: false, clienteId: null });
    } catch (err) {
      console.error("Error al guardar la firma física", err);
      toast.error("Hubo un error al guardar la firma.");
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      (c.nombre ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.empresa ?? "").toLowerCase().includes(q)
    );
  });

  if (loading && clientes.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg text-slate-500 font-medium">Cargando base de datos de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header y Selector de Vistas */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-2 text-slate-600">
            Gestiona tu cartera de clientes y haz seguimiento de sus estados.
            Tienes <span className="font-semibold">{clientes.length}</span> registros activos.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setVista("pipeline"); setFormVisible(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                vista === "pipeline" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pipeline Visual
            </button>
            <button
              onClick={() => { setVista("lista"); setFormVisible(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                vista === "lista" && !formVisible ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <p>⚠ {error}</p>
          <button onClick={cargarClientes} className="font-semibold underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Renderizado Condicional de las 3 Vistas */}
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
                <h2 className="text-xl font-semibold text-slate-900 mb-5">
                  Editar Cliente
                </h2>
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
                onFirmarLegal={(id) => setFirmaLegalState({ isOpen: true, clienteId: id })}
                onFirmarFisica={(id) => setFirmaFisicaState({ isOpen: true, clienteId: id })}
                
                // INTEGRACIÓN DEL BOTÓN DE PIPELINE
                onMoverAPipeline={handleMoverAPipeline}
              />
            </div>
          </div>
        )}

      </section>

      {/* --- MODALES DE FIRMA --- */}
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