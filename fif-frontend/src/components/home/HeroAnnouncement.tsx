"use client";

import { ArrowRight, CalendarX2, Pencil, ShieldCheck } from "lucide-react";
import { etiquetaUrgencia, formatearFechaLimite } from "@/services/comunicadoMapper";
import type { ComunicadoOficial } from "@/services/comunicadoOficial";

interface HeroAnnouncementProps {
  comunicado: ComunicadoOficial;
  onConsultarClick: () => void;
  onEditarClick?: () => void;
}

export function HeroAnnouncement({ comunicado, onConsultarClick, onEditarClick }: HeroAnnouncementProps) {
  const urgente = comunicado.urgencia === "URGENTE" || comunicado.urgencia === "ALTA";
  const resumen = comunicado.resumen || comunicado.contenido;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-tertiary p-space-md text-on-primary shadow-lg">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-tertiary-fixed/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xxs bg-surface-container-lowest/20 backdrop-blur-md px-space-xs py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-tertiary-fixed" />
            <span className="text-label-sm font-inter tracking-wide text-on-primary uppercase">Oficial</span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm ${
              urgente ? "bg-error/80 text-on-error" : "bg-surface-container-lowest/25 text-on-primary"
            }`}
          >
            {urgente && <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-pulse" />}
            <span className="text-label-sm font-inter">{etiquetaUrgencia(comunicado.urgencia)}</span>
          </div>
        </div>

        <div className="mt-1">
          <h2 className="text-headline-md leading-tight text-on-primary break-words">{comunicado.titulo}</h2>
          <p className="text-body-sm text-on-primary-container mt-1 line-clamp-2 break-words">{resumen}</p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-space-xs mt-1">
          <div className="flex items-center gap-1.5 text-on-primary-container min-w-0">
            {comunicado.fechaLimite && (
              <>
                <CalendarX2 className="w-[18px] h-[18px] shrink-0" />
                <span className="text-label-md font-inter truncate">Límite: {formatearFechaLimite(comunicado.fechaLimite)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onEditarClick && (
              <button
                type="button"
                onClick={onEditarClick}
                className="flex items-center gap-1 px-space-sm py-2 bg-surface-container-lowest/20 text-on-primary rounded-lg text-label-md font-inter active:scale-95 transition-transform"
              >
                <Pencil className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onConsultarClick}
              className="flex items-center gap-1 px-space-md py-2 bg-surface-container-lowest text-primary rounded-lg text-label-lg font-inter shadow-sm active:scale-95 transition-transform"
            >
              <span>Consultar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
