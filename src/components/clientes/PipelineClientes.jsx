import { useState, useEffect } from "react";

const COLUMNAS = [
  { id: "Nuevo", titulo: "NUEVOS LEADS", colorBorder: "border-blue-400" },
  { id: "Contactado", titulo: "CONTACTADOS", colorBorder: "border-purple-400" },
  { id: "Negociacion", titulo: "EN NEGOCIACIÓN", colorBorder: "border-yellow-400" },
  { id: "Ganado", titulo: "CERRADO GANADO", colorBorder: "border-green-400" },
];

const PipelineClientes = ({ clientes: clientesReales }) => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    if (clientesReales) {
      setClientes(clientesReales);
    }
  }, [clientesReales]);

  const handleDragStart = (e, clienteId) => {
    e.dataTransfer.setData("clienteId", clienteId);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, columnaDestinoId) => {
    e.preventDefault();
    const clienteId = e.dataTransfer.getData("clienteId");

    setClientes((prevClientes) =>
      prevClientes.map((c) =>
        String(c.id) === String(clienteId) ? { ...c, estado: columnaDestinoId } : c
      )
    );

  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col font-sans bg-white">
      {/* Contenedor del Tablero (Scroll Horizontal) */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
        
        {COLUMNAS.map((columna) => {
          const clientesColumna = clientes.filter((c) => {
            const estadoCliente = c.estado ? c.estado : "Nuevo";
            return estadoCliente.toLowerCase() === columna.id.toLowerCase();
          });

          return (
            <div
              key={columna.id}
              className="shrink-0 w-80 flex flex-col bg-slate-50/50 rounded-xl min-h-125"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columna.id)}
            >
              {/* Título de la Columna */}
              <div className={`pt-3 pb-4 mb-2 border-t-4 ${columna.colorBorder}`}>
                <h2 className="text-center text-xs font-bold text-slate-600 tracking-wider uppercase">
                  {columna.titulo} <span className="ml-1 text-slate-400 font-medium">({clientesColumna.length})</span>
                </h2>
              </div>

              {/* Zona donde se sueltan las tarjetas */}
              <div className="flex-1 px-3 flex flex-col gap-3">
                {clientesColumna.map((cliente) => (
                  
                  /* 🃏 Tarjeta del Cliente (Con datos reales) */
                  <div
                    key={cliente.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cliente.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 uppercase">
                          {cliente.nombre?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 leading-tight">
                            {cliente.nombre || "Sin nombre"}
                          </h3>
                          <p className="text-slate-500 text-[12px] truncate w-40">
                            🏢 {cliente.empresa || "Sin empresa"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col mt-3 space-y-1">
                      <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                        ✉️ {cliente.email || "Sin email"}
                      </span>
                      <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                        📞 {cliente.telefono || "Sin teléfono"}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="h-20 w-full rounded-lg border-2 border-dashed border-transparent hover:border-gray-300 transition-colors"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineClientes;