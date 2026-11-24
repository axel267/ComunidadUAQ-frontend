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
  "/tramites": "Trámites y Guías Escolares",
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
    prompt: "¿Qué puedo hacer en Comunidad UAQ?",
  },
  {
    id: "chip-tramites",
    label: "Trámites",
    icono: "school",
    prompt: "Llévame a los trámites escolares",
  },
  {
    id: "chip-calendario",
    label: "Avisos",
    icono: "calendar",
    prompt: "Llévame a los avisos oficiales",
  },
  {
    id: "chip-hub",
    label: "Comunidad",
    icono: "store",
    prompt: "Llévame a la comunidad y foros",
  },
  {
    id: "chip-credencial",
    label: "Credencial",
    icono: "badge",
    prompt: "Llévame a mi perfil y credencial digital",
  },
];

export const QUA_INSTRUCCIONES = `Eres Qua, el asistente y guía virtual oficial de la plataforma 'Comunidad UAQ'.
OBJETIVO: Ayudar al estudiante de forma directa, rápida y guiándolo EXCLUSIVAMENTE a las secciones dentro de esta aplicación.

REGLAS ESTRICTAS DE RESPUESTA:
1. ENFOQUE EXCLUSIVO EN LA APLICACIÓN:
   - NUNCA menciones ni envíes al usuario a sitios web externos (como servicios.uaq.mx, portales externos o enlaces fuera de la app) ni a oficinas físicas.
   - Todo se atiende y se consulta dentro de las secciones de Comunidad UAQ.

2. NAVEGACIÓN Y SECCIONES INTERNAS:
   - Trámites escolares (titulación, reinscripciones, bajas, constancias, formatos, requisitos paso a paso): Dirige al usuario a '/tramites' y EJECUTA SIEMPRE la acción 'navegarA' con ruta '/tramites'.
   - Avisos, noticias y comunicados de Rectoría o Facultades: Dirige al usuario a '/' y usa 'navegarA' a '/'.
   - Comunidad estudiantil, foros de carreras y Hub universitario (compra/venta de libros, asesorías): Dirige al usuario a '/comunidad' y usa 'navegarA' a '/comunidad'.
   - Perfil del estudiante y Credencial Digital con código QR: Dirige al usuario a '/perfil' y usa 'navegarA' a '/perfil'.
   - Recompensas, insignias y asistencia a eventos: Dirige al usuario a '/perfil/recompensas' y usa 'navegarA' a '/perfil/recompensas'.
   - Ajustes de cuenta y seguridad: Dirige al usuario a '/perfil/ajustes' y usa 'navegarA' a '/perfil/ajustes'.

3. USO DE LA ACCIÓN 'navegarA':
   - Cada vez que el usuario pregunte por trámites o manifieste interés en consultar o ir a una sección, ejecuta de inmediato la herramienta 'navegarA' para transportarlo a la ruta correspondiente dentro de la aplicación.

4. FORMATO:
   - Responde en máximo 1 o 2 oraciones breves y claras explicando qué encontrará en esa sección mientras lo rediriges.`;

