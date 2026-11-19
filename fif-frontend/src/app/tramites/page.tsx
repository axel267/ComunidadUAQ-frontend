"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  GraduationCap,
  Layers,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { getGuiasTramites, type GuiaTramite } from "@/services/api";

export default function TramitesPage() {
  const [guias, setGuias] = useState<GuiaTramite[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guiaExpandida, setGuiaExpandida] = useState<number | null>(null);

  useEffect(() => {
    getGuiasTramites()
      .then((data) => {
        setGuias(data);
        if (data.length > 0) {
          setGuiaExpandida(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error al cargar guías de trámites:", err);
      })
      .finally(() => setCargando(false));
  }, []);

  const guiasFiltradas = guias.filter((g) => {
    const texto = `${g.titulo} ${g.descripcion} ${g.facultad?.nombre || ""}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const toggleGuia = (id: number) => {
    setGuiaExpandida((actual) => (actual === id ? null : id));
  };

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Trámites" />

      <main className="flex flex-col w-full max-w-4xl mx-auto pt-20 pb-28 px-screen-margin-mobile gap-space-md">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="text-headline-md font-bold text-on-surface">Guías de Trámites</h1>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Consulta los requisitos y el paso a paso oficial de titulación, servicio social y trámites escolares.
          </p>
        </header>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar trámite por nombre o facultad..."
            className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
          />
        </div>

        {cargando && (
          <div className="p-8 text-center text-slate-500 bg-surface-container-lowest rounded-xl border border-slate-200 animate-pulse">
            Cargando guías y procedimientos institucionales...
          </div>
        )}

        {!cargando && guiasFiltradas.length === 0 && (
          <div className="p-12 text-center text-secondary bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-outline" />
            <span className="text-body-md">No se encontraron guías para tu búsqueda.</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!cargando &&
            guiasFiltradas.map((guia) => {
              const estaAbierta = guiaExpandida === guia.id;
              const pasosOrdenados = [...(guia.pasos || [])].sort((a, b) => a.ordenPaso - b.ordenPaso);

              return (
                <article
                  key={guia.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleGuia(guia.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
                  >
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {guia.facultad && (
                          <span className="px-2.5 py-0.5 rounded-full text-label-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                            {guia.facultad.abreviatura}
                          </span>
                        )}
                        <span className="text-label-xs text-secondary font-medium flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {pasosOrdenados.length} {pasosOrdenados.length === 1 ? "paso" : "pasos"}
                        </span>
                      </div>
                      <h2 className="text-title-lg font-bold text-on-surface leading-snug">
                        {guia.titulo}
                      </h2>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">
                        {guia.descripcion}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-container shrink-0 text-secondary mt-1">
                      {estaAbierta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {estaAbierta && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-outline-variant/40 flex flex-col gap-4 bg-surface-container-low/20">
                      <div className="flex items-center gap-2 pt-2">
                        <FileCheck2 className="w-5 h-5 text-primary" />
                        <h3 className="text-label-lg font-bold text-on-surface">Paso a paso oficial:</h3>
                      </div>

                      <div className="flex flex-col gap-3">
                        {pasosOrdenados.map((paso) => (
                          <div
                            key={paso.id}
                            className="bg-surface rounded-xl p-4 border border-outline-variant/50 shadow-xs flex items-start gap-3.5"
                          >
                            <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {paso.ordenPaso}
                            </span>
                            <div className="flex flex-col gap-1 min-w-0">
                              <h4 className="text-body-md font-semibold text-on-surface">
                                {paso.tituloPaso}
                              </h4>
                              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                {paso.descripcionDetallada}
                              </p>
                              {paso.imagenIlustrativaUrl && (
                                <div className="mt-2 rounded-lg overflow-hidden max-h-48 border border-outline-variant/40">
                                  <img
                                    src={paso.imagenIlustrativaUrl}
                                    alt={paso.tituloPaso}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
