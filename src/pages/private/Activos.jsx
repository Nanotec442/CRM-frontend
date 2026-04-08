import { useActivo } from "../../hooks/useActivo";
import ActivoForm from "../../components/activos/ActivoForm";
import ActivoList from "../../components/activos/ActivoList";

const Activos = () => {
  const {
    activos,
    crearActivo,
    editarActivo,
    eliminarActivo,
  } = useActivo();

  return (
    <div>
      <h1>Activos</h1>

      <ActivoForm onSubmit={crearActivo} />

      <ActivoList
        activos={activos}
        onEditar={editarActivo}
        onEliminar={eliminarActivo}
      />
    </div>
  );
};

export default Activos;