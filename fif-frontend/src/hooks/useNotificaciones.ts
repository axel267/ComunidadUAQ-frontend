"use client";

import { useCallback, useMemo, useState } from "react";
import { NOTIFICACIONES_MOCK, type Notificacion } from "@/data/notificaciones";

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES_MOCK);

  const sinLeer = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  const marcarLeida = useCallback((id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.map((n) => (n.leida ? n : { ...n, leida: true })));
  }, []);

  const descartar = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notificaciones, sinLeer, marcarLeida, marcarTodasLeidas, descartar };
}
