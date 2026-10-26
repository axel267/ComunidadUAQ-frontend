export type TipoNotificacion = "aviso" | "comentario" | "evento" | "urgente" | "sistema";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

// Datos de ejemplo mientras se define el contrato real del backend.
export const NOTIFICACIONES_MOCK: Notificacion[] = [
  {
    id: "n-01",
    tipo: "urgente",
    titulo: "Límite de entrega de actas",
    descripcion: "Mañana vence el plazo para captura de calificaciones en SIUU.",
    tiempo: "Hace 5 min",
    leida: false,
  },
  {
    id: "n-02",
    tipo: "aviso",
    titulo: "Servicios Escolares publicó un aviso",
    descripcion: "Apertura de solicitudes: Beca de Manutención y Excelencia Santander 2025.",
    tiempo: "Hace 2 horas",
    leida: false,
  },
  {
    id: "n-03",
    tipo: "comentario",
    titulo: "Nuevo comentario en tu publicación",
    descripcion: "Carlos R. respondió: \"Yo tengo los apuntes del Lab de Redes, te los paso\".",
    tiempo: "Hace 3 horas",
    leida: false,
  },
  {
    id: "n-04",
    tipo: "evento",
    titulo: "Recordatorio: Taller de Git y GitHub",
    descripcion: "Jueves 16:00 hrs en el Auditorio de Informática, Campus Juriquilla.",
    tiempo: "Ayer",
    leida: true,
  },
  {
    id: "n-05",
    tipo: "sistema",
    titulo: "Tu cuenta fue verificada",
    descripcion: "Ya puedes publicar en Comunidad UAQ como estudiante de la Facultad de Informática.",
    tiempo: "Hace 2 días",
    leida: true,
  },
  {
    id: "n-06",
    tipo: "aviso",
    titulo: "Rectoría General publicó un boletín",
    descripcion: "Modernización del Campus Central: nuevos laboratorios de cómputo e IA.",
    tiempo: "Hace 3 días",
    leida: true,
  },
];
