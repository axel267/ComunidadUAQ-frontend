"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

interface DetalleShellProps {
  etiqueta: string;
  onClose: () => void;
  bloquearEscape?: boolean;
  children: ReactNode;
}

export function DetalleShell({ etiqueta, onClose, bloquearEscape = false, children }: DetalleShellProps) {
  const tituloId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !bloquearEscape) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, bloquearEscape]);

  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="relative w-full max-w-md bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[94dvh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-space-md py-space-xs border-b border-outline-variant/40 shrink-0">
          <h2 id={tituloId} className="text-label-lg text-secondary uppercase tracking-wide">
            {etiqueta}
          </h2>
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-space-md flex flex-col gap-space-sm">{children}</div>
      </div>
    </div>
  );
}
