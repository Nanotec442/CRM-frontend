import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import activosService from "../services/activosService";
import resourceTypesService from "../services/resourceTypesService";

export const useActivo = (filtros = {}) => {
  const [activos, setActivos] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serializamos filtros para que useCallback detecte cambios correctamente
  const filtrosKey = JSON.stringify(filtros);

  const fetchActivos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await activosService.getActivos({ ...JSON.parse(filtrosKey), ...params });
      setActivos(data);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("No se pudieron cargar los activos.");
    } finally {
      setLoading(false);
    }
  }, [filtrosKey]);

  const fetchResourceTypes = useCallback(async () => {
    try {
      const data = await resourceTypesService.listar();
      setResourceTypes(data);
    } catch (err) {
      console.error("Error al cargar resource types:", err);
    }
  }, []);

  const crearActivo = async (data) => {
    setLoading(true);
    try {
      await activosService.createActivo(data);
      await fetchActivos();
      toast.success("Activo creado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err);
      if (err.response?.status === 409 || err.response?.data?.detail?.includes("SKU")) {
        toast.error("Ya existe un activo con ese SKU. Usa un código diferente.");
      } else {
        toast.error(err.response?.data?.detail || "Error al crear el activo.");
      }
      throw err;
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
      toast.error(err.response?.data?.detail || "Error al actualizar el activo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      if (nuevoEstado === "Inactivo") {
        await activosService.desactivarActivo(id);
        toast.success("Activo desactivado correctamente.");
      } else {
        await activosService.updateActivo(id, { estado: nuevoEstado });
        toast.success(`Activo cambiado a ${nuevoEstado}.`);
      }
      await fetchActivos();
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error(err.response?.data?.detail || "Error al cambiar el estado.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Aliases para compatibilidad con el código existente
  const eliminarActivo = (id, nuevoEstado = "Mantenimiento") => cambiarEstado(id, nuevoEstado);
  const activarActivo = (id) => cambiarEstado(id, "Disponible");

  useEffect(() => {
    fetchActivos();
    fetchResourceTypes();
  }, [fetchActivos, fetchResourceTypes]);

  return {
    activos,
    resourceTypes,
    loading,
    error,
    fetchActivos,
    fetchResourceTypes,
    crearActivo,
    editarActivo,
    cambiarEstado,
    eliminarActivo,
    activarActivo,
  };
};