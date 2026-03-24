import { useState } from "react";
import ClienteForm from "./ClienteForm";
import ClienteList from "./ClienteList";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const agregarCliente = (cliente) => {
    if (clienteEditando) {
      setClientes(
        clientes.map((c) =>
          c.id === clienteEditando.id ? { ...cliente, id: c.id } : c
        )
      );
      setClienteEditando(null);
    } else {
      setClientes([
        ...clientes,
        { ...cliente, id: Date.now() }
      ]);
    }
  };

  const eliminarCliente = (id) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  const editarCliente = (cliente) => {
    setClienteEditando(cliente);
  };

  // 🔍 filtro
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <ClienteForm
        agregarCliente={agregarCliente}
        clienteEditando={clienteEditando}
      />

      <ClienteList
        clientes={clientesFiltrados}
        eliminarCliente={eliminarCliente}
        editarCliente={editarCliente}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />
    </div>
  );
}

export default Clientes;