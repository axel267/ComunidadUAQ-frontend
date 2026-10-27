"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, Pencil, SlidersHorizontal, Trash, TriangleAlert, X } from "lucide-react";
import type { Publicacion } from "@/data/publicaciones";

interface OpcionesPublicacionSheetProps {
  publicacion: Publicacion;
  onClose: () => void;
  onEditar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
}

export function OpcionesPublicacionSheet({ publicacion, onClose, onEditar, onEliminar }: OpcionesPublicacionSheetProps) {
  const tituloId = useId();
  const editarRef = useRef<HTMLButtonElement>(null);
  const volverRef = useRef<HTMLButtonElement>(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    editarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  // Al pedir confirmación, el foco pasa a la opción segura ("Volver") para evitar borrados accidentales.
  useEffect(() => {
    if (confirmando) volverRef.current?.focus();
  }, [confirmando]);

  return (
    <div data-sheet-open className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="sheet-panel relative w-full max-w-xl bg-surface-container-lowest rounded-t-3xl p-screen-margin-mobile pb-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-space-md" />

        <div className="flex items-center justify-between mb-space-md">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 id={tituloId} className="text-headline-md text-on-surface leading-tight">
                Tu Publicación
              </h2>
              <p className="text-label-sm font-inter text-on-surface-variant">Elige la acción que deseas realizar</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar opciones"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-space-sm mb-space-md">
          <button
            ref={editarRef}
            type="button"
            onClick={() => onEditar(publicacion)}
            className="group w-full flex items-start gap-space-sm p-space-sm bg-surface-container-low hover:bg-secondary-container/40 active:bg-secondary-container/60 rounded-xl text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Pencil className="w-[22px] h-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-headline-sm text-on-surface font-bold">Editar Publicación</span>
                <ChevronRight className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Modifica texto, tema, archivos adjuntos o visibilidad de la publicación.
              </p>
            </div>
          </button>

          <button
            type="button"
            aria-expanded={confirmando}
            onClick={() => setConfirmando(true)}
            className="group w-full flex items-start gap-space-sm p-space-sm bg-error-container/40 hover:bg-error-container/70 active:bg-error-container rounded-xl text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Trash className="w-[22px] h-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-headline-sm text-error font-bold">Eliminar Publicación</span>
                <ChevronRight className="w-[18px] h-[18px] text-error" />
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Esta publicación desaparecerá del muro comunitario de toda la UAQ.
              </p>
            </div>
          </button>
        </div>

        {confirmando && (
          <div
            role="alertdialog"
            aria-label="Confirmar eliminación"
            className="flex flex-col gap-space-sm p-card-padding bg-surface-container rounded-2xl mb-space-md"
          >
            <div className="flex items-center gap-space-xs text-error">
              <TriangleAlert className="w-[22px] h-[22px]" />
              <span className="text-headline-sm">¿Eliminar publicación?</span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Dejará de verse en el muro. Tendrás unos segundos para deshacer la acción desde el aviso que aparecerá.
            </p>
            <div className="flex items-center gap-space-xs pt-1">
              <button
                ref={volverRef}
                type="button"
                onClick={() => setConfirmando(false)}
                className="flex-1 h-touch-target-min rounded-xl bg-surface-container-high text-on-surface text-label-lg active:scale-[0.98] transition-transform"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => onEliminar(publicacion)}
                className="flex-1 h-touch-target-min rounded-xl bg-error text-on-error text-label-lg shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
              >
                <Trash className="w-[18px] h-[18px]" />
                Sí, eliminar
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full h-touch-target-min rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-label-lg transition-colors"
        >
          Cerrar menú
        </button>
      </div>
    </div>
  );
}
