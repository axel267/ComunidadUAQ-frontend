export type TemaPublicacion = "hub" | "academico" | "ventas" | "comunidad";
export type VisibilidadPublicacion = "facultad" | "uaq" | "campus";
export type TipoAdjunto = "imagen" | "video" | "documento" | "encuesta" | "evento";
export type DuracionEncuesta = "24h" | "3d" | "7d";

export const MAX_CARACTERES = 400;
export const MAX_OPCIONES_ENCUESTA = 4;
export const MIN_OPCIONES_ENCUESTA = 2;

// Límites de tamaño por tipo de archivo (en MB), según el diseño de Stitch.
export const LIMITE_MB = { imagen: 10, video: 100, documento: 30 } as const;

export const TEMAS: { id: TemaPublicacion; label: string }[] = [
  { id: "hub", label: "Hub Universitario" },
  { id: "academico", label: "Académico" },
  { id: "ventas", label: "Ventas & Servicios" },
  { id: "comunidad", label: "Comunidad UAQ" },
];

export const VISIBILIDADES: { id: VisibilidadPublicacion; label: string }[] = [
  { id: "facultad", label: "Solo mi facultad" },
  { id: "uaq", label: "Toda la UAQ" },
  { id: "campus", label: "Público campus" },
];

export const DURACIONES_ENCUESTA: { id: DuracionEncuesta; label: string }[] = [
  { id: "24h", label: "24 horas" },
  { id: "3d", label: "3 días" },
  { id: "7d", label: "1 semana" },
];

export const HASHTAGS_SUGERIDOS = ["#Examenes", "#Biblioteca", "#Cafeteria", "#Laboratorio", "#HubUAQ"];

export const FORMATOS_DOCUMENTO = ".pdf,.doc,.docx,.ppt,.pptx";

export interface AutorPublicacion {
  nombre: string;
  siglas: string;
  facultad: string;
  etiqueta: string;
}

// Usuario de ejemplo hasta conectar la sesión real (ver services/auth.ts).
export const AUTOR_MOCK: AutorPublicacion = {
  nombre: "Sofía M.",
  siglas: "SM",
  facultad: "Facultad de Informática",
  etiqueta: "Informática UAQ",
};

export type AdjuntoPublicacion =
  | { tipo: "imagen"; archivo: File }
  | { tipo: "video"; archivo?: File; enlace?: string }
  | { tipo: "documento"; archivo: File }
  | { tipo: "encuesta"; pregunta: string; opciones: string[]; duracion: DuracionEncuesta }
  | { tipo: "evento"; titulo: string; fechaHora: string; lugar: string };

// Contrato que recibe el padre al publicar; el backend (RF04) aún no está definido.
export interface NuevaPublicacion {
  texto: string;
  tema: TemaPublicacion;
  visibilidad: VisibilidadPublicacion;
  adjunto?: AdjuntoPublicacion;
}

// Publicación ya creada por el usuario (hasta que exista persistencia real vive solo en memoria).
export interface Publicacion extends NuevaPublicacion {
  id: string;
  autor: AutorPublicacion;
  creadaEn: number;
  editadaEn?: number;
}

export function etiquetaTema(id: TemaPublicacion) {
  return TEMAS.find((t) => t.id === id)?.label ?? id;
}

export function etiquetaVisibilidad(id: VisibilidadPublicacion) {
  return VISIBILIDADES.find((v) => v.id === id)?.label ?? id;
}

export function formatearTiempoRelativo(marca: number, ahora = Date.now()) {
  const minutos = Math.floor((ahora - marca) / 60_000);
  if (minutos < 1) return "Hace un momento";
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  return new Date(marca).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function formatearFechaEvento(fechaHora: string) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
}
