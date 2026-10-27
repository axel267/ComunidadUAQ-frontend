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

// Cifras del diseño de Stitch. No coinciden con la suma de las insignias porque aún no hay backend que las
// calcule; cuando exista, estos totales deben venir de la API y no de este mock.
export const PUNTOS_INICIALES: ResumenPuntos = { total: 840, eventos: 600, solidarios: 240 };

/*
 * Códigos de DEMOSTRACIÓN para probar "Validar asistencia" (en producción los entrega la mesa del evento
 * y los valida el backend): FIF-IA25 (Simposio de IA) · FBA-AD25 (Encuentro de Arte Digital).
 */
export const INSIGNIAS_INICIALES: Insignia[] = [
  {
    id: "solidaria-oro",
    origen: "solidaridad",
    facultad: "fif",
    estado: "desbloqueada",
    titulo: "Mención Solidaria de Oro",
    descripcion:
      "15 comentarios calificados como apoyo solidario ejemplar en los canales de FIF y tutorías estudiantiles.",
    puntos: 120,
    etiqueta: "Comunidad UAQ • Tutorías FIF",
    etiquetaClases: "bg-amber-100 text-amber-800",
    icono: Award,
    emblemaClases: "from-amber-500 to-amber-600",
    fecha: "12 Febrero 2025",
    lugar: "Hilos de la Comunidad UAQ",
    folio: "SOL-UAQ-FIF-2025-015",
    validacion: "Validado por Moderación y Estudiantes",
  },
  {
    id: "asesor-destacado",
    origen: "solidaridad",
    facultad: "all",
    estado: "desbloqueada",
    titulo: "Asesor Universitario Destacado",
    descripcion: "10 respuestas verificadas con solución a dudas técnicas y académicas de primer ingreso.",
    puntos: 100,
    etiqueta: "Comunidad UAQ • Soporte Académico",
    etiquetaClases: "bg-primary-fixed/60 text-on-primary-fixed",
    icono: Headset,
    emblemaClases: "from-primary to-primary-container",
    fecha: "28 Enero 2025",
    lugar: "Respuestas Aceptadas",
    folio: "SOL-UAQ-INT-2025-010",
    validacion: "Confirmado por Autores de Hilo",
  },
  {
    id: "guia-honor",
    origen: "solidaridad",
    facultad: "all",
    estado: "progreso",
    titulo: "Guía de Honor del Campus",
    descripcion:
      "Meta de alto impacto: 25 aportes solidarios verificados en foros interfacultades para pase directo al rango Delegada de Honor.",
    puntos: 250,
    etiqueta: "Próximo Hito de Honor",
    etiquetaClases: "bg-secondary-fixed text-on-secondary-fixed",
    icono: StarHalf,
    emblemaClases: "",
    fecha: "En progreso",
    requisito: "Requiere 25 aportes solidarios verificados",
    progreso: { actual: 18, total: 25 },
  },
  {
    id: "hackathon-2025",
    origen: "evento",
    facultad: "fif",
    estado: "desbloqueada",
    titulo: "Hackathon Interfacultades 2025",
    descripcion:
      "Primer lugar en desarrollo de soluciones cívicas para la movilidad del campus Aeropuerto. Otorgado por el Consejo Académico de Informática.",
    puntos: 200,
    etiqueta: "FIF Oficial",
    etiquetaClases: "bg-primary-fixed/60 text-on-primary-fixed",
    icono: Medal,
    emblemaClases: "from-primary to-primary-container",
    fecha: "24 Octubre 2024",
    lugar: "Campus Juriquilla",
    folio: "UAQ-EVT-8942",
    validacion: "Verificado en Campus",
  },
  {
    id: "congreso-ciberseguridad",
    origen: "evento",
    facultad: "fif",
    estado: "desbloqueada",
    titulo: "Congreso de Ciberseguridad UAQ",
    descripcion:
      "Participación activa en talleres de análisis forense digital y protección de infraestructura de red institucional.",
    puntos: 150,
    etiqueta: "FIF Oficial",
    etiquetaClases: "bg-primary-fixed/60 text-on-primary-fixed",
    icono: Shield,
    emblemaClases: "from-secondary to-on-surface-variant",
    fecha: "15 Noviembre 2024",
    lugar: "Aula Forense",
    folio: "UAQ-EVT-7631",
    validacion: "Verificado en Campus",
  },
  {
    id: "taller-robotica",
    origen: "evento",
    facultad: "fi",
    estado: "desbloqueada",
    titulo: "Taller de Robótica Aplicada",
    descripcion:
      "Validación práctica de cinemática inversa y ensamble de brazos robóticos para asistencia médica.",
    puntos: 120,
    etiqueta: "FI Ingeniería",
    etiquetaClases: "bg-secondary-fixed text-on-secondary-fixed",
    icono: Bot,
    emblemaClases: "from-tertiary to-tertiary-container",
    fecha: "03 Diciembre 2024",
    lugar: "Laboratorio L-8",
    folio: "UAQ-EVT-6502",
    validacion: "Verificado en Campus",
  },
  {
    id: "feria-sustentable",
    origen: "evento",
    facultad: "fcn",
    estado: "desbloqueada",
    titulo: "Feria de Innovación Sustentable",
    descripcion:
      "Proyecto transdisciplinario de monitorización de microcuencas con sensores IoT de bajo consumo hídrico.",
    puntos: 110,
    etiqueta: "FCN Naturales",
    etiquetaClases: "bg-surface-container-high text-on-surface-variant",
    icono: Brain,
    emblemaClases: "from-emerald-600 to-teal-700",
    fecha: "18 Enero 2025",
    lugar: "Huerto UAQ",
    folio: "UAQ-EVT-5820",
    validacion: "Verificado en Campus",
  },
  {
    id: "dia-comunidad",
    origen: "evento",
    facultad: "all",
    estado: "desbloqueada",
    titulo: "Día de la Comunidad UAQ",
    descripcion: "Coordinación del pabellón tecnológico estudiantil en Explanada de Rectoría.",
    puntos: 140,
    etiqueta: "Interfacultades",
    etiquetaClases: "bg-primary-fixed/60 text-on-primary-fixed",
    icono: Users,
    emblemaClases: "from-amber-500 to-primary",
    fecha: "08 Febrero 2025",
    lugar: "Rectoría Central",
    folio: "UAQ-EVT-4109",
    validacion: "Verificado en Campus",
  },
  {
    id: "coloquio-bioetica",
    origen: "evento",
    facultad: "fm",
    estado: "desbloqueada",
    titulo: "Coloquio de Bioética y Salud",
    descripcion:
      "Ponencia sobre confidencialidad médica de historiales clínicos con firma criptográfica.",
    puntos: 120,
    etiqueta: "FM Medicina",
    etiquetaClases: "bg-surface-container-high text-on-surface-variant",
    icono: HeartPulse,
    emblemaClases: "from-cyan-600 to-primary",
    fecha: "20 Febrero 2025",
    lugar: "Auditorio FM",
    folio: "UAQ-EVT-3391",
    validacion: "Verificado en Campus",
  },
  {
    id: "simposio-ia",
    origen: "evento",
    facultad: "fif",
    estado: "bloqueada",
    titulo: "Simposio de Inteligencia Artificial 2025",
    descripcion:
      "Ponencias y talleres sobre inteligencia artificial aplicada, organizados por la Facultad de Informática.",
    puntos: 180,
    etiqueta: "Próximo Evento • FIF",
    etiquetaClases: "bg-surface-container-highest text-on-surface-variant",
    icono: Medal,
    emblemaClases: "from-primary to-primary-container",
    fecha: "12 Marzo 2025",
    lugar: "Centro de Medios FIF",
    requisito: "Requisito: Registro previo en portal UAQ",
    codigo: "FIF-IA25",
  },
  {
    id: "arte-digital",
    origen: "evento",
    facultad: "fba",
    estado: "bloqueada",
    titulo: "Encuentro de Arte Digital y Escénico",
    descripcion: "Muestra de arte digital y artes escénicas de la Facultad de Bellas Artes.",
    puntos: 130,
    etiqueta: "Próximo Evento • FBA",
    etiquetaClases: "bg-surface-container-highest text-on-surface-variant",
    icono: Medal,
    emblemaClases: "from-amber-500 to-primary",
    fecha: "28 Marzo 2025",
    lugar: "Auditorio Esperanza Cabrera",
    requisito: "Asistencia con credencial física/digital",
    nota: "Cupo limitado",
    codigo: "FBA-AD25",
  },
];
