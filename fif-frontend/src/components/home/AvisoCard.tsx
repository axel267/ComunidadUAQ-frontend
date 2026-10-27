"use client";

import { BadgeCheck, Bookmark, Download, ImageIcon, Paperclip, Share2 } from "lucide-react";
import { useGuardados } from "@/context/GuardadosContext";
import type { Aviso } from "@/data/avisos";

interface AvisoCardProps {
  aviso: Aviso;
  onToast: (message: string) => void;
}

export function AvisoCard({ aviso, onToast }: AvisoCardProps) {
  const { estaGuardado, alternar } = useGuardados();
  const guardado = estaGuardado(aviso.id);
  const Icono = aviso.icono;

  const handleShare = async () => {
    const shareData = {
      title: aviso.titulo,
      text: `Comunicado Oficial Comunidad UAQ: ${aviso.titulo}`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // el usuario canceló el share nativo, no hay nada que hacer
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareData.url || "");
      onToast("Enlace copiado al portapapeles");
    } catch {
      onToast("No se pudo copiar el enlace");
    }
  };

  const handleBookmark = () => {
    const quedaGuardado = alternar(aviso.id);
    onToast(quedaGuardado ? "Aviso guardado" : "Aviso removido de guardados");
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
      <div className="flex items-start justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${aviso.iconoWrapperClases}`}>
            <Icono className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-headline-sm truncate">{aviso.autor}</span>
              {aviso.verificado && <BadgeCheck className="w-4 h-4 text-primary fill-primary/10" />}
            </div>
            <span className="text-label-sm font-inter text-secondary">
              {aviso.tiempo} • {aviso.referencia}
            </span>
          </div>
        </div>
        <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full shrink-0 ${aviso.etiquetaClases}`}>
          {aviso.etiqueta}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-headline-sm text-on-surface">{aviso.titulo}</h3>
        <p className="text-body-md text-on-surface-variant line-clamp-3">{aviso.descripcion}</p>
      </div>

      {aviso.conImagen && (
        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center text-outline">
          <ImageIcon className="w-8 h-8" />
          {aviso.adjunto && (
            <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-md text-on-surface text-label-sm font-inter flex items-center gap-1 shadow-sm">
              <Paperclip className="w-3.5 h-3.5 text-primary" />
              <span>
                {aviso.adjunto.nombre} ({aviso.adjunto.tamano})
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-space-xs">
        <button
          onClick={() => onToast(`Descargando ${aviso.referencia}...`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-secondary-container transition-colors text-label-md font-inter"
        >
          <Download className="w-[18px] h-[18px]" />
          <span>{aviso.adjunto ? "Descargar PDF" : "Más información"}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            aria-label="Compartir"
            onClick={handleShare}
            className="w-touch-target-min h-touch-target-min flex items-center justify-center text-secondary hover:text-primary rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            aria-label={guardado ? "Quitar de guardados" : "Guardar"}
            aria-pressed={guardado}
            onClick={handleBookmark}
            className="w-touch-target-min h-touch-target-min flex items-center justify-center text-secondary hover:text-primary rounded-full transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${guardado ? "fill-current text-primary" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
