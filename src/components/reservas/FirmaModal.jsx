
const FirmaModal = ({ reserva, onClose }) => {
  if (!reserva) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)"
    }}>
      <div style={{ background: "#fff", padding: 20, margin: "10% auto", width: 400 }}>
        <h2>Firma de {reserva.cliente}</h2>

        <p>Aquí irá el canvas de firma ✍️</p>

        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default FirmaModal;