"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  INSIGNIAS_INICIALES,
  PUNTOS_INICIALES,
  nivelPorPuntos,
  type Insignia,
  type ResumenPuntos,
} from "@/data/recompensas";

export type ResultadoAcreditacion =
  | { ok: true; insignia: Insignia; folio: string }
  | { ok: false; motivo: string };

interface RecompensasContextValue {
  insignias: Insignia[];
  puntos: ResumenPuntos;
  nivel: ReturnType<typeof nivelPorPuntos>;
  acreditar: (codigo: string) => ResultadoAcreditacion;
}

const RecompensasContext = createContext<RecompensasContextValue | null>(null);

function fechaHoy() {
  return new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

// TODO: la validación de códigos y el cálculo de puntos deben hacerse en el backend, no en el cliente.
export function RecompensasProvider({ children }: { children: ReactNode }) {
  const [insignias, setInsignias] = useState<Insignia[]>(INSIGNIAS_INICIALES);
  const [puntos, setPuntos] = useState<ResumenPuntos>(PUNTOS_INICIALES);

  const acreditar = useCallback(
    (codigoCrudo: string): ResultadoAcreditacion => {
      const codigo = codigoCrudo.trim().toUpperCase();
      if (!codigo) return { ok: false, motivo: "Ingresa el código que entregó la mesa del evento." };

      const objetivo = insignias.find((i) => i.codigo === codigo);
      if (!objetivo) return { ok: false, motivo: "El código no es válido o ya expiró. Verifica con la mesa del evento." };
      if (objetivo.estado === "desbloqueada") {
        return { ok: false, motivo: `Ya acreditaste tu asistencia a “${objetivo.titulo}”.` };
      }

      const folio = `UAQ-EVT-${Math.floor(1000 + Math.random() * 9000)}`;
      const desbloqueada: Insignia = {
        ...objetivo,
        estado: "desbloqueada",
        fecha: fechaHoy(),
        folio,
        validacion: "Verificado en Campus",
        requisito: undefined,
        nota: undefined,
      };
      setInsignias((actuales) => actuales.map((i) => (i.id === objetivo.id ? desbloqueada : i)));
      setPuntos((p) => ({ ...p, total: p.total + objetivo.puntos, eventos: p.eventos + objetivo.puntos }));
      return { ok: true, insignia: desbloqueada, folio };
    },
    [insignias]
  );

  const valor = useMemo(
    () => ({ insignias, puntos, nivel: nivelPorPuntos(puntos.total), acreditar }),
    [insignias, puntos, acreditar]
  );
  return <RecompensasContext.Provider value={valor}>{children}</RecompensasContext.Provider>;
}

export function useRecompensas() {
  const ctx = useContext(RecompensasContext);
  if (!ctx) throw new Error("useRecompensas debe usarse dentro de <AppProviders>.");
  return ctx;
}
