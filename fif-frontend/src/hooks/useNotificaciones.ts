"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NOTIFICACIONES_MOCK, type Notificacion } from "@/data/notificaciones";
import { getAvisosUrgentesPendientes, confirmarLecturaAviso } from "@/services/api";
import { getStoredSession } from "@/services/auth";

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES_MOCK);

  useEffect(() => {
    const session = getStoredSession();
    const userId = session?.user?.id ?? 2;

    getAvisosUrgentesPendientes(userId)
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
      });
  }, []);

  const sinLeer = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  const marcarLeida = useCallback((id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));

    if (id.startsWith("aviso-")) {
      const avisoId = Number(id.replace("aviso-", ""));
      const session = getStoredSession();
      const userId = session?.user?.id ?? 2;
      if (!Number.isNaN(avisoId)) {
        confirmarLecturaAviso(avisoId, userId).catch(() => {});
      }
    }
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones((prev) => {
      const session = getStoredSession();
      const userId = session?.user?.id ?? 2;

      prev.forEach((n) => {
        if (!n.leida && n.id.startsWith("aviso-")) {
          const avisoId = Number(n.id.replace("aviso-", ""));
          if (!Number.isNaN(avisoId)) {
            confirmarLecturaAviso(avisoId, userId).catch(() => {});
          }
        }
      });
      return prev.map((n) => (n.leida ? n : { ...n, leida: true }));
    });
  }, []);

  const descartar = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notificaciones, sinLeer, marcarLeida, marcarTodasLeidas, descartar };
}

