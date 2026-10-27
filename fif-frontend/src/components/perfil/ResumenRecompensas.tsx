"use client";

import Link from "next/link";
import { ChevronRight, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useRecompensas } from "@/context/RecompensasContext";

// Resumen de puntos y nivel; lleva a la vitrina completa de recompensas.
export function ResumenRecompensas() {
  const { puntos, nivel, insignias } = useRecompensas();
  const desbloqueadas = insignias.filter((i) => i.estado === "desbloqueada").length;
  const { actual, siguiente } = nivel;
  const meta = siguiente?.minimo ?? actual.minimo;
  const porcentaje = siguiente ? Math.min(100, Math.round((puntos.total / meta) * 100)) : 100;

  return (
    <Link
      href="/perfil/recompensas"
      className="group block relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-on-primary flex items-center justify-center shadow-sm shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-label-sm font-inter text-secondary uppercase tracking-wider">Mis recompensas</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-headline-lg text-on-surface">{puntos.total}</span>
              <span className="text-label-sm font-inter text-secondary">Pts UAQ</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-right">
          <div>
            <span className="block text-label-lg text-primary font-bold">Nivel {actual.numero}</span>
            <span className="block text-label-sm font-inter text-secondary">{desbloqueadas} insignias</span>
          </div>
          <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div className="mt-space-sm flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-label-sm font-inter text-on-surface-variant">
          <span className="flex items-center gap-1">
            {siguiente ? <TrendingUp className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {siguiente ? `Hacia Nivel ${siguiente.numero}: ${siguiente.rango}` : `Máximo nivel: ${actual.rango}`}
          </span>
          <span className="font-semibold text-on-surface">
            {siguiente ? `${puntos.total} / ${meta} Pts` : `${puntos.total} Pts`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentaje}
          aria-label="Progreso al siguiente nivel"
          className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-container to-tertiary-container transition-all duration-700"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
