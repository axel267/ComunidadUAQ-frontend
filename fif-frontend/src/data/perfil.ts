import type { LucideIcon } from "lucide-react";
import { CalendarDays, CircleHelp, GraduationCap, Bell, KeyRound } from "lucide-react";

export interface PerfilEstudiante {
  nombre: string;
  /** Nombre abreviado para la credencial. */
  nombreCredencial: string;
  siglas: string;
  estatus: string;
  carrera: string;
  semestre: number;
  facultad: string;
  facultadSigla: string;
  expediente: string;
  periodo: string;
  nivelEducativo: string;
}

// Usuario de ejemplo hasta conectar la sesión real (ver services/auth.ts, que aún no guarda la sesión).
export const PERFIL_MOCK: PerfilEstudiante = {
  nombre: "Sofía Morales M.",
  nombreCredencial: "Sofía Morales M.",
  siglas: "SM",
  estatus: "Alumno Regular",
  carrera: "Lic. en Ingeniería de Software",
  semestre: 6,
  facultad: "Facultad de Informática",
  facultadSigla: "FIF",
  expediente: "293810",
  periodo: "2025-A",
  nivelEducativo: "Pregrado",
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
