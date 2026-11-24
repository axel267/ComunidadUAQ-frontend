"use client";

import { CalendarPlus, CalendarDays, MapPin } from "lucide-react";
import type { PostComunidad } from "@/data/comunidad";
import { formatearFechaEvento, type DatosEventoPublicacion, type Publicacion } from "@/data/publicaciones";
import { puedeCrearEventos } from "@/services/permisos";

export interface EventoInstitucionalItem {
  id: string;
  evento: DatosEventoPublicacion;
  descripcion?: string;
  organiza: string;
}

export function extraerEventosInstitucionales(
  publicaciones: Publicacion[],
  postsComunidad: PostComunidad[]
): EventoInstitucionalItem[] {
  const mapa = new Map<string, EventoInstitucionalItem>();

  for (const pub of publicaciones) {
    if (pub.adjunto?.tipo === "evento") {
      mapa.set(pub.id, {
        id: pub.id,
        evento: {
          titulo: pub.adjunto.titulo,
          fechaHora: pub.adjunto.fechaHora,
          lugar: pub.adjunto.lugar,
        },
        descripcion: pub.texto !== pub.adjunto.titulo ? pub.texto : undefined,
        organiza: pub.autor.nombre,
      });
    }
  }

  for (const post of postsComunidad) {
    if (post.evento?.titulo && !mapa.has(post.id)) {
      mapa.set(post.id, {
        id: post.id,
        evento: post.evento,
        descripcion: post.texto !== post.evento.titulo ? post.texto : undefined,
        organiza: post.autor.nombre,
      });
    }
  }

  return Array.from(mapa.values());
}

interface SeccionEventosInstitucionalesProps {
  eventos: EventoInstitucionalItem[];
  onCrearEvento: () => void;
}

export function SeccionEventosInstitucionales({
  eventos,
  onCrearEvento,
}: SeccionEventosInstitucionalesProps) {
  const autorizado = puedeCrearEventos();

  return (
    <>
      {autorizado && (
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-primary-fixed flex items-center justify-between gap-space-sm">
          <div className="min-w-0">
            <span className="text-label-sm font-inter text-primary uppercase tracking-wider">
              Coordinacion y Docencia
            </span>
            <h2 className="text-headline-sm text-on-surface">Publicar nuevo evento</h2>
            <p className="text-body-sm text-on-surface-variant">
              Crea convocatorias, ponencias o actividades academicas para tu facultad.
            </p>
          </div>
          <button
            type="button"
            onClick={onCrearEvento}
            className="h-10 px-space-md rounded-xl bg-primary text-on-primary text-label-lg flex items-center gap-1.5 shadow-sm hover:bg-primary/90 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Crear evento</span>
          </button>
        </div>
      )}

      {eventos.map((item) => (
        <article
          key={`evento-inst-${item.id}`}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs"
        >
          <div className="flex items-center justify-between">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded-full text-label-sm font-inter">
              Evento Institucional
            </span>
            <span className="text-label-md text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Programado
            </span>
          </div>
          <h2 className="text-headline-sm text-on-surface">{item.evento.titulo}</h2>
          {item.descripcion && (
            <p className="text-body-md text-on-surface-variant">{item.descripcion}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-4 h-4 text-primary shrink-0" />
              {formatearFechaEvento(item.evento.fechaHora)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              {item.evento.lugar}
            </span>
          </div>
          <span className="text-body-sm text-secondary">Organiza: {item.organiza}</span>
        </article>
      ))}
    </>
  );
}
