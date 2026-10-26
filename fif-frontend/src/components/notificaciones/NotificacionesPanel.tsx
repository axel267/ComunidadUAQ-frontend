"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  CalendarDays,
  CheckCheck,
  MessageCircle,
  Megaphone,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Notificacion, TipoNotificacion } from "@/data/notificaciones";

interface NotificacionesPanelProps {
  notificaciones: Notificacion[];
  sinLeer: number;
  onMarcarLeida: (id: string) => void;
  onMarcarTodasLeidas: () => void;
  onDescartar: (id: string) => void;
  onClose: () => void;
}

const TIPOS: Record<TipoNotificacion, { icon: LucideIcon; clases: string }> = {
  aviso: { icon: Megaphone, clases: "bg-primary-fixed text-primary" },
  comentario: { icon: MessageCircle, clases: "bg-secondary-container text-secondary" },
  evento: { icon: CalendarDays, clases: "bg-tertiary-fixed text-tertiary" },
  urgente: { icon: TriangleAlert, clases: "bg-error-container text-on-error-container" },
  sistema: { icon: ShieldCheck, clases: "bg-surface-container-high text-on-surface-variant" },
};

type Filtro = "todas" | "sinLeer";

export function NotificacionesPanel({
  notificaciones,
  sinLeer,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onDescartar,
  onClose,
}: NotificacionesPanelProps) {
  const tituloId = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  // Cerrar con Escape, bloquear el scroll del fondo y llevar el foco al panel.
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

  const visibles = useMemo(
    () => (filtro === "sinLeer" ? notificaciones.filter((n) => !n.leida) : notificaciones),
    [filtro, notificaciones]
  );

  const filtros: { id: Filtro; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "sinLeer", label: sinLeer > 0 ? `No leídas (${sinLeer})` : "No leídas" },
  ];

  return (
    <div data-sheet-open className="fixed inset-0 z-[60] flex items-start justify-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 bg-on-surface/50 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="notif-panel relative w-full max-w-xl max-h-[85dvh] bg-surface-container-lowest rounded-b-[28px] shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h1 id={tituloId} className="text-headline-sm text-on-surface leading-none">
                Notificaciones
              </h1>
              <p className="text-label-md text-secondary mt-1">
                {sinLeer > 0 ? `${sinLeer} sin leer` : "Estás al día"}
              </p>
            </div>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            aria-label="Cerrar notificaciones"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
          >
            <X className="w-[22px] h-[22px]" />
          </button>
        </header>

        <div className="flex items-center justify-between gap-2 px-5 pb-3 border-b border-surface-container">
          <div role="group" aria-label="Filtrar notificaciones" className="flex items-center gap-1.5">
            {filtros.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filtro === f.id}
                onClick={() => setFiltro(f.id)}
                className={`px-3 py-1.5 rounded-full text-label-lg transition-colors ${
                  filtro === f.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onMarcarTodasLeidas}
            disabled={sinLeer === 0}
            className="flex items-center gap-1 text-label-md text-primary hover:underline disabled:text-outline disabled:no-underline disabled:cursor-not-allowed shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto overscroll-contain divide-y divide-surface-container">
          {visibles.map((n) => {
            const { icon: Icon, clases } = TIPOS[n.tipo];
            return (
              <li key={n.id} className={`relative flex items-start gap-3 px-5 py-3.5 ${n.leida ? "" : "bg-primary-fixed/25"}`}>
                <button
                  type="button"
                  onClick={() => onMarcarLeida(n.id)}
                  aria-label={`${n.leida ? "" : "Marcar como leída: "}${n.titulo}`}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left"
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${clases}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-label-lg text-on-surface truncate ${n.leida ? "font-medium" : "font-bold"}`}>
                        {n.titulo}
                      </span>
                      {!n.leida && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </span>
                    <span className="block text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{n.descripcion}</span>
                    <span className="block text-label-md text-outline mt-1">{n.tiempo}</span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Descartar: ${n.titulo}`}
                  onClick={() => onDescartar(n.id)}
                  className="w-7 h-7 rounded-full text-outline hover:text-error hover:bg-error-container/60 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}

          {visibles.length === 0 && (
            <li className="flex flex-col items-center justify-center gap-2 px-8 py-14 text-center">
              <span className="w-14 h-14 rounded-full bg-surface-container-low text-outline flex items-center justify-center">
                <BellOff className="w-7 h-7" />
              </span>
              <p className="text-label-lg text-on-surface">
                {filtro === "sinLeer" ? "No tienes notificaciones sin leer" : "No tienes notificaciones"}
              </p>
              <p className="text-body-sm text-secondary">Cuando haya novedades en tu facultad, las verás aquí.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
