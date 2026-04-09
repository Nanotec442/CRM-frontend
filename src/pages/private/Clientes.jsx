import { useState, useEffect, useCallback } from "react";
import ClienteForm from "../../components/clientes/ClienteForm";
import ClienteList from "./../../components/clientes/ClienteList";
import PipelineClientes from "../../components/clientes/PipelineClientes";
import { clientesService } from "../../services/clientesService";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  
  // NUEVO ESTADO: Controla si vemos la Lista o el Pipeline
  const [vista, setVista] = useState("pipeline"); // Por defecto mostramos el tablero visual

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
        notas: c.notas,
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

  const handleGuardar = async (formData) => {
    if (clienteEditando) {
      const actualizado = await clientesService.modificar(
        clienteEditando.id ?? clienteEditando.cliente_id,
        formData
      );
      setClientes((prev) =>
        prev.map((c) =>
          (c.id ?? c.cliente_id) === (clienteEditando.id ?? clienteEditando.cliente_id)
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
    } else {
      const nuevo = await clientesService.crear(formData);

      const mapped = {
        id: nuevo.id,
        nombre: nuevo.nombre_completo,
        email: nuevo.email,
        telefono: nuevo.telefono,
        empresa: nuevo.empresa,
        notas: nuevo.notas,
        estado: nuevo.estado,
      };

      // CORRECCIÓN: Quitamos el setClientes duplicado que tenías aquí
      setClientes((prev) => [mapped, ...prev]);
    }
    setFormVisible(false);
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente);
    setFormVisible(true);
    setVista("lista"); // Si vamos a editar desde el form, aseguramos estar en la vista compatible
  };

  const handleCancelar = () => {
    setClienteEditando(null);
    setFormVisible(false);
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      (c.nombre ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.empresa ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header y Selector de Vistas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado
            {clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* TABS (Selector de vista) */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setVista("pipeline")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                vista === "pipeline"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Pipeline Visual
            </button>
            <button
              onClick={() => setVista("lista")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                vista === "lista"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Lista Detallada
            </button>
          </div>

          <button
            onClick={() => {
              setClienteEditando(null);
              setFormVisible(true);
              setVista("lista"); // Al crear uno nuevo, mostramos el formulario
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={cargarClientes} className="underline text-red-600 hover:text-red-800">
            Reintentar
          </button>
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL DE VISTAS */}
      
      {/* VISTA 1: Pipeline (Tablero Kanban) */}
      {vista === "pipeline" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Nota: Para que el Pipeline use los datos reales, debes pasarle 'clientes' como prop 
              y modificar PipelineClientes.jsx para que use esos props en lugar de sus datos de prueba */}
          <PipelineClientes clientes={clientesFiltrados} />
        </div>
      )}

      {/* VISTA 2: Lista Detallada + Formulario */}
      {vista === "lista" && (
        <div className={`grid gap-6 ${formVisible ? "lg:grid-cols-[380px_1fr]" : "grid-cols-1"}`}>
          {formVisible && (
            <ClienteForm
              clienteEditando={clienteEditando}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
            />
          )}

          <ClienteList
            clientes={clientesFiltrados}
            loading={loading}
            onEditar={handleEditar}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            onNuevo={() => { setClienteEditando(null); setFormVisible(true); }}
          />
        </div>
      )}
      
    </div>
  );
}

export default Clientes;