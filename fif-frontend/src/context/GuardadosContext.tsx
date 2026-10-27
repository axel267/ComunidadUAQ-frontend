"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface GuardadosContextValue {
  guardados: ReadonlySet<string>;
  estaGuardado: (id: string) => boolean;
  /** Devuelve true si quedó guardado y false si se quitó. */
  alternar: (id: string) => boolean;
}

const GuardadosContext = createContext<GuardadosContextValue | null>(null);

// TODO: persistir en la API cuando el backend exponga "guardados" por usuario.
export function GuardadosProvider({ children }: { children: ReactNode }) {
  const [guardados, setGuardados] = useState<ReadonlySet<string>>(new Set());

  const estaGuardado = useCallback((id: string) => guardados.has(id), [guardados]);

  const alternar = useCallback(
    (id: string) => {
      const quedaGuardado = !guardados.has(id);
      setGuardados((actuales) => {
        const siguiente = new Set(actuales);
        if (quedaGuardado) siguiente.add(id);
        else siguiente.delete(id);
        return siguiente;
      });
      return quedaGuardado;
    },
    [guardados]
  );

  const valor = useMemo(() => ({ guardados, estaGuardado, alternar }), [guardados, estaGuardado, alternar]);
  return <GuardadosContext.Provider value={valor}>{children}</GuardadosContext.Provider>;
}

export function useGuardados() {
  const ctx = useContext(GuardadosContext);
  if (!ctx) throw new Error("useGuardados debe usarse dentro de <AppProviders>.");
  return ctx;
}
