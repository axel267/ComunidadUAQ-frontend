"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePerfil } from "@/context/PerfilContext";
import { usePublicaciones } from "@/hooks/usePublicaciones";

type PublicacionesContextValue = ReturnType<typeof usePublicaciones>;

const PublicacionesContext = createContext<PublicacionesContextValue | null>(null);

export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const { perfil } = usePerfil();
  const autor = useMemo(
    () => ({
      nombre: perfil.nombre,
      siglas: perfil.siglas,
      facultad: perfil.facultad,
      etiqueta: `Informática ${perfil.facultadSigla === "FIF" ? "UAQ" : perfil.facultadSigla}`,
    }),
    [perfil.nombre, perfil.siglas, perfil.facultad, perfil.facultadSigla]
  );
  const valor = usePublicaciones(autor);
  return <PublicacionesContext.Provider value={valor}>{children}</PublicacionesContext.Provider>;
}

export function usePublicacionesApp() {
  const ctx = useContext(PublicacionesContext);
  if (!ctx) throw new Error("usePublicacionesApp debe usarse dentro de <AppProviders>.");
  return ctx;
}
