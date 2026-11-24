"use client";

import { CalendarDays, FileText, Link2, MapPin } from "lucide-react";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { DescargarAdjunto } from "@/components/detalle/DescargarAdjunto";
import { EncuestaInteractiva } from "./encuesta/EncuestaInteractiva";
import { formatearFechaEvento, type AdjuntoPublicacion as TipoAdjunto } from "@/data/publicaciones";

function formatearTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AdjuntoImagen({ archivo, completo }: { archivo?: File | string | unknown; completo: boolean }) {
  const url = useObjectUrl(archivo);
  if (!url) return null;
  if (completo) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Imagen adjunta a la publicación" className="w-full max-h-[70dvh] object-contain" />
      </div>
    );
  }
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Imagen adjunta a la publicación" className="w-full h-full object-cover" />
    </div>
  );
}

function AdjuntoVideo({ archivo, enlace, completo }: { archivo?: File; enlace?: string; completo: boolean }) {
  const url = useObjectUrl(archivo);
  if (archivo) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-inverse-surface">
        {url && <video src={url} controls className={`w-full bg-black ${completo ? "max-h-[60dvh]" : "max-h-52"}`} aria-label="Video adjunto" />}
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
      <span className={completo ? "break-all" : "truncate"}>{enlace}</span>
    </a>
  );
}

function AdjuntoDocumento({ archivo, completo }: { archivo?: File | { name?: string; size?: number }; completo: boolean }) {
  const url = useObjectUrl(archivo instanceof Blob ? archivo : undefined);
  const nombre = archivo?.name || "Documento adjunto";
  const extension = nombre.split(".").pop()?.toUpperCase() ?? "DOC";
  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-3 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex flex-col items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
          <span className="text-[8px] font-extrabold leading-none mt-0.5">{extension}</span>
        </div>
        <div className="min-w-0">
          <p className={`text-label-lg text-on-surface ${completo ? "break-all" : "truncate"}`}>{nombre}</p>
          {archivo?.size ? <p className="text-body-sm text-secondary">{formatearTamano(archivo.size)}</p> : null}
        </div>
      </div>
      {completo && <DescargarAdjunto url={url} nombre={nombre} />}
    </div>
  );
}

function AdjuntoEvento({ adjunto }: { adjunto: Extract<TipoAdjunto, { tipo: "evento" }> }) {
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

interface AdjuntoPublicacionProps {
  publicacionId: string;
  adjunto: TipoAdjunto;
  completo?: boolean;
}

export function AdjuntoPublicacion({ publicacionId, adjunto, completo = false }: AdjuntoPublicacionProps) {
  switch (adjunto.tipo) {
    case "imagen":
      return <AdjuntoImagen archivo={adjunto.archivo} completo={completo} />;
    case "video":
      return <AdjuntoVideo archivo={adjunto.archivo} enlace={adjunto.enlace} completo={completo} />;
    case "documento":
      return <AdjuntoDocumento archivo={adjunto.archivo} completo={completo} />;
    case "encuesta":
      return <EncuestaInteractiva publicacionId={publicacionId} encuesta={adjunto} />;
    case "evento":
      return <AdjuntoEvento adjunto={adjunto} />;
  }
}
