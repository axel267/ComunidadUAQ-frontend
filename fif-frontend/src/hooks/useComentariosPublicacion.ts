"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getComentariosByPublicacion,
  createComentario,
  deleteComentario,
  type ComentarioBackend,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { useAppToast } from "@/context/ToastContext";

export function useComentariosPublicacion(publicacionId: string | number) {
  const showToast = useAppToast();
  const [comentarios, setComentarios] = useState<ComentarioBackend[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    const numId = Number(publicacionId);
    if (Number.isNaN(numId)) return;
    setCargando(true);
    try {
      const data = await getComentariosByPublicacion(numId);
      setComentarios(data);
    } catch {
      showToast("No se pudieron cargar los comentarios", { tipo: "error" });
    } finally {
      setCargando(false);
    }
  }, [publicacionId, showToast]);

  useEffect(() => {
    if (abierto) {
      cargar();
    }
  }, [abierto, cargar]);

  const alternarAbierto = useCallback(() => {
    setAbierto((prev) => !prev);
  }, []);

  const agregarComentario = useCallback(
    async (texto: string): Promise<boolean> => {
      const limpio = texto.trim();
      if (!limpio) return false;
      const numId = Number(publicacionId);
      if (Number.isNaN(numId)) {
        showToast("Identificador de publicacion invalido", { tipo: "error" });
        return false;
      }

      setEnviando(true);
      try {
        const session = getStoredSession();
        const nuevo = await createComentario({
          publicacionId: numId,
          contenido: limpio,
          autorId: session?.user?.id,
        });

        const comentarioCompleto: ComentarioBackend = {
          ...nuevo,
          autor: nuevo.autor ?? {
            id: session?.user?.id ?? 0,
            nombre: session?.user?.nombre ?? "Usuario",
            carrera: session?.user?.carrera,
          },
        };

        setComentarios((prev) => [...prev, comentarioCompleto]);
        showToast("Comentario publicado con exito", { tipo: "exito" });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al enviar comentario";
        showToast(msg, { tipo: "error" });
        return false;
      } finally {
        setEnviando(false);
      }
    },
    [publicacionId, showToast]
  );

  const eliminar = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteComentario(id);
        setComentarios((prev) => prev.filter((c) => c.id !== id));
        showToast("Comentario eliminado", { tipo: "advertencia" });
        return true;
      } catch {
        showToast("No se pudo eliminar el comentario", { tipo: "error" });
        return false;
      }
    },
    [showToast]
  );

  return {
    comentarios,
    cargando,
    enviando,
    abierto,
    alternarAbierto,
    agregarComentario,
    eliminar,
    recargar: cargar,
  };
}
