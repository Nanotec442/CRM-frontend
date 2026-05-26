import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import activosService from "../services/activosService";

export const useActivo = () => {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await activosService.getActivos();
      setActivos(res.data || res);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("No se pudieron cargar los activos.");
    } finally {
      setLoading(false);
    }
  };

  const crearActivo = async (data) => {
    setLoading(true);
    try {
      await activosService.createActivo(data);
      await fetchActivos();
      toast.success("Activo creado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err);
      if (err.response?.status === 409) {
        toast.error("Ya existe un activo con ese SKU. Usa un código diferente.");
      } else {
        toast.error(err.response?.data?.detail || "Error al crear el activo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const editarActivo = async (id, data) => {
    setLoading(true);
    try {
      await activosService.updateActivo(id, data);
      await fetchActivos();
      toast.success("Activo actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err);
      if (err.response?.status === 409) {
        toast.error("Ya existe un activo con ese SKU. Usa un código diferente.");
      } else {
        toast.error(err.response?.data?.detail || "Error al actualizar el activo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Ahora acepta estado destino — "Mantenimiento" o "Fuera de servicio"
  const eliminarActivo = async (id, nuevoEstado = "Mantenimiento") => {
    setLoading(true);
    try {
      await activosService.updateActivo(id, { estado: nuevoEstado });
      await fetchActivos();
      toast.success(`Activo cambiado a ${nuevoEstado}.`);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error(err.response?.data?.detail || "Error al cambiar el estado.");
    } finally {
      setLoading(false);
    }
  };

  const activarActivo = async (id) => {
    setLoading(true);
    try {
      await activosService.updateActivo(id, { estado: "Disponible" });
      await fetchActivos();
      toast.success("Activo reactivado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error(err.response?.data?.detail || "Error al reactivar el activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  return {
    activos,
    loading,
    error,
    fetchActivos,
    crearActivo,
    editarActivo,
    eliminarActivo,
    activarActivo,
  };
};