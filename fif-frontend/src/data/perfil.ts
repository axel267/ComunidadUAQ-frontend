import type { LucideIcon } from "lucide-react";
import { CalendarDays, CircleHelp, GraduationCap, Bell, KeyRound } from "lucide-react";
import type { VisibilidadPublicacion } from "@/data/publicaciones";

export const CAMPUSES_UAQ = [
  "Campus Juriquilla",
  "Centro Universitario",
  "Campus Aeropuerto",
  "Campus San Juan del Río",
  "Campus Amazcala",
] as const;

export type CampusUAQ = (typeof CAMPUSES_UAQ)[number];

export const INTERESES_DISPONIBLES = [
  "#DesarrolloMóvil",
  "#InteligenciaArtificial",
  "#ClubGDG",
  "#DeportesUAQ",
  "#Voluntariado",
  "#Hackathon",
  "#DiseñoUI",
  "#Robótica",
] as const;

export interface PerfilEstudiante {
  nombre: string;
  /** Nombre oficial para la credencial emitida por Control Escolar. */
  nombreCredencial: string;
  siglas: string;
  /** Campo institucional bloqueado: no se puede editar desde ajustes. */
  correoInstitucional: string;
  /** Campo institucional bloqueado: no se puede editar desde ajustes. */
  expediente: string;
  estatus: string;
  carrera: string;
  semestre: number;
  facultad: string;
  facultadSigla: string;
  periodo: string;
  nivelEducativo: string;
  campus: CampusUAQ;
  biografia: string;
  telefono: string;
  intereses: string[];
}

export interface SesionActiva {
  id: string;
  dispositivo: string;
  detalle: string;
  actual?: boolean;
}

export interface AjustesCuenta {
  privacidad: {
    visibilidadDefault: VisibilidadPublicacion;
    mostrarCampus: boolean;
    permitirMenciones: boolean;
    mostrarEnLinea: boolean;
  };
  notificaciones: {
    avisosOficiales: boolean;
    respuestasComunidad: boolean;
    eventosRecompensas: boolean;
    resumenCorreo: boolean;
  };
  seguridad: {
    dobleFactor: boolean;
    ultimoCambioPassword: string;
    sesiones: SesionActiva[];
  };
}

export function calcularSiglas(nombre: string): string {
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "UA";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

// Usuario de ejemplo hasta conectar la sesión real (ver services/auth.ts, que aún no guarda la sesión).
export const PERFIL_MOCK: PerfilEstudiante = {
  nombre: "Sofía Morales M.",
  nombreCredencial: "Sofía Morales M.",
  siglas: "SM",
  correoInstitucional: "smorales29@alumnos.uaq.mx",
  expediente: "293810",
  estatus: "Alumno Regular",
  carrera: "Lic. en Ingeniería de Software",
  semestre: 6,
  facultad: "Facultad de Informática",
  facultadSigla: "FIF",
  periodo: "2025-A",
  nivelEducativo: "Pregrado",
  campus: "Campus Juriquilla",
  biografia: "Estudiante de 6º semestre en FIF. Apasionada por desarrollo móvil, arquitectura limpia y comunidades tech en UAQ.",
  telefono: "442 215 8490",
  intereses: ["#DesarrolloMóvil", "#ClubGDG", "#Hackathon"],
};

export const AJUSTES_INICIALES: AjustesCuenta = {
  privacidad: {
    visibilidadDefault: "facultad",
    mostrarCampus: true,
    permitirMenciones: true,
    mostrarEnLinea: true,
  },
  notificaciones: {
    avisosOficiales: true,
    respuestasComunidad: true,
    eventosRecompensas: true,
    resumenCorreo: false,
  },
  seguridad: {
    dobleFactor: true,
    ultimoCambioPassword: "Hace 2 meses",
    sesiones: [
      {
        id: "sesion-actual",
        dispositivo: "Este navegador web",
        detalle: "Sesión activa ahora • Querétaro, MX",
        actual: true,
      },
      {
        id: "sesion-movil",
        dispositivo: "App Campus U • Android",
        detalle: "Última actividad hace 3 h • Campus Juriquilla",
      },
    ],
  },
};

export interface EntradaMenu {
  id: "horario" | "kardex" | "avisos" | "seguridad" | "ayuda";
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  iconoClases: string;
}

export const GESTION_ACADEMICA: EntradaMenu[] = [
  {
    id: "horario",
    titulo: "Horario de Clases",
    descripcion: "Próxima: Redes Distribuidas • Aula 204 (14:00 hrs)",
    icono: CalendarDays,
    iconoClases: "bg-primary-fixed/40 text-primary",
  },
  {
    id: "kardex",
    titulo: "Kardex & Calificaciones",
    descripcion: "Avance curricular, constancias y boletas",
    icono: GraduationCap,
    iconoClases: "bg-tertiary-fixed/40 text-tertiary",
  },
  {
    id: "avisos",
    titulo: "Notificaciones de Avisos",
    descripcion: "Alertas de profesores y fechas de pago",
    icono: Bell,
    iconoClases: "bg-secondary-container/50 text-secondary",
  },
];

export const CUENTA_SEGURIDAD: EntradaMenu[] = [
  {
    id: "seguridad",
    titulo: "Seguridad y Acceso",
    descripcion: "Cambiar contraseña institucional y 2FA",
    icono: KeyRound,
    iconoClases: "bg-surface-container text-on-surface-variant",
  },
  {
    id: "ayuda",
    titulo: "Mesa de Ayuda Escolar",
    descripcion: "Chat con control escolar y soporte TI",
    icono: CircleHelp,
    iconoClases: "bg-surface-container text-on-surface-variant",
  },
];

export interface EventoRegistrado {
  id: string;
  titulo: string;
  detalle: string;
  organiza: string;
}

// Eventos a los que el usuario ya se registró (mock hasta que exista el módulo de eventos).
export const EVENTOS_REGISTRADOS_MOCK: EventoRegistrado[] = [
  {
    id: "hackathon-ciber-2025",
    titulo: "Hackathon de Ciberseguridad Interuniversitario 2025",
    detalle: "Fecha límite de inscripción de equipos: 14 de mayo. Auditorio Telmex de Ingeniería.",
    organiza: "Depto. de Ciencias Computacionales",
  },
];
