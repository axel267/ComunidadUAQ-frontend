"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { NotificacionesPanel } from "@/components/notificaciones/NotificacionesPanel";
import { useNotificaciones } from "@/hooks/useNotificaciones";

interface NotificacionesContextValue {
  sinLeer: number;
  abrir: () => void;
}

const NotificacionesContext = createContext<NotificacionesContextValue | null>(null);

// El panel y el contador viven aquí para que la campana del header funcione en cualquier pantalla.
export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const { notificaciones, sinLeer, marcarLeida, marcarTodasLeidas, descartar } = useNotificaciones();
  const [abierto, setAbierto] = useState(false);

  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);
  const valor = useMemo(() => ({ sinLeer, abrir }), [sinLeer, abrir]);

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
      {abierto && (
        <NotificacionesPanel
          notificaciones={notificaciones}
          sinLeer={sinLeer}
          onMarcarLeida={marcarLeida}
          onMarcarTodasLeidas={marcarTodasLeidas}
          onDescartar={descartar}
          onClose={cerrar}
        />
      )}
    </NotificacionesContext.Provider>
  );
}

export function useNotificacionesApp() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error("useNotificacionesApp debe usarse dentro de <AppProviders>.");
  return ctx;
}
