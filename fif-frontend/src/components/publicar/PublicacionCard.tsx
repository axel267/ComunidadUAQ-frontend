"use client";

import {
  BookOpen,
  EllipsisVertical,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  Network,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AreaClicable } from "@/components/detalle/AreaClicable";
import { useDetalle } from "@/context/DetalleContext";
import { getStoredSession } from "@/services/auth";
import { AdjuntoPublicacion } from "./AdjuntoPublicacion";
import { SeccionComentarios } from "./comentarios/SeccionComentarios";
import {
  etiquetaTema,
  etiquetaVisibilidad,
  formatearTiempoRelativo,
  type Publicacion,
  type TemaPublicacion,
  type VisibilidadPublicacion,
} from "@/data/publicaciones";

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

const ADJUNTOS_ABREN_DETALLE = new Set(["imagen", "documento", "evento"]);

interface PublicacionCardProps {
  publicacion: Publicacion;
  onOpciones: (publicacion: Publicacion) => void;
}

export function PublicacionCard({ publicacion, onOpciones }: PublicacionCardProps) {
  const { abrirPublicacion } = useDetalle();
  const { autor, texto, tema, visibilidad, adjunto, creadaEn, editadaEn } = publicacion;
  const usuarioActualId = getStoredSession()?.user?.id;
  const esPropia = publicacion.autorId === undefined || publicacion.autorId === usuarioActualId;
  const IconoTema = ICONO_TEMA[tema];
  const IconoVisibilidad = ICONO_VISIBILIDAD[visibilidad];
  const abrirDetalle = () => abrirPublicacion(publicacion.id);

  return (
    <article
      id={`publicacion-${publicacion.id}`}
      className="bg-surface-container-lowest rounded-2xl p-card-padding shadow-md shadow-secondary/5 flex flex-col gap-space-sm scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary flex items-center justify-center text-label-lg shrink-0 ring-2 ring-primary-fixed">
            {autor.siglas}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-headline-sm text-on-surface truncate">{autor.nombre}</span>
              {esPropia && (
                <span className="text-label-sm font-inter px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed shrink-0">
                  Tú
                </span>
              )}
            </div>
            <span className="text-label-sm font-inter text-on-surface-variant truncate">
              {autor.facultad} • {formatearTiempoRelativo(creadaEn)}
              {editadaEn ? " • Editada" : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Opciones de publicación"
          aria-haspopup="dialog"
          onClick={() => onOpciones(publicacion)}
          className="w-touch-target-min h-touch-target-min -mr-2 -mt-1 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all shrink-0"
        >
          <EllipsisVertical className="w-[22px] h-[22px]" />
        </button>
      </div>

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

      <AreaClicable onActivar={abrirDetalle} etiqueta="Ver detalle de la publicación">
        <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words line-clamp-6">{texto}</p>
      </AreaClicable>

      {adjunto &&
        (ADJUNTOS_ABREN_DETALLE.has(adjunto.tipo) ? (
          <AreaClicable onActivar={abrirDetalle} etiqueta="Ver detalle de la publicación">
            <AdjuntoPublicacion publicacionId={publicacion.id} adjunto={adjunto} />
          </AreaClicable>
        ) : (
          <AdjuntoPublicacion publicacionId={publicacion.id} adjunto={adjunto} />
        ))}

      <div className="flex items-center justify-between pt-space-xxs gap-2">
        <span className="inline-flex items-center gap-1 text-label-sm font-inter px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          Publicado
        </span>
        <button
          type="button"
          onClick={abrirDetalle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-secondary-container transition-colors text-label-md font-inter"
        >
          <FileText className="w-[18px] h-[18px]" />
          <span>Más información</span>
        </button>
      </div>

      <SeccionComentarios publicacionId={publicacion.id} />
    </article>
  );
}
