export interface ExploraCard {
  id: string;
  titulo: string;
  etiqueta: string;
  etiquetaDestacada?: boolean;
  descripcion: string;
  icono: "anuncios" | "comunidad" | "hub" | "publicar" | "perfil";
  fondoIcono: string;
  prompt: string;
  rutaDirecta?: string;
}

export interface EnlaceRapido {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: "calendario" | "pago" | "rutas" | "biblioteca";
  fondoIcono: string;
  prompt: string;
}

export interface ChipRapido {
  id: string;
  label: string;
  icono: "help" | "school" | "calendar" | "store" | "badge";
  prompt: string;
}

export const RUTA_PROCEDENCIA: Record<string, string> = {
  "/": "Tablón de Anuncios",
  "/comunidad": "Comunidad Universitaria",
  "/perfil": "Perfil del Estudiante",
  "/perfil/recompensas": "Vitrina de Recompensas",
  "/perfil/ajustes": "Ajustes de Cuenta",
  "/facultades": "Facultades UAQ",
};

export function nombreProcedencia(pathname: string | null): string {
  if (!pathname) return "Tablón de Anuncios";
  return RUTA_PROCEDENCIA[pathname] ?? "UAQnecta";
}

export const EXPLORA_UAQNECTA: ExploraCard[] = [
  {
    id: "anuncios",
    titulo: "Tablón de Anuncios",
    etiqueta: "Ver pestaña",
    descripcion: "Noticias oficiales, fechas y avisos de Rectoría y Facultades",
    icono: "anuncios",
    fondoIcono: "bg-primary/10 text-primary",
    prompt: "¿Cómo veo los anuncios oficiales y convocatorias?",
    rutaDirecta: "/",
  },
  {
    id: "comunidad",
    titulo: "Comunidad Estudiantil",
    etiqueta: "Charlar",
    descripcion: "Participa en foros por carrera, grupos y encuestas rápidas",
    icono: "comunidad",
    fondoIcono: "bg-secondary-container text-on-secondary-container",
    prompt: "¿Cómo funciona la Comunidad Estudiantil?",
    rutaDirecta: "/comunidad",
  },
  {
    id: "hub",
    titulo: "Hub Universitario",
    etiqueta: "Mercado",
    etiquetaDestacada: true,
    descripcion: "Compra-venta de libros, calculadoras, asesorías y servicios entre alumnos",
    icono: "hub",
    fondoIcono: "bg-tertiary-fixed text-tertiary",
    prompt: "¿A dónde voy para vender o comprar libros o materiales?",
    rutaDirecta: "/comunidad",
  },
  {
    id: "publicar",
    titulo: "Publicar Contenido",
    etiqueta: "Crear",
    descripcion: "Difunde eventos, proyectos, preguntas o encuestas en tu campus",
    icono: "publicar",
    fondoIcono: "bg-primary text-on-primary",
    prompt: "¿Cómo publicar un aviso, pregunta o encuesta?",
  },
  {
    id: "perfil",
    titulo: "Perfil y Credencial Digital",
    etiqueta: "Mi Carnet",
    descripcion: "Consulta tu matrícula, recompensas y credencial oficial con QR",
    icono: "perfil",
    fondoIcono: "bg-surface-container-high text-on-surface",
    prompt: "¿Dónde veo mi credencial digital y mis recompensas?",
    rutaDirecta: "/perfil",
  },
];

export const ENLACES_RAPIDOS_GRID: EnlaceRapido[] = [
  {
    id: "calendario",
    titulo: "Calendario Oficial",
    subtitulo: "Fechas UAQ",
    icono: "calendario",
    fondoIcono: "bg-secondary-fixed text-on-secondary-container",
    prompt: "¿Dónde está el calendario escolar oficial?",
  },
  {
    id: "pago",
    titulo: "Ficha de Pago",
    subtitulo: "Reinscripción",
    icono: "pago",
    fondoIcono: "bg-emerald-100 text-emerald-800",
    prompt: "¿Cómo descargo la ficha de pago de reinscripción?",
  },
  {
    id: "rutas",
    titulo: "Rutas Campus",
    subtitulo: "Horarios Ruta UAQ",
    icono: "rutas",
    fondoIcono: "bg-tertiary-fixed text-tertiary",
    prompt: "¿Cuáles son las rutas y horarios del transporte UAQ?",
  },
  {
    id: "biblioteca",
    titulo: "Biblioteca y Carnet",
    subtitulo: "Trámites",
    icono: "biblioteca",
    fondoIcono: "bg-surface-container text-secondary",
    prompt: "¿Cómo tramito mi reposición de credencial o acceso a biblioteca?",
  },
];

export const CHIPS_INPUT_QUA: ChipRapido[] = [
  {
    id: "chip-que",
    label: "¿Qué puedo hacer?",
    icono: "help",
    prompt: "¿Qué puedo hacer en UAQnecta?",
  },
  {
    id: "chip-portal",
    label: "Portal Alumnos",
    icono: "school",
    prompt: "¿Cómo entro al Portal de Alumnos UAQ?",
  },
  {
    id: "chip-calendario",
    label: "Calendario",
    icono: "calendar",
    prompt: "¿Dónde consulto las fechas del calendario escolar?",
  },
  {
    id: "chip-hub",
    label: "Hub",
    icono: "store",
    prompt: "¿Cómo funciona el Hub Universitario para libros y servicios?",
  },
  {
    id: "chip-credencial",
    label: "Credencial",
    icono: "badge",
    prompt: "Llévame a mi perfil y credencial digital",
  },
];

export const QUA_INSTRUCCIONES = `Eres Qua, la guía oficial de 'Comunidad UAQ / UAQnecta'.
Objetivo primordial: RESPONDER SIN RODEOS, RÁPIDO, CONCISO Y DIRECTO.
1. Responde siempre en español amable universitario y en máximo 2-3 oraciones claras o viñetas breves.
2. Guía al estudiante a las secciones reales de la app usando 'navegarA' cuando pida ir o ver algo específico:
   - '/' : Tablón de Anuncios Oficiales
   - '/comunidad' : Comunidad Estudiantil, Hub Universitario, foros y preguntas en vivo
   - '/perfil' : Perfil de Estudiante y Credencial Digital QR
   - '/perfil/recompensas' : Vitrina de Recompensas, Insignias y Validación de Asistencia
   - '/perfil/ajustes' : Ajustes de Cuenta y Seguridad (donde correo y expediente son inmutables)
   - '/facultades' : Gestión de Facultades
3. Para el Portal de Alumnos externo (kárdex, reinscripción, ficha de pago oficial), menciona el portal oficial https://comunidad.uaq.mx o los trámites académicos dentro de su perfil.
4. Solo ejecuta 'navegarA' si el usuario pide explícitamente abrir, ir o llevarlo a una sección.
5. Solo ejecuta 'verificarFacultades' si pregunta por la lista de facultades del sistema.`;

