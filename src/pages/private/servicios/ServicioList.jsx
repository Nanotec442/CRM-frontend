function ServicioList({ servicios, eliminarServicio, editarServicio }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Lista de Servicios</h2>

      {servicios.length === 0 ? (
        <p>No hay servicios aún</p>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Nombre</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Duración</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {servicios.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.nombre}</td>
                <td className="p-2">${s.precio}</td>
                <td className="p-2">{s.duracion} min</td>

                <td className="p-2 space-x-2">
                  <button
                    onClick={() => editarServicio(s)}
                    className="text-blue-500"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarServicio(s.id)}
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

export default ServicioList;