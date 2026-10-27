"use client";

import { useEffect, useId, useRef } from "react";
import { Building2, Maximize2, Nfc, X } from "lucide-react";
import type { PerfilEstudiante } from "@/data/perfil";

// Trazado decorativo tomado del diseño de Stitch. NO es un código QR real ni se puede escanear.
// TODO: reemplazar por un QR generado a partir de un token firmado y rotativo que emita el backend.
function QrDecorativo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="Código de acceso a torniquetes">
      <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm5-2h6v2H9V2zm0 3h2v2H9V5zm4 0h2v2h-2V5zm-4 4h3v2H9V9zm6-7h7v7h-7V2zm2 2v3h3V4h-3zM2 15h7v7H2v-7zm2 2v3h3v-3H4zm6-2h2v3h-2v-3zm0 4h3v3H9v-3zm4-4h2v2h-2v-2zm3 0h3v2h-3v-2zm-3 3h2v2h-2v-2zm3 0h3v4h-2v-2h-1v-2zm-3 3h2v2h-2v-2zM15 9h2v2h-2V9zm4 0h3v2h-3V9zm-2 2h2v2h-2v-2z" />
    </svg>
  );
}

function CredencialPantallaCompleta({ perfil, onClose }: { perfil: PerfilEstudiante; onClose: () => void }) {
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
    <div
      data-sheet-open
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      className="sheet-backdrop fixed inset-0 z-[60] flex flex-col items-center justify-center gap-space-xl p-space-xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-on-primary"
    >
      <button
        ref={cerrarRef}
        type="button"
        aria-label="Cerrar credencial"
        onClick={onClose}
        className="absolute top-4 right-4 w-touch-target-min h-touch-target-min rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest/30 active:scale-95 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center">
        <span className="text-label-sm uppercase tracking-widest text-primary-fixed">Comunidad UAQ</span>
        <h2 id={tituloId} className="text-headline-lg">
          Credencial Universitaria
        </h2>
      </div>

      <div className="bg-surface-container-lowest text-on-surface p-space-md rounded-3xl shadow-2xl">
        <QrDecorativo className="w-64 h-64 max-w-[70vw] max-h-[70vw] p-2" />
        <p className="text-center text-label-sm font-mono tracking-tight text-secondary mt-1">TORNIQUETES</p>
      </div>

      <div className="text-center space-y-1">
        <p className="text-headline-md">{perfil.nombreCredencial}</p>
        <p className="text-body-md text-on-primary/85">
          {perfil.carrera} • {perfil.nivelEducativo}
        </p>
        <p className="text-label-md font-mono text-primary-fixed">EXP-{perfil.expediente}</p>
      </div>
    </div>
  );
}

interface CredencialDigitalProps {
  perfil: PerfilEstudiante;
  completa: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
}

export function CredencialDigital({ perfil, completa, onAbrir, onCerrar }: CredencialDigitalProps) {
  return (
    <>
      <section
        aria-label="Credencial digital"
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-on-primary p-space-md shadow-xl flex flex-col justify-between min-h-[220px]"
      >
        <div className="absolute -right-8 -bottom-10 w-44 h-44 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 className="w-44 h-44" strokeWidth={1} />
        </div>
        <div className="absolute -left-12 -top-12 w-36 h-36 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase tracking-widest text-primary-fixed">Comunidad UAQ</span>
              <span className="text-headline-sm tracking-tight">Credencial Universitaria</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest/20 backdrop-blur-md px-space-xs py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
            <span className="text-label-sm">{perfil.periodo}</span>
          </div>
        </div>

        <div className="relative z-10 my-space-md flex items-center justify-between gap-space-sm">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-label-sm uppercase text-primary-fixed tracking-wider">Titular</span>
            <span className="text-headline-md truncate leading-tight">{perfil.nombreCredencial}</span>
            <span className="text-body-sm text-on-primary/85 truncate">
              {perfil.carrera.replace("Lic. en ", "")} • {perfil.nivelEducativo}
            </span>
            <div className="flex items-center gap-space-xs mt-1">
              <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container-lowest/25 font-mono">
                EST-ACTIVO
              </span>
              <span className="text-label-sm text-primary-fixed flex items-center gap-0.5">
                <Nfc className="w-3.5 h-3.5" /> Contactless
              </span>
            </div>
          </div>
          <div className="shrink-0 bg-surface-container-lowest text-on-surface p-2 rounded-xl shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-container rounded-lg overflow-hidden">
              <QrDecorativo className="w-full h-full p-1" />
            </div>
            <span className="text-label-sm text-secondary font-mono tracking-tighter mt-1">TORNIQUETES</span>
          </div>
        </div>

        <div className="relative z-10 pt-space-xs">
          <button
            type="button"
            onClick={onAbrir}
            className="h-9 px-space-md rounded-full bg-surface-container-lowest text-primary text-label-md flex items-center justify-center gap-space-xxs shadow-md hover:bg-surface-bright transition-all active:scale-95"
          >
            <Maximize2 className="w-[18px] h-[18px]" />
            Ver Pantalla Completa
          </button>
        </div>
      </section>

      {completa && <CredencialPantallaCompleta perfil={perfil} onClose={onCerrar} />}
    </>
  );
}
