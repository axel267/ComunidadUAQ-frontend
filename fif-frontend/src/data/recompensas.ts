import type { LucideIcon } from "lucide-react";
import { Award, Bot, Brain, Headset, HeartPulse, Medal, Shield, StarHalf, Users } from "lucide-react";

export type OrigenInsignia = "evento" | "solidaridad";
export type FacultadClave = "all" | "fif" | "fi" | "fba" | "fm" | "fcn";
export type EstadoInsignia = "desbloqueada" | "progreso" | "bloqueada";

export interface Insignia {
  id: string;
  origen: OrigenInsignia;
  facultad: FacultadClave;
  estado: EstadoInsignia;
  titulo: string;
  descripcion: string;
  puntos: number;
  etiqueta: string;
  etiquetaClases: string;
  icono: LucideIcon;
  /** Clases del degradado del emblema (desbloqueadas). */
  emblemaClases: string;
  /** Fecha de desbloqueo o, mientras está pendiente, fecha del evento. */
  fecha: string;
  lugar?: string;
  folio?: string;
  /** Texto del sello de validación (desbloqueadas de comunidad). */
  validacion?: string;
  /** Requisito para desbloquearla (pendientes). */
  requisito?: string;
  /** Nota corta a la derecha del requisito (ej. "Cupo limitado"). */
  nota?: string;
  progreso?: { actual: number; total: number };
  /** Código de la mesa del evento que acredita la asistencia (solo demo, ver CODIGOS_DEMO). */
  codigo?: string;
}

export const FACULTADES_FILTRO: { id: FacultadClave; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "fif", label: "Informática (FIF)" },
  { id: "fi", label: "Ingeniería (FI)" },
  { id: "fba", label: "Bellas Artes" },
  { id: "fm", label: "Medicina" },
  { id: "fcn", label: "Ciencias Naturales" },
];

export const PUNTOS_POR_APORTE_SOLIDARIO = 15;
export const PUNTOS_POR_ASISTENCIA_EVENTO = 100;

export interface Nivel {
  numero: number;
  minimo: number;
  rango: string;
}

export const NIVELES: Nivel[] = [
  { numero: 1, minimo: 0, rango: "Nuevo Ingreso" },
  { numero: 2, minimo: 150, rango: "Colaboradora UAQ" },
  { numero: 3, minimo: 350, rango: "Participante Activa" },
  { numero: 4, minimo: 600, rango: "Embajadora UAQ" },
  { numero: 5, minimo: 1000, rango: "Delegada de Honor" },
];

export function nivelPorPuntos(puntos: number) {
  const actual = [...NIVELES].reverse().find((n) => puntos >= n.minimo) ?? NIVELES[0];
  const siguiente = NIVELES.find((n) => n.numero === actual.numero + 1) ?? null;
  return { actual, siguiente };
}

export interface ResumenPuntos {
  total: number;
  eventos: number;
  solidarios: number;
}

export const PUNTOS_INICIALES: ResumenPuntos = { total: 0, eventos: 0, solidarios: 0 };

export const INSIGNIAS_INICIALES: Insignia[] = [];
