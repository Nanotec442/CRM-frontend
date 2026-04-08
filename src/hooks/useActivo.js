import { useState, useEffect } from "react";
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
      setActivos(res.data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const crearActivo = async (data) => {
    setLoading(true);
    try {
      await activosService.createActivo(data);
      await fetchActivos();
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const editarActivo = async (id, data) => {
    setLoading(true);
    try {
      await activosService.updateActivo(id, data);
      await fetchActivos();
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarActivo = async (id) => {
    setLoading(true);
    try {
      await activosService.desactivarActivo(id);
      await fetchActivos();
    } catch (err) {
      console.error(err);
      setError(err);
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
  };
};