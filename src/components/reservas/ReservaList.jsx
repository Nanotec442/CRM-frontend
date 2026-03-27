export default function ReservaList({ reservas, onDelete }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Reservas</h2>

      {reservas.map((r) => (
        <div key={r.id} className="border p-2 mb-2">
          <p>ID: {r.id}</p>
          <p>Inicio: {r.fecha_inicio}</p>
          <p>Fin: {r.fecha_fin}</p>

          <button
            onClick={() => onDelete(r.id)}
            className="bg-red-500 text-white px-2 py-1 mt-2"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}