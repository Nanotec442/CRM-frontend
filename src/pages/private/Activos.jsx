export default function ActivoList({ activos }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4">Activos</h2>

      {activos.map((a) => (
        <div key={a.id} className="border p-3 mb-2 rounded">
          <p><strong>{a.nombre}</strong></p>
          <p>{a.tipo}</p>
          <p>${a.precio_base}</p>
        </div>
      ))}
    </div>
  );
}