"use client";

import { CheckCircle2, ChartColumn } from "lucide-react";
import { DURACIONES_ENCUESTA, type DatosEncuestaPublicacion } from "@/data/publicaciones";
import { useVotoEncuesta } from "@/hooks/useVotoEncuesta";

interface EncuestaInteractivaProps {
  publicacionId: string;
  encuesta: DatosEncuestaPublicacion;
}

export function EncuestaInteractiva({ publicacionId, encuesta }: EncuestaInteractivaProps) {
  const { votos, porcentajes, totalVotos, seleccionada, votar } = useVotoEncuesta(publicacionId, encuesta);
  const duracion = DURACIONES_ENCUESTA.find((d) => d.id === encuesta.duracion)?.label ?? encuesta.duracion;
  const mostrarResultados = seleccionada !== null || totalVotos > 0;

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-2.5">
      <p className="flex items-start gap-2 text-label-lg text-on-surface">
        <ChartColumn className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        {encuesta.pregunta}
      </p>

      <ul className="space-y-1.5">
        {encuesta.opciones.map((opcion, idx) => {
          const activa = seleccionada === idx;
          const pct = porcentajes[idx] ?? 0;
          const conteo = votos[idx] ?? 0;

          return (
            <li key={idx}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => votar(idx)}
                className={`relative w-full overflow-hidden flex items-center justify-between gap-2 bg-surface-container-lowest border rounded-lg px-3 py-2 text-body-md text-left transition-all active:scale-[0.99] ${
                  activa
                    ? "border-primary ring-1 ring-primary/40 text-on-surface font-semibold"
                    : "border-outline-variant text-on-surface hover:border-primary/50"
                }`}
              >
                {mostrarResultados && (
                  <span
                    aria-hidden="true"
                    style={{ width: `${pct}%` }}
                    className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                      activa ? "bg-primary/15" : "bg-surface-container-high/80"
                    }`}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2 min-w-0">
                  {activa ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-outline-variant shrink-0" />
                  )}
                  <span className="truncate">{opcion}</span>
                </span>

                {mostrarResultados && (
                  <span className="relative z-10 text-label-sm font-mono text-secondary shrink-0">
                    {pct}% ({conteo})
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between text-label-sm text-secondary pt-0.5">
        <span>Votacion abierta · {duracion}</span>
        <span>
          {totalVotos} {totalVotos === 1 ? "voto" : "votos"}
        </span>
      </div>
    </div>
  );
}
