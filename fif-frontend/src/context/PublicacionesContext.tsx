"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePublicaciones } from "@/hooks/usePublicaciones";

type PublicacionesContextValue = ReturnType<typeof usePublicaciones>;

const PublicacionesContext = createContext<PublicacionesContextValue | null>(null);

export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const valor = usePublicaciones();
  return <PublicacionesContext.Provider value={valor}>{children}</PublicacionesContext.Provider>;
}

export function usePublicacionesApp() {
  const ctx = useContext(PublicacionesContext);
  if (!ctx) throw new Error("usePublicacionesApp debe usarse dentro de <AppProviders>.");
  return ctx;
}
