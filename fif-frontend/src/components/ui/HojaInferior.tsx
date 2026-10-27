"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

interface HojaInferiorProps {
  titulo: string;
  subtitulo?: string;
  icono: LucideIcon;
  onClose: () => void;
  children: ReactNode;
}

// Hoja inferior accesible: cierra con Escape o al tocar el fondo, bloquea el scroll y enfoca el botón de cerrar.
export function HojaInferior({ titulo, subtitulo, icono: Icono, onClose, children }: HojaInferiorProps) {
  const tituloId = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  return (
    <div data-sheet-open className="fixed inset-0 z-[60] flex items-end justify-center">
      <div aria-hidden="true" onClick={onClose} className="sheet-backdrop absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="sheet-panel relative w-full max-w-md bg-surface-container-lowest rounded-t-2xl p-space-lg pb-8 shadow-xl max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-space-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-fixed/60 text-primary flex items-center justify-center shrink-0">
              <Icono className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id={tituloId} className="text-headline-sm text-on-surface truncate">
                {titulo}
              </h2>
              {subtitulo && <span className="text-label-sm font-inter text-primary font-semibold">{subtitulo}</span>}
            </div>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
