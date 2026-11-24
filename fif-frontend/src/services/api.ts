import { Banknote, Landmark, AlertTriangle, BookOpen } from "lucide-react";
import type { Aviso, CategoriaAviso } from "@/data/avisos";
import type { PostComunidad, ComentarioComunidad, FiltroComunidad } from "@/data/comunidad";
import type { DatosEncuestaPublicacion, DuracionEncuesta } from "@/data/publicaciones";
import { calcularSiglas } from "@/data/perfil";
import { getAccessToken, getStoredSession } from "./auth";
import { mapearComentariosForo, type ComentarioForoBackend } from "./comentariosMapper";

export const getApiBaseUrl = (): string => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const API_URL = {
  toString: () => getApiBaseUrl(),
  valueOf: () => getApiBaseUrl(),
} as unknown as string;

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Facultade {
  id: number;
  nombre: string;
  abreviatura: string;
}

export const getFacultades = async (): Promise<Facultade[]> => {
  const res = await fetch(`${API_URL}/facultades`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener las facultades');
  return res.json();
};

export const createFacultade = async (data: Omit<Facultade, 'id'>): Promise<Facultade> => {
  const res = await fetch(`${API_URL}/facultades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear la facultad');
  return res.json();
};

export const deleteFacultade = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/facultades/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar la facultad');
};

export interface PasoGuia {
  id: number;
  guiaId: number;
  ordenPaso: number;
  tituloPaso: string;
  descripcionDetallada: string;
  imagenIlustrativaUrl?: string | null;
}

export interface GuiaTramite {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl?: string | null;
  autorId?: number;
  facultadId?: number;
  facultad?: {
    id: number;
    nombre: string;
    abreviatura: string;
  };
  pasos: PasoGuia[];
}

export const getGuiasTramites = async (): Promise<GuiaTramite[]> => {
  const res = await fetch(`${API_URL}/guias-tramites`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener las guías de trámites');
  return res.json();
};

export interface CreateGuiaTramitePayload {
  titulo: string;
  descripcion?: string;
  facultadId: number;
  imagenUrl?: string;
  pasos?: {
    ordenPaso?: number;
    tituloPaso?: string;
    descripcionDetallada?: string;
    imagenIlustrativaUrl?: string;
  }[];
}

export const createGuiaTramite = async (data: CreateGuiaTramitePayload): Promise<GuiaTramite> => {
  const res = await fetch(`${API_URL}/guias-tramites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al crear la guía de trámite");
  }
  return res.json();
};

export const deleteGuiaTramite = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/guias-tramites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar la guía de trámite");
};

export interface UpdateGuiaTramitePayload {
  titulo?: string;
  descripcion?: string;
  facultadId?: number;
  imagenUrl?: string;
  pasos?: {
    id?: number;
    ordenPaso?: number;
    tituloPaso?: string;
    descripcionDetallada?: string;
    imagenIlustrativaUrl?: string;
  }[];
}

export const updateGuiaTramite = async (
  id: number,
  data: UpdateGuiaTramitePayload,
): Promise<GuiaTramite> => {
  const res = await fetch(`${API_URL}/guias-tramites/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al actualizar la guía de trámite");
  }
  return res.json();
};

export interface FechaClaveBackend {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  etiqueta: string;
  facultadId?: number;
  facultad?: Facultade;
}

export const getFechasClave = async (): Promise<FechaClaveBackend[]> => {
  const res = await fetch(`${API_URL}/fechas-clave`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener fechas clave');
  return res.json();
};

export interface CreateFechaClavePayload {
  titulo: string;
  descripcion?: string;
  fecha: string;
  etiqueta?: string;
  facultadId?: number;
}

export const createFechaClave = async (
  data: CreateFechaClavePayload,
): Promise<FechaClaveBackend> => {
  const res = await fetch(`${API_URL}/fechas-clave`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || 'Error al crear la fecha clave');
  }
  return res.json();
};

export const updateFechaClave = async (
  id: number,
  data: Partial<CreateFechaClavePayload>,
): Promise<FechaClaveBackend> => {
  const res = await fetch(`${API_URL}/fechas-clave/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || 'Error al actualizar la fecha clave');
  }
  return res.json();
};

export const deleteFechaClave = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/fechas-clave/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar fecha clave');
};

