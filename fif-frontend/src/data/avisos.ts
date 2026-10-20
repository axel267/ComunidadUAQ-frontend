import type { LucideIcon } from "lucide-react";
import { Banknote, Landmark, HardHat } from "lucide-react";

export type CategoriaAviso = "academico" | "becas" | "eventos" | "urgente";

export interface Aviso {
  id: string;
  autor: string;
  verificado: boolean;
  tiempo: string;
  referencia: string;
  categoria: CategoriaAviso;
  etiqueta: string;
  etiquetaClases: string;
  icono: LucideIcon;
  iconoWrapperClases: string;
  titulo: string;
  descripcion: string;
  conImagen?: boolean;
  adjunto?: { nombre: string; tamano: string };
}

// Datos de ejemplo mientras se define el contrato real del backend (RF04 - CRUD de avisos).
export const AVISOS_MOCK: Aviso[] = [
  {
    id: "se-2025-14",
    autor: "Servicios Escolares",
    verificado: true,
    tiempo: "Hace 2 horas",
    referencia: "Circular SE-2025/14",
    categoria: "becas",
    etiqueta: "Becas",
    etiquetaClases: "bg-primary-fixed text-on-primary-fixed",
    icono: Banknote,
    iconoWrapperClases: "bg-secondary-container text-primary",
    titulo: "Apertura de Solicitudes: Beca de Manutención y Excelencia Santander 2025",
    descripcion:
      "Se convoca a estudiantes de pregrado con promedio mínimo de 8.5 a registrar su postulación digital en el portal institucional antes de la fecha límite señalada.",
    conImagen: true,
    adjunto: { nombre: "Convocatoria_Becas_2025.pdf", tamano: "2.4 MB" },
  },
  {
    id: "bo-02",
    autor: "Rectoría General",
    verificado: true,
    tiempo: "Ayer",
    referencia: "Boletín Oficial 02",
    categoria: "academico",
    etiqueta: "Rectoría",
    etiquetaClases: "bg-secondary-container text-on-secondary-container",
    icono: Landmark,
    iconoWrapperClases: "bg-primary-fixed text-primary",
    titulo: "Modernización del Campus Central: Nuevos Laboratorios de Cómputo e IA",
    descripcion:
      "La administración central inauguró la reestructuración tecnológica de 4 salas de alta densidad para las facultades de Ciencias e Ingeniería con acceso libre 24/7.",
  },
  {
    id: "fi-evt-08",
    autor: "Facultad de Ingeniería",
    verificado: true,
    tiempo: "2 días atrás",
    referencia: "FI-EVT-08",
    categoria: "eventos",
    etiqueta: "Ingeniería",
    etiquetaClases: "bg-tertiary-fixed text-on-tertiary-fixed",
    icono: HardHat,
    iconoWrapperClases: "bg-tertiary-fixed text-tertiary",
    titulo: "Congreso Internacional de Robótica y Sistemas Embebidos",
    descripcion:
      "Registro abierto para talleres presenciales, ponencias magistrales y concurso de prototipos autónomos.",
    conImagen: true,
  },
];

export interface FechaClave {
  id: string;
  mes: string;
  dia: string;
  titulo: string;
  descripcion: string;
  etiqueta: string;
  casillaClases: string;
  etiquetaClases: string;
}

export const FECHAS_CLAVE_MOCK: FechaClave[] = [
  {
    id: "entrega-actas",
    mes: "FEB",
    dia: "28",
    titulo: "Límite Entrega de Actas",
    descripcion: "Último día para captura en SIUU",
    etiqueta: "Docentes",
    casillaClases: "bg-primary-fixed text-primary",
    etiquetaClases: "bg-error-container text-on-error-container",
  },
  {
    id: "conferencia-ia",
    mes: "MAR",
    dia: "05",
    titulo: "Conferencia Magna IA y Futuro",
    descripcion: "Dr. Ricardo Salinas • 11:00 hrs",
    etiqueta: "Auditorio",
    casillaClases: "bg-secondary-container text-secondary",
    etiquetaClases: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
  {
    id: "dia-inhabil",
    mes: "MAR",
    dia: "17",
    titulo: "Día Inhábil Institucional",
    descripcion: "Suspensión de labores académicas y administrativas",
    etiqueta: "Asueto",
    casillaClases: "bg-surface-container-high text-on-surface-variant",
    etiquetaClases: "bg-surface-container-high text-secondary",
  },
];

export const CATEGORIAS_FILTRO: { id: "all" | CategoriaAviso; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "academico", label: "Académico" },
  { id: "becas", label: "Becas y Trámites" },
  { id: "eventos", label: "Eventos" },
  { id: "urgente", label: "Urgente" },
];
