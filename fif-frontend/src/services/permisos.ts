import { getStoredSession, type AuthUser } from "./auth";

const ROLES_AUTORIZADOS_EVENTOS = [1, 3, 4];

export function puedeCrearEventos(user?: AuthUser | null): boolean {
  const actual = user ?? getStoredSession()?.user;
  if (!actual) return false;
  if (actual.rolId !== undefined && ROLES_AUTORIZADOS_EVENTOS.includes(actual.rolId)) {
    return true;
  }
  const rolNorm = (actual.rol || "").toLowerCase();
  return (
    rolNorm.includes("docente") ||
    rolNorm.includes("profesor") ||
    rolNorm.includes("coordin") ||
    rolNorm.includes("admin")
  );
}
