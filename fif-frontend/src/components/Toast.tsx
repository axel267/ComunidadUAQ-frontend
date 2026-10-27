"use client";

import { useEffect, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  FilePenLine,
  Info,
  Trash2,
  TriangleAlert,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ToastData, ToastTipo } from "@/hooks/useToast";

const ESTILOS: Record<
  ToastTipo,
  { borde: string; icono: LucideIcon; iconoFondo: string; iconoColor: string; accion: string; detalle: string }
> = {
  info: {
    borde: "border-l-primary-container",
    icono: Info,
    iconoFondo: "bg-secondary-container/60",
    iconoColor: "text-primary",
    accion: "bg-primary-fixed text-primary hover:bg-primary-fixed-dim/60",
    detalle: "text-on-surface-variant",
  },
  exito: {
    borde: "border-l-emerald-500",
    icono: CircleCheck,
    iconoFondo: "bg-emerald-50",
    iconoColor: "text-emerald-600",
    accion: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    detalle: "text-on-surface-variant",
  },
  editado: {
    borde: "border-l-primary",
    icono: FilePenLine,
    iconoFondo: "bg-blue-50",
    iconoColor: "text-primary",
    accion: "bg-blue-50 text-primary hover:bg-blue-100",
    detalle: "text-on-surface-variant",
  },
  eliminado: {
    borde: "border-l-red-500",
    icono: Trash2,
    iconoFondo: "bg-red-50",
    iconoColor: "text-red-500",
    accion: "bg-red-50 text-red-700 hover:bg-red-100",
    detalle: "text-red-600",
  },
  restaurado: {
    borde: "border-l-emerald-500",
    icono: Undo2,
    iconoFondo: "bg-emerald-50",
    iconoColor: "text-emerald-600",
    accion: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    detalle: "text-on-surface-variant",
  },
  advertencia: {
    borde: "border-l-amber-500",
    icono: TriangleAlert,
    iconoFondo: "bg-amber-50",
    iconoColor: "text-amber-600",
    accion: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    detalle: "text-amber-700",
  },
  error: {
    borde: "border-l-red-500",
    icono: CircleAlert,
    iconoFondo: "bg-red-50",
    iconoColor: "text-red-500",
    accion: "bg-red-50 text-red-700 hover:bg-red-100",
    detalle: "text-red-600",
  },
};

// Se monta una instancia por toast (key = id), así la cuenta regresiva reinicia sola.
function Detalle({ toast, clase }: { toast: ToastData; clase: string }) {
  const [restante, setRestante] = useState(Math.ceil(toast.duracion / 1000));

  useEffect(() => {
    if (!toast.cuentaRegresiva || toast.duracion <= 0) return;
    const intervalo = setInterval(() => setRestante((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalo);
  }, [toast.cuentaRegresiva, toast.duracion]);

  const texto = toast.cuentaRegresiva && toast.duracion > 0 ? `${toast.detalle ?? ""} (${restante}s)`.trim() : toast.detalle;
  if (!texto) return null;
  return <p className={`text-label-sm font-inter truncate ${clase}`}>{texto}</p>;
}

interface ToastProps {
  toast: ToastData | null;
  visible: boolean;
  onClose: () => void;
}

export function Toast({ toast, visible, onClose }: ToastProps) {
  const estilo = ESTILOS[toast?.tipo ?? "info"];
  const Icono = estilo.icono;
  // Errores y advertencias se anuncian de inmediato; el resto es informativo y no interrumpe.
  const urgente = toast?.tipo === "error" || toast?.tipo === "advertencia";

  return (
    <div className="fixed top-20 inset-x-0 z-[70] px-space-md flex justify-center pointer-events-none">
      <div
        role={urgente ? "alert" : "status"}
        aria-live={urgente ? "assertive" : "polite"}
        className={`w-full max-w-sm flex items-center justify-between gap-2 p-3.5 bg-surface-container-lowest rounded-xl shadow-xl shadow-on-surface/10 border-l-4 transition-all duration-300 ease-out ${
          estilo.borde
        } ${visible && toast ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 scale-95"}`}
      >
        {toast && (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${estilo.iconoFondo}`}>
                <Icono className={`w-[18px] h-[18px] ${estilo.iconoColor}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-label-md text-on-surface truncate">{toast.mensaje}</p>
                <Detalle key={toast.id} toast={toast} clase={estilo.detalle} />
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {toast.accion && (
                <button
                  type="button"
                  onClick={() => {
                    toast.accion?.onClick();
                    onClose();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-label-sm font-bold transition-colors ${estilo.accion}`}
                >
                  {toast.accion.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Cerrar notificación"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
