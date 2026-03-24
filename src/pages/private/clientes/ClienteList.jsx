function ClienteList({
  clientes,
  eliminarCliente,
  editarCliente,
  busqueda,
  setBusqueda
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Clientes</h2>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {clientes.length === 0 ? (
        <p>No hay clientes</p>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Email</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Empresa</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.nombre}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.telefono}</td>
                <td className="p-2">{c.empresa}</td>

                <td className="p-2 space-x-2">
                  <button
                    onClick={() => editarCliente(c)}
                    className="text-blue-500"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarCliente(c.id)}
                    className="text-red-500"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClienteList;