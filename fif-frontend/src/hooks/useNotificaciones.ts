"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NOTIFICACIONES_MOCK, type Notificacion } from "@/data/notificaciones";
import { getAvisosUrgentesPendientes, confirmarLecturaAviso } from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { useAppToast } from "@/context/ToastContext";

export function useNotificaciones() {
  const showToast = useAppToast();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES_MOCK);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) return;

    getAvisosUrgentesPendientes()
      .then((urgentes) => {
        if (!Array.isArray(urgentes) || urgentes.length === 0) return;

        const alertasBackend: Notificacion[] = urgentes.map((a) => ({
          id: `aviso-${a.id}`,
          tipo: "urgente",
          titulo: a.titulo,
          descripcion: a.contenido,
          tiempo: "Urgente",
          leida: false,
        }));

        setNotificaciones((prev) => {
          const idsExistentes = new Set(prev.map((n) => n.id));
          const nuevas = alertasBackend.filter((n) => !idsExistentes.has(n.id));
          return [...nuevas, ...prev];
        });
      })
      .catch((err) => {
        console.error("Error al sincronizar notificaciones urgentes:", err);
        showToast("No se pudieron cargar las alertas pendientes.", { tipo: "error" });
      });
  }, [showToast]);

  const sinLeer = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  const marcarLeida = useCallback(async (id: string) => {
    if (id.startsWith("aviso-")) {
      const avisoId = Number(id.replace("aviso-", ""));
      if (!Number.isNaN(avisoId)) {
        try {
          await confirmarLecturaAviso(avisoId);
        } catch (err) {
          console.error("Error al guardar la confirmación de lectura:", err);
          showToast("No se pudo guardar la confirmación de lectura.", { tipo: "error" });
          return;
        }
      }
    }
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }, [showToast]);

  const marcarTodasLeidas = useCallback(async () => {
    const pendientes = notificaciones.filter((n) => !n.leida && n.id.startsWith("aviso-"));
    try {
      await Promise.all(
        pendientes.map((n) => {
          const avisoId = Number(n.id.replace("aviso-", ""));
          return Number.isNaN(avisoId) ? Promise.resolve() : confirmarLecturaAviso(avisoId);
        }),
      );
      setNotificaciones((prev) => prev.map((n) => (n.leida ? n : { ...n, leida: true })));
    } catch (err) {
      console.error("Error al guardar las confirmaciones de lectura:", err);
      showToast("No se pudieron guardar todas las confirmaciones.", { tipo: "error" });
    }
  }, [notificaciones, showToast]);

  const descartar = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notificaciones, sinLeer, marcarLeida, marcarTodasLeidas, descartar };
}

