"use client";

import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  EllipsisVertical,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  Link2,
  MapPin,
  Network,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import {
  DURACIONES_ENCUESTA,
  etiquetaTema,
  etiquetaVisibilidad,
  formatearFechaEvento,
  formatearTiempoRelativo,
  type AdjuntoPublicacion,
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

function formatearTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AdjuntoImagen({ archivo }: { archivo: File }) {
  const url = useObjectUrl(archivo);
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container shadow-sm">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), no aplica optimización
        <img src={url} alt="Imagen adjunta a la publicación" className="w-full h-full object-cover" />
      )}
    </div>
  );
}

function AdjuntoVideo({ archivo, enlace }: { archivo?: File; enlace?: string }) {
  const url = useObjectUrl(archivo);
  if (archivo) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-inverse-surface">
        {url && <video src={url} controls className="w-full max-h-52 bg-black" aria-label="Video adjunto" />}
      </div>
    );
  }
  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-label-lg text-primary hover:bg-primary-fixed/40 transition-colors min-w-0"
    >
      <Link2 className="w-4 h-4 shrink-0" />
      <span className="truncate">{enlace}</span>
    </a>
  );
}

function AdjuntoDocumento({ archivo }: { archivo: File }) {
  const extension = archivo.name.split(".").pop()?.toUpperCase() ?? "DOC";
  return (
    <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-3 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex flex-col items-center justify-center shrink-0">
        <FileText className="w-5 h-5" />
        <span className="text-[8px] font-extrabold leading-none mt-0.5">{extension}</span>
      </div>
      <div className="min-w-0">
        <p className="text-label-lg text-on-surface truncate">{archivo.name}</p>
        <p className="text-body-sm text-secondary">{formatearTamano(archivo.size)}</p>
      </div>
    </div>
  );
}

function AdjuntoEncuesta({ adjunto }: { adjunto: Extract<AdjuntoPublicacion, { tipo: "encuesta" }> }) {
  const duracion = DURACIONES_ENCUESTA.find((d) => d.id === adjunto.duracion)?.label ?? adjunto.duracion;
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-2.5">
      <p className="flex items-start gap-2 text-label-lg text-on-surface">
        <ChartColumn className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        {adjunto.pregunta}
      </p>
      <ul className="space-y-1.5">
        {adjunto.opciones.map((opcion, i) => (
          <li
            key={i}
            className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface"
          >
            <span className="w-4 h-4 rounded-full border-2 border-outline-variant shrink-0" />
            {opcion}
          </li>
        ))}
      </ul>
      <p className="text-label-sm text-secondary">Votación abierta · {duracion}</p>
    </div>
  );
}

function AdjuntoEvento({ adjunto }: { adjunto: Extract<AdjuntoPublicacion, { tipo: "evento" }> }) {
  return (
    <div className="bg-primary-fixed/40 border border-primary-fixed rounded-xl p-3.5 space-y-1.5">
      <p className="flex items-center gap-2 text-label-lg text-on-surface">
        <CalendarDays className="w-4 h-4 text-primary shrink-0" />
        {adjunto.titulo}
      </p>
      <p className="text-body-sm text-on-surface-variant pl-6">{formatearFechaEvento(adjunto.fechaHora)}</p>
      <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant pl-6">
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        {adjunto.lugar}
      </p>
    </div>
  );
}

function Adjunto({ adjunto }: { adjunto: AdjuntoPublicacion }) {
  switch (adjunto.tipo) {
    case "imagen":
      return <AdjuntoImagen archivo={adjunto.archivo} />;
    case "video":
      return <AdjuntoVideo archivo={adjunto.archivo} enlace={adjunto.enlace} />;
    case "documento":
      return <AdjuntoDocumento archivo={adjunto.archivo} />;
    case "encuesta":
      return <AdjuntoEncuesta adjunto={adjunto} />;
    case "evento":
      return <AdjuntoEvento adjunto={adjunto} />;
  }
}

interface PublicacionCardProps {
  publicacion: Publicacion;
  onOpciones: (publicacion: Publicacion) => void;
}

export function PublicacionCard({ publicacion, onOpciones }: PublicacionCardProps) {
  const { autor, texto, tema, visibilidad, adjunto, creadaEn, editadaEn } = publicacion;
  const IconoTema = ICONO_TEMA[tema];
  const IconoVisibilidad = ICONO_VISIBILIDAD[visibilidad];

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
              <span className="text-label-sm font-inter px-1.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed shrink-0">
                Tú
              </span>
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

      <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words">{texto}</p>

      {adjunto && <Adjunto adjunto={adjunto} />}

      <div className="flex items-center justify-between pt-space-xxs">
        <span className="inline-flex items-center gap-1 text-label-sm font-inter px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          Publicado
        </span>
        {editadaEn && (
          <span className="text-label-sm font-inter text-secondary">
            Editada {formatearTiempoRelativo(editadaEn).toLowerCase()}
          </span>
        )}
      </div>
    </article>
  );
}
