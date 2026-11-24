"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DetalleHost, type DetalleActivo } from "@/components/detalle/DetalleHost";
import type { Aviso } from "@/data/avisos";

interface DetalleContextValue {
  abrirAviso: (aviso: Aviso) => void;
  abrirPublicacion: (id: string) => void;
  abrirPost: (id: string) => void;
  cerrar: () => void;
}

const DetalleContext = createContext<DetalleContextValue | null>(null);

export function DetalleProvider({ children }: { children: ReactNode }) {
  const [activo, setActivo] = useState<DetalleActivo | null>(null);

  const cerrar = useCallback(() => setActivo(null), []);
  const abrirAviso = useCallback((aviso: Aviso) => setActivo({ tipo: "aviso", aviso }), []);
  const abrirPublicacion = useCallback((id: string) => setActivo({ tipo: "publicacion", id }), []);
  const abrirPost = useCallback((id: string) => setActivo({ tipo: "post", id }), []);

  const valor = useMemo(
    () => ({ abrirAviso, abrirPublicacion, abrirPost, cerrar }),
    [abrirAviso, abrirPublicacion, abrirPost, cerrar]
  );

  return (
    <DetalleContext.Provider value={valor}>
      {children}
      <DetalleHost activo={activo} onClose={cerrar} />
    </DetalleContext.Provider>
  );
}

export function useDetalle() {
  const ctx = useContext(DetalleContext);
  if (!ctx) throw new Error("useDetalle debe usarse dentro de <AppProviders>.");
  return ctx;
}
