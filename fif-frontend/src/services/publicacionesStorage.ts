import type { Publicacion } from "@/data/publicaciones";

const PREFIJO_STORAGE = "fif_publicaciones_usuario";

function claveUsuario(userId: number): string {
  return `${PREFIJO_STORAGE}_${userId}`;
}

function esAdjuntoImagenInvalido(p: Publicacion): boolean {
  const adjunto = p.adjunto;
  if (adjunto?.tipo !== "imagen" || !adjunto.archivo) return false;
  const archivo = adjunto.archivo as unknown;
  return typeof archivo !== "string" && !(archivo instanceof Blob);
}

// La clave global anterior mezclaba publicaciones entre cuentas en el mismo navegador.
export function limpiarStorageLegado(): void {
  try {
    localStorage.removeItem(PREFIJO_STORAGE);
  } catch {}
}

export function leerPublicacionesLocales(userId: number): Publicacion[] {
  try {
    const guardadas = localStorage.getItem(claveUsuario(userId));
    if (!guardadas) return [];
    const parsed = JSON.parse(guardadas);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Publicacion[])
      .filter((p) => p.autorId === userId)
      .map((p) => (esAdjuntoImagenInvalido(p) ? { ...p, adjunto: undefined } : p));
  } catch {
    try {
      localStorage.removeItem(claveUsuario(userId));
    } catch {}
    return [];
  }
}

export function guardarPublicacionesLocales(userId: number | undefined, lista: Publicacion[]): void {
  if (!userId) return;
  try {
    const propias = lista.filter((p) => p.autorId === userId);
    localStorage.setItem(claveUsuario(userId), JSON.stringify(propias));
  } catch {}
}
