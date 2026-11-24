import { getApiBaseUrl } from "./api";
import { getAccessToken } from "./auth";

export type UrgenciaComunicado = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

export interface ComunicadoOficial {
  id: number;
  titulo: string;
  resumen: string | null;
  contenido: string;
  urgencia: UrgenciaComunicado;
  fechaLimite: string | null;
  fechaPublicacion: string;
  activo: boolean;
  adjuntoUrl: string | null;
  adjuntoNombre: string | null;
  adjuntoTamano: number | null;
  autorId: number | null;
  autor: { id: number; nombre: string; area: string | null } | null;
  facultad: { id: number; nombre: string; abreviatura: string } | null;
}

export interface DatosComunicado {
  titulo: string;
  resumen?: string | null;
  contenido: string;
  urgencia: UrgenciaComunicado;
  fechaLimite?: string | null;
  adjuntoUrl?: string | null;
  adjuntoNombre?: string | null;
  adjuntoTamano?: number | null;
}

export interface AdjuntoSubido {
  adjuntoUrl: string;
  adjuntoNombre: string;
  adjuntoTamano: number;
}

async function pedir<T>(ruta: string, init: RequestInit, errorPorDefecto: string): Promise<T> {
  const token = getAccessToken();
  const esJson = typeof init.body === "string";
  const res = await fetch(`${getApiBaseUrl()}${ruta}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...(esJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    const mensaje = Array.isArray(cuerpo?.message) ? cuerpo.message.join(", ") : cuerpo?.message;
    throw new Error(mensaje || errorPorDefecto);
  }

  const texto = await res.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

export const getComunicadoOficialActivo = () =>
  pedir<ComunicadoOficial | null>("/avisos/oficial/activo", {}, "No se pudo cargar el comunicado oficial");

export const crearComunicadoOficial = (datos: DatosComunicado) =>
  pedir<ComunicadoOficial>(
    "/avisos/oficial",
    { method: "POST", body: JSON.stringify(datos) },
    "No se pudo publicar el comunicado oficial"
  );

export const actualizarComunicadoOficial = (id: number, datos: Partial<DatosComunicado>) =>
  pedir<ComunicadoOficial>(
    `/avisos/oficial/${id}`,
    { method: "PATCH", body: JSON.stringify(datos) },
    "No se pudo actualizar el comunicado oficial"
  );

export const desactivarComunicadoOficial = (id: number) =>
  pedir<{ message: string }>(
    `/avisos/oficial/${id}`,
    { method: "DELETE" },
    "No se pudo desactivar el comunicado oficial"
  );

export const subirAdjuntoComunicado = (archivo: File) => {
  const formulario = new FormData();
  formulario.append("archivo", archivo);
  return pedir<AdjuntoSubido>(
    "/avisos/oficial/adjunto",
    { method: "POST", body: formulario },
    "No se pudo subir el archivo adjunto"
  );
};

export const urlAdjuntoAbsoluta = (ruta: string) =>
  /^https?:\/\//.test(ruta) ? ruta : `${getApiBaseUrl()}${ruta}`;
