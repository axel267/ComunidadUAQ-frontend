import { calcularSiglas } from "@/data/perfil";
import type {
  AdjuntoPublicacion,
  AutorPublicacion,
  Publicacion,
  TemaPublicacion,
} from "@/data/publicaciones";
import type { PublicacionBackend } from "@/services/api";

const TEMAS_VALIDOS: TemaPublicacion[] = ["hub", "academico", "ventas", "comunidad"];

export function parsearTema(categoria?: string): TemaPublicacion {
  return TEMAS_VALIDOS.includes(categoria as TemaPublicacion)
    ? (categoria as TemaPublicacion)
    : "comunidad";
}

export function esIdTemporal(id: string): boolean {
  return id.startsWith("pub-");
}

// El nombre del autor siempre sale del registro de la publicacion en BD,
// nunca del perfil de la sesion activa.
function autorDesdeBackend(item: PublicacionBackend, autorSesion: AutorPublicacion): AutorPublicacion {
  const nombre = item.autor?.nombre?.trim() || "Usuario UAQ";
  return {
    nombre,
    siglas: calcularSiglas(nombre),
    facultad: autorSesion.facultad,
    etiqueta: autorSesion.etiqueta,
  };
}

export function mapearDesdeBackend(
  item: PublicacionBackend,
  autorSesion: AutorPublicacion,
  adjuntoExistente?: AdjuntoPublicacion
): Publicacion {
  const adjuntoBackend = item.imagenesUrl
    ? ({ tipo: "imagen", archivo: item.imagenesUrl as unknown as File } as AdjuntoPublicacion)
    : undefined;

  return {
    id: String(item.id),
    autorId: item.autorId ?? item.autor?.id,
    texto: item.contenido || item.titulo,
    tema: parsearTema(item.categoria),
    visibilidad: "facultad",
    autor: autorDesdeBackend(item, autorSesion),
    creadaEn: new Date(item.fechaCreacion).getTime(),
    adjunto: adjuntoExistente ?? adjuntoBackend,
  };
}
