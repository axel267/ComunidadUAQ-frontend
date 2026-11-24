"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DatosEncuestaPublicacion } from "@/data/publicaciones";
import { votarEncuestaApi } from "@/services/api";
import { getStoredSession } from "@/services/auth";

interface CacheVotoLocal {
  seleccionada: number | null;
  votos: number[];
}

function claveCache(publicacionId: string, userId?: number): string {
  return `fif_encuesta_${userId ?? "anon"}_${publicacionId}`;
}

function leerCache(publicacionId: string, totalOpciones: number, userId?: number): CacheVotoLocal | null {
  try {
    const raw = localStorage.getItem(claveCache(publicacionId, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheVotoLocal;
    if (!Array.isArray(parsed.votos) || parsed.votos.length !== totalOpciones) return null;
    return parsed;
  } catch {
    return null;
  }
}

function guardarCache(publicacionId: string, estado: CacheVotoLocal, userId?: number): void {
  try {
    localStorage.setItem(claveCache(publicacionId, userId), JSON.stringify(estado));
  } catch {}
}

export function useVotoEncuesta(publicacionId: string, encuesta: DatosEncuestaPublicacion) {
  const userId = getStoredSession()?.user?.id;
  const totalOpciones = encuesta.opciones.length;

  const estadoInicial = useMemo((): CacheVotoLocal => {
    const tieneRemotos = Array.isArray(encuesta.votosPorOpcion) && encuesta.votosPorOpcion.length === totalOpciones;
    if (tieneRemotos) {
      const votoUsuario =
        userId !== undefined && encuesta.votosUsuarios?.[String(userId)] !== undefined
          ? encuesta.votosUsuarios[String(userId)]
          : null;
      return {
        votos: encuesta.opciones.map((_, i) => encuesta.votosPorOpcion?.[i] ?? 0),
        seleccionada: votoUsuario,
      };
    }
    return (
      leerCache(publicacionId, totalOpciones, userId) ?? {
        votos: encuesta.opciones.map(() => 0),
        seleccionada: null,
      }
    );
  }, [publicacionId, encuesta, totalOpciones, userId]);

  const [votos, setVotos] = useState<number[]>(estadoInicial.votos);
  const [seleccionada, setSeleccionada] = useState<number | null>(estadoInicial.seleccionada);

  useEffect(() => {
    setVotos(estadoInicial.votos);
    setSeleccionada(estadoInicial.seleccionada);
  }, [estadoInicial]);

  const votar = useCallback(
    (opcionIndex: number) => {
      if (opcionIndex < 0 || opcionIndex >= totalOpciones) return;

      const siguienteVotos = [...votos];
      if (seleccionada !== null && seleccionada >= 0 && seleccionada < totalOpciones) {
        siguienteVotos[seleccionada] = Math.max(0, siguienteVotos[seleccionada] - 1);
      }

      const nuevaSeleccion = seleccionada === opcionIndex ? null : opcionIndex;
      if (nuevaSeleccion !== null) {
        siguienteVotos[nuevaSeleccion] = (siguienteVotos[nuevaSeleccion] ?? 0) + 1;
      }

      setVotos(siguienteVotos);
      setSeleccionada(nuevaSeleccion);
      guardarCache(publicacionId, { votos: siguienteVotos, seleccionada: nuevaSeleccion }, userId);

      const numId = Number(publicacionId);
      if (Number.isNaN(numId)) return;

      votarEncuestaApi(numId, {
        opcionIndex,
        usuarioId: userId,
        encuestaFallback: encuesta,
      })
        .then((actualizada) => {
          const remota = actualizada.encuesta;
          if (!remota?.votosPorOpcion) return;
          const votosServidor = encuesta.opciones.map((_, i) => remota.votosPorOpcion?.[i] ?? 0);
          const selServidor =
            userId !== undefined && remota.votosUsuarios?.[String(userId)] !== undefined
              ? remota.votosUsuarios[String(userId)]
              : nuevaSeleccion;
          setVotos(votosServidor);
          setSeleccionada(selServidor);
          guardarCache(publicacionId, { votos: votosServidor, seleccionada: selServidor }, userId);
        })
        .catch(() => {});
    },
    [publicacionId, encuesta, totalOpciones, userId, votos, seleccionada]
  );

  const totalVotos = useMemo(() => votos.reduce((acc, v) => acc + v, 0), [votos]);

  const porcentajes = useMemo(
    () => votos.map((v) => (totalVotos > 0 ? Math.round((v / totalVotos) * 100) : 0)),
    [votos, totalVotos]
  );

  return { votos, porcentajes, totalVotos, seleccionada, votar };
}
