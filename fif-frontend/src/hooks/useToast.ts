"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Paleta semántica de "Confirmaciones Sutiles y Paleta de Estados" (Stitch):
// éxito = menta, error/destructivo = coral, advertencia = ámbar, institucional = azul UAQ.
export type ToastTipo = "info" | "exito" | "editado" | "eliminado" | "restaurado" | "advertencia" | "error";

export interface ToastOpciones {
  tipo?: ToastTipo;
  detalle?: string;
  accion?: { label: string; onClick: () => void };
  /** Milisegundos visible. 0 = se queda hasta que se cierre manualmente. */
  duracion?: number;
  /** Muestra los segundos restantes junto al detalle (ej. ventana para deshacer). */
  cuentaRegresiva?: boolean;
}

export interface ToastData extends Required<Pick<ToastOpciones, "tipo" | "duracion">> {
  id: number;
  mensaje: string;
  detalle?: string;
  accion?: ToastOpciones["accion"];
  cuentaRegresiva?: boolean;
}

const DURACION_POR_DEFECTO = 2800;
const TIEMPO_SALIDA = 250;

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);
  const contador = useRef(0);
  const ocultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limpiarRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelarTemporizadores = useCallback(() => {
    if (ocultarRef.current) clearTimeout(ocultarRef.current);
    if (limpiarRef.current) clearTimeout(limpiarRef.current);
  }, []);

  const hideToast = useCallback(() => {
    cancelarTemporizadores();
    setVisible(false);
    limpiarRef.current = setTimeout(() => setToast(null), TIEMPO_SALIDA);
  }, [cancelarTemporizadores]);

  const showToast = useCallback(
    (mensaje: string, opciones: ToastOpciones = {}) => {
      cancelarTemporizadores();
      const duracion = opciones.duracion ?? DURACION_POR_DEFECTO;
      contador.current += 1;
      setToast({ ...opciones, id: contador.current, mensaje, tipo: opciones.tipo ?? "info", duracion });
      setVisible(true);
      if (duracion > 0) {
        ocultarRef.current = setTimeout(hideToast, duracion);
      }
    },
    [cancelarTemporizadores, hideToast]
  );

  useEffect(() => cancelarTemporizadores, [cancelarTemporizadores]);

  return { toast, visible, showToast, hideToast };
}
