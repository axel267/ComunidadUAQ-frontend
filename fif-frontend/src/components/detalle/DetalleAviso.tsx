"use client";

import type { ReactNode } from "react";
import { BadgeCheck, Bookmark, CalendarX2, FileText, Paperclip } from "lucide-react";
import { useGuardados } from "@/context/GuardadosContext";
import { useAppToast } from "@/context/ToastContext";
import { CATEGORIAS_FILTRO, type Aviso } from "@/data/avisos";
import { DescargarAdjunto } from "./DescargarAdjunto";
import { DetalleShell } from "./DetalleShell";
import { formatearFechaHora } from "./formato";
import { formatearFechaLimite } from "@/services/comunicadoMapper";

interface DetalleAvisoProps {
  aviso: Aviso;
  onClose: () => void;
  etiqueta?: string;
  acciones?: ReactNode;
}

export function DetalleAviso({ aviso, onClose, etiqueta = "Comunicado oficial", acciones }: DetalleAvisoProps) {
  const showToast = useAppToast();
  const { estaGuardado, alternar } = useGuardados();
  const guardado = estaGuardado(aviso.id);
  const Icono = aviso.icono;
  const categoria = CATEGORIAS_FILTRO.find((c) => c.id === aviso.categoria)?.label ?? aviso.categoria;
  const fecha = aviso.fechaPublicacion ? formatearFechaHora(aviso.fechaPublicacion) : aviso.tiempo;
  const etiquetaDescarga = aviso.adjunto && /convocatoria/i.test(aviso.adjunto.nombre) ? "Descargar convocatoria" : "Descargar adjunto";

  return (
    <DetalleShell etiqueta={etiqueta} onClose={onClose}>
      <div className="flex items-center gap-space-xs">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${aviso.iconoWrapperClases}`}>
          <Icono className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="flex items-center gap-1 text-headline-sm text-on-surface">
            {aviso.autor}
            {aviso.verificado && <BadgeCheck className="w-4 h-4 text-primary fill-primary/10 shrink-0" />}
          </span>
          <span className="text-label-sm font-inter text-secondary">
            {aviso.area ? `${aviso.area} • ` : ""}
            {aviso.verificado ? "Cuenta oficial verificada" : "Comunidad UAQ"} • {fecha}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-label-md font-inter px-2.5 py-1 rounded-full ${aviso.etiquetaClases}`}>{aviso.etiqueta}</span>
        <span className="text-label-md font-inter px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">{categoria}</span>
        <span className="text-label-md font-inter px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">{aviso.referencia}</span>
      </div>

      <h3 className="text-headline-md text-on-surface break-words">{aviso.titulo}</h3>
      {aviso.fechaLimite && (
        <p className="flex items-center gap-1.5 text-label-lg text-on-error-container bg-error-container rounded-lg px-3 py-1.5 w-max max-w-full">
          <CalendarX2 className="w-4 h-4 shrink-0" />
          Límite: {formatearFechaLimite(aviso.fechaLimite)}
        </p>
      )}
      {aviso.resumen && <p className="text-body-md text-on-surface font-semibold break-words">{aviso.resumen}</p>}
      <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap break-words">{aviso.descripcion}</p>

      {aviso.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- URLs administradas por el backend
        <img src={aviso.imagenUrl} alt={`Imagen del aviso: ${aviso.titulo}`} className="w-full rounded-xl object-contain bg-surface-container" />
      )}

      {aviso.adjunto && (
        <div className="flex flex-col gap-space-xs bg-surface-container-low border border-outline-variant rounded-xl p-3">
          <p className="flex items-center gap-2 text-label-lg text-on-surface min-w-0">
            <Paperclip className="w-4 h-4 text-primary shrink-0" />
            <span className="break-all">
              {aviso.adjunto.nombre} ({aviso.adjunto.tamano})
            </span>
          </p>
          <DescargarAdjunto url={aviso.adjunto.url} nombre={aviso.adjunto.nombre} etiqueta={etiquetaDescarga} />
        </div>
      )}

      {!aviso.adjunto && (
        <p className="flex items-center gap-2 text-body-sm text-secondary">
          <FileText className="w-4 h-4 shrink-0" />
          Este comunicado no incluye archivos adjuntos.
        </p>
      )}

      {acciones}

      <button
        type="button"
        aria-pressed={guardado}
        onClick={() => showToast(alternar(aviso.id) ? "Aviso guardado" : "Aviso removido de guardados")}
        className="flex items-center justify-center gap-2 h-touch-target-min rounded-xl bg-surface-container-low text-primary text-label-lg hover:bg-secondary-container transition-colors"
      >
        <Bookmark className={`w-5 h-5 ${guardado ? "fill-current" : ""}`} />
        {guardado ? "Quitar de guardados" : "Guardar aviso"}
      </button>
    </DetalleShell>
  );
}
