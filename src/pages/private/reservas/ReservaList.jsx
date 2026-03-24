function ReservaList({ reservas, servicios, eliminarReserva, editarReserva }) {

  const getNombreServicio = (id) => {
    const servicio = servicios.find((s) => s.id == id);
    return servicio ? servicio.nombre : "N/A";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Reservas</h2>

      {reservas.length === 0 ? (
        <p>No hay reservas aún</p>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Cliente</th>
              <th className="p-2">Servicio</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Hora</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.cliente}</td>
                <td className="p-2">{getNombreServicio(r.servicio_id)}</td>
                <td className="p-2">{r.fecha}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2">{r.estado}</td>

                <td className="p-2 space-x-2">
                  <button
                    onClick={() => editarReserva(r)}
                    className="text-blue-500"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarReserva(r.id)}
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

export default ReservaList;