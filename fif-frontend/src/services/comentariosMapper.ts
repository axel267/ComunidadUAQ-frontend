import type { ComentarioComunidad, RespuestaComentario } from "@/data/comunidad";
import { calcularSiglas } from "@/data/perfil";

export interface AutorComentarioBackend {
  id: number;
  nombre: string;
  carrera?: string;
}

export interface ComentarioForoBackend {
  id: number;
  contenido: string;
  votos: number;
  fechaCreacion: string;
  comentarioPadreId?: number | null;
  autorId?: number | null;
  autor?: AutorComentarioBackend | null;
  respuestas?: ComentarioForoBackend[];
}

function formatearHora(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function datosAutor(c: ComentarioForoBackend, usuarioActualId?: number) {
  const nombre = c.autor?.nombre?.trim() || "Usuario UAQ";
  const autorId = c.autor?.id ?? c.autorId ?? undefined;
  const esPropio = usuarioActualId !== undefined && autorId === usuarioActualId;
  return {
    autor: nombre,
    siglas: calcularSiglas(nombre),
    avatarClases: esPropio ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant",
    esPropio,
  };
}

function mapearRespuesta(r: ComentarioForoBackend, usuarioActualId?: number): RespuestaComentario {
  return {
    ...datosAutor(r, usuarioActualId),
    id: String(r.id),
    tiempo: formatearHora(r.fechaCreacion),
    creadoEn: new Date(r.fechaCreacion).getTime(),
    texto: r.contenido,
    likes: r.votos || 0,
  };
}

// La relacion "comentarios" trae tambien las respuestas; solo las de nivel superior son hilos.
export function mapearComentariosForo(
  lista: ComentarioForoBackend[] | undefined,
  usuarioActualId?: number
): ComentarioComunidad[] {
  return (lista ?? [])
    .filter((c) => !c.comentarioPadreId)
    .map((c) => ({
      ...datosAutor(c, usuarioActualId),
      id: String(c.id),
      tiempo: formatearHora(c.fechaCreacion),
      creadoEn: new Date(c.fechaCreacion).getTime(),
      texto: c.contenido,
      likes: c.votos || 0,
      respuestas: (c.respuestas ?? [])
        .slice()
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
        .map((r) => mapearRespuesta(r, usuarioActualId)),
    }));
}
