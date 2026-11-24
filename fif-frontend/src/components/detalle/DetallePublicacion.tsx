"use client";

import { Globe, GraduationCap, Landmark, BookOpen, Network, Store, Users, type LucideIcon } from "lucide-react";
import { AdjuntoPublicacion } from "@/components/publicar/AdjuntoPublicacion";
import { SeccionComentarios } from "@/components/publicar/comentarios/SeccionComentarios";
import { getStoredSession } from "@/services/auth";
import {
  etiquetaTema,
  etiquetaVisibilidad,
  type Publicacion,
  type TemaPublicacion,
  type VisibilidadPublicacion,
} from "@/data/publicaciones";
import { DetalleShell } from "./DetalleShell";
import { formatearFechaHora } from "./formato";

const ICONO_TEMA: Record<TemaPublicacion, LucideIcon> = {
  hub: Network,
  academico: BookOpen,
  ventas: Store,
  comunidad: Users,
};

const ICONO_VISIBILIDAD: Record<VisibilidadPublicacion, LucideIcon> = {
  facultad: GraduationCap,
  uaq: Landmark,
  campus: Globe,
};

interface DetallePublicacionProps {
  publicacion: Publicacion;
  onClose: () => void;
}

export function DetallePublicacion({ publicacion, onClose }: DetallePublicacionProps) {
  const { autor, texto, tema, visibilidad, adjunto, creadaEn, editadaEn } = publicacion;
  const sesion = getStoredSession()?.user;
  const esPropia = publicacion.autorId === undefined || publicacion.autorId === sesion?.id;
  const rol = esPropia ? sesion?.rol : undefined;
  const IconoTema = ICONO_TEMA[tema];
  const IconoVisibilidad = ICONO_VISIBILIDAD[visibilidad];

  return (
    <DetalleShell etiqueta="Publicación" onClose={onClose}>
      <div className="flex items-center gap-space-xs">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary flex items-center justify-center text-label-lg shrink-0 ring-2 ring-primary-fixed">
          {autor.siglas}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-headline-sm text-on-surface">{autor.nombre}</span>
            {esPropia && (
              <span className="text-label-sm font-inter px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed">Tú</span>
            )}
            {rol && (
              <span className="text-label-sm font-inter px-1.5 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed">{rol}</span>
            )}
          </div>
          <span className="text-label-sm font-inter text-on-surface-variant">
            {autor.etiqueta} • {autor.facultad}
          </span>
        </div>
      </div>

      <p className="text-label-sm font-inter text-secondary">
        {formatearFechaHora(creadaEn)}
        {editadaEn ? ` • Editada ${formatearFechaHora(editadaEn)}` : ""}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 bg-secondary-container/60 text-primary text-label-md px-2.5 py-1 rounded-full">
          <IconoTema className="w-3.5 h-3.5" />
          {etiquetaTema(tema)}
        </span>
        <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-label-md px-2.5 py-1 rounded-full">
          <IconoVisibilidad className="w-3.5 h-3.5" />
          {etiquetaVisibilidad(visibilidad)}
        </span>
      </div>

      <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap break-words">{texto}</p>

      {adjunto && <AdjuntoPublicacion publicacionId={publicacion.id} adjunto={adjunto} completo />}

      <SeccionComentarios publicacionId={publicacion.id} abiertoInicial alturaCompleta />
    </DetalleShell>
  );
}