// Modelo que devuelve NestJS desde PostgreSQL
export interface AvisoBackend {
  id: number;
  titulo: string;
  contenido: string;
  urgencia: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  imagenesPortadaUrl?: string;
  fechaPublicacion: string;
  facultad?: {
    id: number;
    nombre: string;
    abreviatura: string;
  };
  autor?: {
    id: number;
    nombre: string;
  };
}

// Función para obtener y transformar los avisos
export const getAvisos = async (): Promise<Aviso[]> => {
  const res = await fetch(`${API_URL}/avisos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener los comunicados de la universidad");

  const datos: AvisoBackend[] = await res.json();

  return datos.map((item) => {
    // Mapear urgencia a categoría visual
    let categoria: CategoriaAviso = "academico";
    let icono = BookOpen;
    let etiquetaClases = "bg-primary-fixed text-on-primary-fixed";
    let iconoWrapperClases = "bg-secondary-container text-primary";

    if (item.urgencia === "URGENTE") {
      categoria = "urgente";
      icono = AlertTriangle;
      etiquetaClases = "bg-red-100 text-red-800 font-semibold";
      iconoWrapperClases = "bg-red-50 text-red-600";
    } else if (item.titulo.toLowerCase().includes("beca")) {
      categoria = "becas";
      icono = Banknote;
      etiquetaClases = "bg-emerald-100 text-emerald-800";
      iconoWrapperClases = "bg-emerald-50 text-emerald-600";
    } else if (item.titulo.toLowerCase().includes("torneo") || item.titulo.toLowerCase().includes("feria")) {
      categoria = "eventos";
      icono = Landmark;
      etiquetaClases = "bg-amber-100 text-amber-800";
      iconoWrapperClases = "bg-amber-50 text-amber-600";
    }

    return {
      id: String(item.id),
      autor: item.autor?.nombre || item.facultad?.nombre || "Comunidad UAQ",
      verificado: true,
      tiempo: new Date(item.fechaPublicacion).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      }),
      referencia: `Aviso #${item.id}`,
      categoria,
      etiqueta: item.facultad?.abreviatura || item.urgencia,
      etiquetaClases,
      icono,
      iconoWrapperClases,
      titulo: item.titulo,
      descripcion: item.contenido,
      conImagen: Boolean(item.imagenesPortadaUrl),
      imagenUrl: item.imagenesPortadaUrl ?? undefined,
      fechaPublicacion: item.fechaPublicacion,
    };
  });
};

export const getAvisosUrgentesPendientes = async (): Promise<AvisoBackend[]> => {
  if (!getAccessToken()) {
    throw new Error("Debes iniciar sesión para consultar las alertas pendientes.");
  }
  const res = await fetch(`${API_URL}/avisos/urgentes/pendientes`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "No se pudieron cargar las alertas pendientes.");
  }
  return res.json();
};

export const confirmarLecturaAviso = async (
  avisoId: number | string
): Promise<{ message: string; yaLeido: boolean }> => {
  if (!getAccessToken()) {
    throw new Error("Debes iniciar sesión para confirmar la lectura.");
  }
  const res = await fetch(`${API_URL}/avisos/${avisoId}/leer`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al confirmar la lectura del aviso");
  }
  return res.json();
};

export interface CreateAvisoPayload {
  titulo: string;
  contenido?: string;
  urgencia: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  facultadId?: number | null;
  imagenesPortadaUrl?: string;
}

