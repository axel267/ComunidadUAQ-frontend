"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Insignia } from "@/data/recompensas";

interface InsigniaCardProps {
  insignia: Insignia;
  onVerDetalle: (insignia: Insignia) => void;
  onAcreditarCodigo?: (codigo: string) => void;
}

export function InsigniaCard({ insignia, onVerDetalle, onAcreditarCodigo }: InsigniaCardProps) {
  const Icono: LucideIcon = insignia.icono;

  if (insignia.estado === "bloqueada") {
    return (
      <article
        id={`insignia-${insignia.id}`}
        className="badge-card bg-surface-container-low rounded-xl p-space-md shadow-none flex flex-col gap-space-sm opacity-90 transition-all hover:opacity-100 scroll-mt-24"
      >
        <div className="flex items-start gap-space-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center text-outline shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-space-xxs flex-wrap">
              <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full font-medium ${insignia.etiquetaClases}`}>
                {insignia.etiqueta}
              </span>
              <span className="text-label-lg font-bold text-outline">+{insignia.puntos} Pts</span>
            </div>
            <h4 className="text-headline-sm text-on-surface truncate mt-1">{insignia.titulo}</h4>
            <span className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {insignia.fecha} {insignia.lugar ? `· ${insignia.lugar}` : ""}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-highest/70 rounded-lg px-space-sm py-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-label-sm font-inter text-on-surface-variant flex items-center gap-1 min-w-0 truncate">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{insignia.requisito ?? "Asistencia requerida"}</span>
          </span>
          {insignia.codigo && onAcreditarCodigo ? (
            <button
              type="button"
              onClick={() => onAcreditarCodigo(insignia.codigo!)}
              className="text-label-sm font-inter text-primary font-bold hover:underline shrink-0"
            >
              Acreditar con código
            </button>
          ) : (
            insignia.nota && (
              <span className="text-label-sm font-inter text-outline font-semibold shrink-0">
                {insignia.nota}
              </span>
            )
          )}
        </div>
      </article>
    );
  }

  if (insignia.estado === "progreso") {
    const progreso = insignia.progreso ?? { actual: 0, total: 1 };
    const porcentaje = Math.min(100, Math.round((progreso.actual / progreso.total) * 100));
    const restantes = Math.max(0, progreso.total - progreso.actual);

    return (
      <article
        id={`insignia-${insignia.id}`}
        className="badge-card bg-surface-container-low rounded-xl p-space-md shadow-none flex flex-col gap-space-sm border-l-4 border-l-outline-variant scroll-mt-24"
      >
        <div className="flex items-start gap-space-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
            <Icono className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-space-xxs flex-wrap">
              <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${insignia.etiquetaClases}`}>
                <Sparkles className="w-3 h-3" />
                {insignia.etiqueta}
              </span>
              <span className="text-label-lg font-bold text-primary">+{insignia.puntos} Pts</span>
            </div>
            <h4 className="text-headline-sm text-on-surface truncate mt-1">{insignia.titulo}</h4>
            <p className="text-body-sm text-on-surface-variant mt-0.5">{insignia.descripcion}</p>

            <div className="mt-2">
              <div className="flex justify-between items-center text-label-sm font-inter text-on-surface-variant mb-1">
                <span>
                  Progreso actual: <strong>{progreso.actual} / {progreso.total} aportes</strong>
                </span>
                <span className="font-bold text-primary">{porcentaje}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={porcentaje}
                aria-label={`Progreso de ${insignia.titulo}`}
                className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden"
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-highest/70 rounded-lg px-space-sm py-2 flex items-center justify-between gap-2">
          <span className="text-label-sm font-inter text-on-surface-variant truncate">
            Faltan {restantes} aportes solidarios para reclamar
          </span>
          <span className="text-label-sm font-inter text-primary font-bold shrink-0">Hito Activo</span>
        </div>
      </article>
    );
  }

  // Estado: desbloqueada
  const esSolidaria = insignia.origen === "solidaridad";
  const bordeColor = esSolidaria ? "border-l-amber-500" : "border-l-primary";

  return (
    <article
      id={`insignia-${insignia.id}`}
      className={`badge-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all hover:shadow-md flex flex-col gap-space-sm border-l-4 ${bordeColor} scroll-mt-24`}
    >
      <div className="flex items-start gap-space-sm">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${insignia.emblemaClases} flex items-center justify-center text-on-primary shrink-0 shadow-sm relative overflow-hidden`}
        >
          <Icono className="w-7 h-7" />
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-surface-container-lowest/25 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-space-xxs flex-wrap">
            <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full font-semibold ${insignia.etiquetaClases}`}>
              {insignia.etiqueta}
            </span>
            <span className="text-headline-sm font-bold text-primary">+{insignia.puntos} Pts</span>
          </div>
          <h4 className="text-headline-sm text-on-surface truncate mt-1">{insignia.titulo}</h4>
          <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">{insignia.descripcion}</p>
          <span className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {insignia.fecha} {insignia.lugar ? `· ${insignia.lugar}` : ""}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg px-space-sm py-2 flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-1.5 min-w-0 text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-label-sm font-inter font-bold uppercase truncate">
            {insignia.validacion ?? "Verificado en Campus"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onVerDetalle(insignia)}
          className="text-label-sm font-inter text-primary font-semibold flex items-center gap-0.5 hover:underline shrink-0"
        >
          <span>{insignia.folio ? `Folio #${insignia.folio}` : "Ver detalles"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
