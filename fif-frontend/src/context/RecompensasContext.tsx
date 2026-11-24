"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Award } from "lucide-react";
import {
  INSIGNIAS_INICIALES,
  PUNTOS_INICIALES,
  PUNTOS_POR_ASISTENCIA_EVENTO,
  nivelPorPuntos,
  type Insignia,
  type ResumenPuntos,
} from "@/data/recompensas";
import { getAsistenciasLista, type AsistenciaRegistroBackend } from "@/services/api";
import { getStoredSession } from "@/services/auth";

export type ResultadoAcreditacion =
  | { ok: true; insignia: Insignia; folio: string }
  | { ok: false; motivo: string };

interface RecompensasContextValue {
  insignias: Insignia[];
  puntos: ResumenPuntos;
  nivel: ReturnType<typeof nivelPorPuntos>;
  acreditar: (codigo: string) => ResultadoAcreditacion;
  recargarAsistencias: () => Promise<void>;
}

const RecompensasContext = createContext<RecompensasContextValue | null>(null);

function fechaHoy() {
  return new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

function formatearFechaAsistencia(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fechaHoy();
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

function mapearAsistenciaAInsignia(item: AsistenciaRegistroBackend): Insignia {
  const pts = item.puntosOtorgados ?? PUNTOS_POR_ASISTENCIA_EVENTO;
  return {
    id: `asistencia-qr-${item.id}`,
    origen: "evento",
    facultad: "fif",
    estado: "desbloqueada",
    titulo: item.eventoTitulo || "Asistencia a Evento Institucional",
    descripcion: `Asistencia verificada por QR (${item.tomadoPorNombre}). Expediente EXP-${item.expediente}.`,
    puntos: pts,
    etiqueta: `+${pts} Pts · Asistencia QR`,
    etiquetaClases: "bg-emerald-50 text-emerald-700",
    icono: Award,
    emblemaClases: "from-primary to-tertiary-container",
    fecha: formatearFechaAsistencia(item.fechaRegistro),
    folio: `UAQ-QR-${item.id}`,
    validacion: "Pase de Lista QR",
  };
}

export function RecompensasProvider({ children }: { children: ReactNode }) {
  const [insigniasBase, setInsigniasBase] = useState<Insignia[]>(INSIGNIAS_INICIALES);
  const [puntosManuales, setPuntosManuales] = useState<number>(0);
  const [asistenciasUsuario, setAsistenciasUsuario] = useState<AsistenciaRegistroBackend[]>([]);

  const recargarAsistencias = useCallback(async () => {
    const session = getStoredSession();
    const user = session?.user;
    if (!user) {
      setAsistenciasUsuario([]);
      return;
    }
    try {
      const todas = await getAsistenciasLista();
      const expUsuario = user.expediente != null ? String(user.expediente) : "";
      const propias = todas.filter(
        (a) =>
          (user.id && a.estudianteId === user.id) ||
          (expUsuario && a.expediente === expUsuario)
      );
      setAsistenciasUsuario(propias);
    } catch {
      setAsistenciasUsuario([]);
    }
  }, []);

  useEffect(() => {
    recargarAsistencias();
    const onUpdate = () => {
      recargarAsistencias();
    };
    window.addEventListener("uaq:asistencia-actualizada", onUpdate);
    return () => window.removeEventListener("uaq:asistencia-actualizada", onUpdate);
  }, [recargarAsistencias]);

  const acreditar = useCallback(
    (codigoCrudo: string): ResultadoAcreditacion => {
      const codigo = codigoCrudo.trim().toUpperCase();
      if (!codigo) return { ok: false, motivo: "Ingresa el código que entregó la mesa del evento." };

      const objetivo = insigniasBase.find((i) => i.codigo === codigo);
      if (!objetivo) return { ok: false, motivo: "El código no es válido o ya expiró. Verifica con la mesa del evento." };
      if (objetivo.estado === "desbloqueada") {
        return { ok: false, motivo: `Ya acreditaste tu asistencia a “${objetivo.titulo}”.` };
      }

      const folio = `UAQ-EVT-${Math.floor(1000 + Math.random() * 9000)}`;
      const desbloqueada: Insignia = {
        ...objetivo,
        puntos: PUNTOS_POR_ASISTENCIA_EVENTO,
        estado: "desbloqueada",
        fecha: fechaHoy(),
        folio,
        validacion: "Verificado en Campus",
        requisito: undefined,
        nota: undefined,
      };
      setInsigniasBase((actuales) => actuales.map((i) => (i.id === objetivo.id ? desbloqueada : i)));
      setPuntosManuales((prev) => prev + PUNTOS_POR_ASISTENCIA_EVENTO);
      return { ok: true, insignia: desbloqueada, folio };
    },
    [insigniasBase]
  );

  const puntosAsistenciasQr = useMemo(
    () =>
      asistenciasUsuario.reduce(
        (acc, item) => acc + (item.puntosOtorgados ?? PUNTOS_POR_ASISTENCIA_EVENTO),
        0
      ),
    [asistenciasUsuario]
  );

  const puntos = useMemo<ResumenPuntos>(() => {
    const extraEventos = puntosAsistenciasQr + puntosManuales;
    return {
      total: PUNTOS_INICIALES.total + extraEventos,
      eventos: PUNTOS_INICIALES.eventos + extraEventos,
      solidarios: PUNTOS_INICIALES.solidarios,
    };
  }, [puntosAsistenciasQr, puntosManuales]);

  const insignias = useMemo<Insignia[]>(() => {
    const deQr = asistenciasUsuario.map(mapearAsistenciaAInsignia);
    return [...deQr, ...insigniasBase];
  }, [asistenciasUsuario, insigniasBase]);

  const valor = useMemo(
    () => ({
      insignias,
      puntos,
      nivel: nivelPorPuntos(puntos.total),
      acreditar,
      recargarAsistencias,
    }),
    [insignias, puntos, acreditar, recargarAsistencias]
  );

  return <RecompensasContext.Provider value={valor}>{children}</RecompensasContext.Provider>;
}

export function useRecompensas() {
  const ctx = useContext(RecompensasContext);
  if (!ctx) throw new Error("useRecompensas debe usarse dentro de <AppProviders>.");
  return ctx;
}
