import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "pipeline_columnas";

const COLORES_DISPONIBLES = [
  "border-blue-400", "border-purple-400", "border-yellow-400",
  "border-green-400", "border-red-400", "border-indigo-400",
  "border-pink-400", "border-teal-400", "border-orange-400"
];

// ─── MODAL ELEGANTE (En lugar del prompt) ───────────────────────────────────
const NombreModal = ({ visible, titulo, valorInicial, onConfirm, onCancel }) => {
  const [valor, setValor] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setValor(valorInicial ?? "");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [visible, valorInicial]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-80 p-6 border border-gray-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-gray-800 mb-4">{titulo}</p>
        <input
          ref={inputRef}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valor.trim()) onConfirm(valor.trim());
            if (e.key === "Escape") onCancel();
          }}
          maxLength={40}
          placeholder="Nombre de la etapa..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(valor.trim())}
            disabled={!valor.trim()}
            className="px-4 py-2 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-40 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TABLERO PRINCIPAL ────────────────────────────────────────────────────────
const PipelineClientes = ({ clientes: clientesReales }) => {
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState(null);
  
  // Carga de columnas desde memoria
  const [columnas, setColumnas] = useState(() => {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (guardadas) return JSON.parse(guardadas);
    return [
      { id: "Nuevo", titulo: "NUEVOS LEADS", colorBorder: "border-blue-400" },
      { id: "Contactado", titulo: "CONTACTADOS", colorBorder: "border-purple-400" },
      { id: "Negociacion", titulo: "EN NEGOCIACIÓN", colorBorder: "border-yellow-400" },
    ];
  });

  // Persistencia automática
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(columnas)), [columnas]);
  useEffect(() => { if (clientesReales) setClientes(clientesReales); }, [clientesReales]);

  // ─── LÓGICA DRAG & DROP NATIVA ───
  const handleDragStart = (e, clienteId) => {
    e.dataTransfer.setData("clienteId", clienteId);
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, columnaDestinoId) => {
    e.preventDefault();
    const clienteId = e.dataTransfer.getData("clienteId");

    // Actualizamos la UI al instante
    setClientes((prev) => prev.map((c) => String(c.id) === String(clienteId) ? { ...c, estado: columnaDestinoId } : c));
    
    // 🔥 AQUÍ: Llamas a tu servicio real, no a un axios inventado
    // clientesService.modificar(clienteId, { estado: columnaDestinoId });
  };

  // ─── GESTIÓN DE COLUMNAS ───
  const handleModalConfirm = (valor) => {
    if (modal.tipo === "nueva") {
      setColumnas([...columnas, { id: valor, titulo: valor.toUpperCase(), colorBorder: COLORES_DISPONIBLES[columnas.length] }]);
    } else {
      setColumnas(prev => prev.map(col => col.id === modal.columnaId ? { ...col, id: valor, titulo: valor.toUpperCase() } : col));
      
      // Actualizamos a los clientes si la columna cambió de ID
      setClientes(prev => prev.map(c => c.estado === modal.columnaId ? { ...c, estado: valor } : c));
    }
    setModal(null);
  };

  const handleEliminarColumna = (columnaId) => {
    if (columnas.length <= 3) return;
    if (window.confirm("¿Eliminar esta etapa? Los clientes se moverán a la primera columna.")) {
      const primerColumnaId = columnas[0].id;
      setClientes(prev => prev.map(c => c.estado === columnaId ? { ...c, estado: primerColumnaId } : c));
      setColumnas(prev => prev.filter(col => col.id !== columnaId));
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col font-sans bg-white relative">
      <div className="flex flex-1 gap-6 overflow-x-auto overflow-y-hidden pb-6 items-start snap-x">
        
        {columnas.map((columna) => {
          const clientesColumna = clientes.filter(c => (c.estado || columnas[0].id).toLowerCase() === columna.id.toLowerCase());

          return (
            <div
              key={columna.id}
              className="flex-shrink-0 w-80 flex flex-col bg-slate-50/50 rounded-2xl min-h-[500px] snap-start border border-slate-100"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columna.id)}
            >
              {/* Header */}
              <div className={`pt-4 pb-3 mb-2 border-t-4 flex justify-between items-center px-4 ${columna.colorBorder}`}>
                <h2 
                  onClick={() => setModal({ tipo: "editar", columnaId: columna.id, valorInicial: columna.titulo })}
                  className="text-xs font-bold text-slate-500 tracking-wider uppercase cursor-pointer hover:text-blue-600 transition-colors flex-1"
                >
                  {columna.titulo} <span className="ml-1 bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-full">{clientesColumna.length}</span>
                </h2>
                {columnas.length > 3 && (
                  <button onClick={() => handleEliminarColumna(columna.id)} className="text-slate-300 hover:text-red-500 transition-colors">✖</button>
                )}
              </div>

              {/* Tarjetas */}
              <div className="flex-1 px-3 flex flex-col gap-3">
                {clientesColumna.map((cliente) => (
                  <div
                    key={cliente.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cliente.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                        {cliente.nombre?.substring(0, 2) || "??"}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{cliente.nombre || "Sin nombre"}</h3>
                    </div>
                    {(cliente.email || cliente.telefono) && (
                      <div className="flex flex-col mt-3 space-y-1">
                        {cliente.email && <span className="text-slate-500 text-xs truncate">✉️ {cliente.email}</span>}
                        {cliente.telefono && <span className="text-slate-500 text-xs">📞 {cliente.telefono}</span>}
                      </div>
                    )}
                  </div>
                ))}
                <div className="h-20 w-full rounded-xl border-2 border-dashed border-transparent hover:border-blue-200 transition-colors" />
              </div>
            </div>
          );
        })}

        {columnas.length < 9 && (
          <button
            onClick={() => setModal({ tipo: "nueva" })}
            className="shrink-0 w-80 min-h-125 flex flex-col items-center justify-center gap-2 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:text-blue-600 text-slate-400 transition-all font-medium cursor-pointer snap-start"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm">Añadir nueva etapa</span>
          </button>
        )}
      </div>

      <NombreModal 
        visible={!!modal} 
        titulo={modal?.tipo === "nueva" ? "Crear nueva etapa" : "Renombrar etapa"}
        valorInicial={modal?.valorInicial}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(null)}
      />
    </div>
  );
};

export default PipelineClientes;