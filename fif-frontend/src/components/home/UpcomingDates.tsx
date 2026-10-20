"use client";

import { CalendarDays } from "lucide-react";
import { FECHAS_CLAVE_MOCK } from "@/data/avisos";

export function UpcomingDates({ onVerTodoClick }: { onVerTodoClick: () => void }) {
  return (
    <section className="flex flex-col gap-space-sm mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-primary w-[22px] h-[22px]" />
          <h2 className="text-headline-md text-on-surface">Próximas Fechas Clave</h2>
        </div>
        <button onClick={onVerTodoClick} className="text-label-md font-inter text-primary hover:underline">
          Ver todo
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
        {FECHAS_CLAVE_MOCK.map((fecha, index) => (
          <div key={fecha.id} className="contents">
            <div className="flex items-center gap-space-md">
              <div className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg shrink-0 ${fecha.casillaClases}`}>
                <span className="text-label-sm font-inter font-bold uppercase leading-none">{fecha.mes}</span>
                <span className="text-headline-lg leading-tight">{fecha.dia}</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-headline-sm truncate">{fecha.titulo}</span>
                  <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full ${fecha.etiquetaClases}`}>
                    {fecha.etiqueta}
                  </span>
                </div>
                <p className="text-body-sm text-secondary truncate">{fecha.descripcion}</p>
              </div>
            </div>
            {index < FECHAS_CLAVE_MOCK.length - 1 && <div className="w-full h-px bg-surface-variant" />}
          </div>
        ))}
      </div>
    </section>
  );
}
