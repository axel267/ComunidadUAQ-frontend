"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Toast } from "@/components/Toast";
import { useToast, type ToastOpciones } from "@/hooks/useToast";

type MostrarToast = (mensaje: string, opciones?: ToastOpciones) => void;

const ToastContext = createContext<MostrarToast | null>(null);

// Un único toast global para toda la app: así sobrevive a la navegación entre pantallas.
export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, visible, showToast, hideToast } = useToast();

  // Estado de conexión: advertencia ámbar al perderla, confirmación menta al recuperarla.
  useEffect(() => {
    const alPerder = () =>
      showToast("Sin conexión a internet.", {
        tipo: "advertencia",
        detalle: "Reintentaremos al reconectar.",
        duracion: 0,
      });
    const alRecuperar = () =>
      showToast("Conexión restablecida.", { tipo: "exito", detalle: "Ya puedes seguir usando la app." });
    window.addEventListener("offline", alPerder);
    window.addEventListener("online", alRecuperar);
    return () => {
      window.removeEventListener("offline", alPerder);
      window.removeEventListener("online", alRecuperar);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast toast={toast} visible={visible} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const mostrar = useContext(ToastContext);
  if (!mostrar) throw new Error("useAppToast debe usarse dentro de <AppProviders>.");
  return mostrar;
}