export const createAviso = async (data: CreateAvisoPayload): Promise<AvisoBackend> => {
  const res = await fetch(`${API_URL}/avisos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al crear el aviso");
  }
  return res.json();
};

export const deleteAviso = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/avisos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar el aviso");
};

// Modelo que devuelve el backend desde la tabla foro_publicaciones
export interface PublicacionBackend {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  votos: number;
  esFijado: boolean;
  imagenesUrl?: string | null;
  fechaCreacion: string;
  autorId?: number;
  encuesta?: DatosEncuestaPublicacion | null;
  autor: {
    id: number;
    nombre: string;
    carrera?: string;
  };
  comentarios?: ComentarioForoBackend[];
}

export const getPostsComunidad = async (): Promise<PostComunidad[]> => {
  const res = await fetch(`${API_URL}/foros`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener las publicaciones de la comunidad");

  const datos: PublicacionBackend[] = await res.json();
  const usuarioActualId = getStoredSession()?.user?.id;

  return datos.map((item) => {
    // Clasificar en los filtros de la interfaz
    const categoriasFiltro: FiltroComunidad[] = ["para-ti"];
    if (item.votos > 5) categoriasFiltro.push("tendencias");
    if (item.titulo.includes("?") || item.contenido.includes("?")) {
      categoriasFiltro.push("dudas");
    }
    categoriasFiltro.push("carrera");

    const comentariosLista: ComentarioComunidad[] = mapearComentariosForo(item.comentarios, usuarioActualId);
    const encuesta = item.encuesta?.opciones?.length
      ? {
          pregunta: item.encuesta.pregunta,
          opciones: item.encuesta.opciones,
          duracion: (item.encuesta.duracion as DuracionEncuesta) || "3d",
          votosPorOpcion: item.encuesta.votosPorOpcion,
          votosUsuarios: item.encuesta.votosUsuarios,
        }
      : undefined;

    return {
      id: String(item.id),
      tipo: item.titulo.includes("?") ? "pregunta" : "debate",
      categoriasFiltro,
      autor: {
        nombre: item.autor.nombre,
        siglas: calcularSiglas(item.autor.nombre),
        avatarClases: "bg-primary-fixed text-on-primary-fixed",
        facultad: item.autor.carrera || "Facultad de Informática",
        facultadClases: "bg-primary-fixed text-on-primary-fixed",
        verificado: true,
      },
      subtituloTiempo: new Date(item.fechaCreacion).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      }),
      etiquetaDestacada: item.categoria,
      texto: item.titulo,
      textoSecundario: item.contenido,
      fuegos: item.votos || 0,
      encuesta,
      comentariosLista,
    };
  });
};

export const getPostsPorAutor = async (autorId: number): Promise<PublicacionBackend[]> => {
  const res = await fetch(`${API_URL}/foros?autorId=${autorId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
};

export interface CreatePublicacionPayload {
  titulo: string;
  contenido: string;
  categoria?: string;
  imagenesUrl?: string;
  autorId?: number;
  encuesta?: DatosEncuestaPublicacion;
}

export const createPublicacion = async (data: CreatePublicacionPayload): Promise<PublicacionBackend> => {
  const res = await fetch(`${API_URL}/foros`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al crear la publicacion");
  }
  return res.json();
};

export interface VotarEncuestaPayload {
  opcionIndex: number;
  usuarioId?: number;
  encuestaFallback?: DatosEncuestaPublicacion;
}

export const votarEncuestaApi = async (
  publicacionId: number | string,
  payload: VotarEncuestaPayload
): Promise<PublicacionBackend> => {
  const res = await fetch(`${API_URL}/foros/${publicacionId}/encuesta/votar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al registrar voto en la encuesta");
  }
  return res.json();
};

export const votarPublicacion = async (id: number | string, delta: number = 1): Promise<void> => {
  const res = await fetch(`${API_URL}/foros/${id}/votar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta }),
  });
  if (!res.ok) throw new Error("Error al votar por la publicacion");
};

export const deletePublicacion = async (id: number | string): Promise<void> => {
  const res = await fetch(`${API_URL}/foros/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar la publicacion");
};

export interface CreateComentarioPayload {
  publicacionId: number;
  contenido: string;
  comentarioPadreId?: number;
  autorId?: number;
}

export interface ComentarioBackend {
  id: number;
  publicacionId: number;
  contenido: string;
  votos: number;
  fechaCreacion: string;
  autor?: {
    id: number;
    nombre: string;
    carrera?: string;
  };
}

export const getComentariosByPublicacion = async (
  publicacionId: number | string
): Promise<ComentarioBackend[]> => {
  const res = await fetch(`${API_URL}/foros/${publicacionId}/comentarios`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
};

export const createComentario = async (data: CreateComentarioPayload): Promise<ComentarioBackend> => {
  const res = await fetch(`${API_URL}/foros/comentarios`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "Error al comentar");
  }
  return res.json();
};

export const votarComentario = async (id: number | string, delta: number = 1): Promise<void> => {
  const res = await fetch(`${API_URL}/foros/comentarios/${id}/votar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta }),
  });
  if (!res.ok) throw new Error("Error al votar por el comentario");
};

export const deleteComentario = async (id: number | string): Promise<void> => {
  const res = await fetch(`${API_URL}/foros/comentarios/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar el comentario");
};
