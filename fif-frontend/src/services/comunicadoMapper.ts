import { Megaphone } from "lucide-react";
import type { Aviso } from "@/data/avisos";
import { urlAdjuntoAbsoluta, type ComunicadoOficial, type UrgenciaComunicado } from "@/services/comunicadoOficial";

const ETIQUETA_URGENCIA: Record<UrgenciaComunicado, string> = {
  URGENTE: "Urgente",
  ALTA: "Prioridad alta",
  MEDIA: "Prioridad media",
  BAJA: "Informativo",
};

export const etiquetaUrgencia = (urgencia: UrgenciaComunicado) => ETIQUETA_URGENCIA[urgencia];

export function formatearTamanoBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatearFechaLimite(fecha: string) {
  const parseada = new Date(`${fecha.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parseada.getTime())) return fecha;
  return parseada.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function comunicadoAAviso(c: ComunicadoOficial): Aviso {
  const urgente = c.urgencia === "URGENTE";
  return {
    id: `comunicado-${c.id}`,
    autor: c.autor?.nombre ?? "Comunidad UAQ",
    area: c.autor?.area ?? c.facultad?.nombre ?? undefined,
    autorId: c.autorId ?? undefined,
    verificado: true,
    tiempo: new Date(c.fechaPublicacion).toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    fechaPublicacion: c.fechaPublicacion,
    fechaLimite: c.fechaLimite ?? undefined,
    referencia: `Comunicado Oficial #${c.id}`,
    categoria: urgente ? "urgente" : "academico",
    etiqueta: etiquetaUrgencia(c.urgencia),
    etiquetaClases: urgente ? "bg-red-100 text-red-800 font-semibold" : "bg-primary-fixed text-on-primary-fixed",
    icono: Megaphone,
    iconoWrapperClases: urgente ? "bg-red-50 text-red-600" : "bg-primary-fixed text-primary",
    titulo: c.titulo,
    resumen: c.resumen ?? undefined,
    descripcion: c.contenido,
    adjunto: c.adjuntoUrl
      ? {
          nombre: c.adjuntoNombre ?? "Adjunto.pdf",
          tamano: c.adjuntoTamano ? formatearTamanoBytes(c.adjuntoTamano) : "",
          url: urlAdjuntoAbsoluta(c.adjuntoUrl),
        }
      : undefined,
  };
}
