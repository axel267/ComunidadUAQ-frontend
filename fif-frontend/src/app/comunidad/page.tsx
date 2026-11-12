"use client";

import { useMemo, useState } from "react";
import { Building2, ChartColumn, HelpCircle, ImageIcon, Network, SearchX, ShieldCheck, SquarePen } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { PostComunidadCard } from "@/components/comunidad/PostComunidadCard";
import { ComentariosSheet } from "@/components/comunidad/ComentariosSheet";
import { PublicacionCard } from "@/components/publicar/PublicacionCard";
import { useComunidad } from "@/context/ComunidadContext";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import { usePerfil } from "@/context/PerfilContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import { FILTROS_COMUNIDAD, type FiltroComunidad } from "@/data/comunidad";

export default function ComunidadPage() {
  const { posts } = useComunidad();
  const { publicaciones } = usePublicacionesApp();
  const { perfil } = usePerfil();
  const { abrirCrear, abrirOpciones, hojas } = useGestionPublicacion();
  const [filtro, setFiltro] = useState<FiltroComunidad>("para-ti");
  const [hiloId, setHiloId] = useState<string | null>(null);

  const postsFiltrados = useMemo(() => posts.filter((p) => p.categoriasFiltro.includes(filtro)), [posts, filtro]);
  const publicacionesFiltradas = useMemo(() => {
    switch (filtro) {
      case "para-ti":
      case "tendencias":
        return publicaciones;
      case "carrera":
        return publicaciones.filter((p) => p.visibilidad === "facultad");
      case "dudas":
        return publicaciones.filter((p) => p.tema === "academico" || p.texto.includes("?"));
    }
  }, [publicaciones, filtro]);
  // Se busca en `posts` (no en los filtrados) para que el hilo siga vivo al comentar.
  const postHilo = hiloId ? posts.find((p) => p.id === hiloId) ?? null : null;
  const primerNombre = perfil.nombre.split(" ")[0];

  const accionesRapidas = [
    { label: "Foto", icono: ImageIcon, color: "text-primary", abrir: () => abrirCrear({ tema: "comunidad", tab: "imagen" }) },
    { label: "Encuesta", icono: ChartColumn, color: "text-tertiary", abrir: () => abrirCrear({ tema: "comunidad", tab: "encuesta" }) },
    { label: "Pregunta", icono: HelpCircle, color: "text-primary-container", abrir: () => abrirCrear({ tema: "academico" }) },
    { label: "Facultad", icono: Building2, color: "text-secondary", abrir: () => abrirCrear({ tema: "comunidad", visibilidad: "facultad" }) },
  ];

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Comunidad" />

      <main className="flex flex-col w-full pt-16 pb-24">
        {/* Encabezado y filtros */}
        <section aria-label="Filtros" className="w-full px-screen-margin-mobile pt-space-sm pb-space-xs">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <h1 className="text-headline-sm text-on-surface">Comunidad Universitaria</h1>
            </div>
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-label-sm font-inter text-on-surface-variant">En vivo</span>
            </span>
          </div>
          <div
            role="tablist"
            aria-label="Categorías de la comunidad"
            className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 -mx-screen-margin-mobile px-screen-margin-mobile"
          >
            {FILTROS_COMUNIDAD.map((f) => {
              const activo = filtro === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setFiltro(f.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-label-md transition-all active:scale-95 ${
                    activo ? "bg-primary-container text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-space-md px-screen-margin-mobile pb-space-xl pt-1">
          {/* Caja crear publicación */}
          <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-sm flex items-center justify-center shrink-0">
                {perfil.siglas}
              </div>
              <button
                type="button"
                onClick={() => abrirCrear({ tema: "comunidad" })}
                className="flex-1 min-w-0 bg-surface-container-low hover:bg-surface-container px-3.5 py-2 rounded-full transition-colors text-secondary text-body-sm flex items-center justify-between gap-2 text-left"
              >
                <span className="truncate">¿Qué está pasando en el campus, {primerNombre}?</span>
                <SquarePen className="w-[18px] h-[18px] text-primary shrink-0" />
              </button>
            </div>
            <div className="flex items-center justify-between pt-1 text-label-sm font-inter">
              {accionesRapidas.map(({ label, icono: Icono, color, abrir }) => (
                <button
                  key={label}
                  type="button"
                  onClick={abrir}
                  className="flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
                >
                  <Icono className={`w-[18px] h-[18px] ${color}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Publicaciones del usuario */}
          {publicacionesFiltradas.length > 0 && (
            <section aria-label="Tus publicaciones" className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-xl">
                <span className="flex items-center gap-space-xs">
                  <ShieldCheck className="w-[18px] h-[18px] text-primary" />
                  <h2 className="text-label-lg text-on-surface">Tus aportes recientes</h2>
                </span>
                <span className="text-label-sm font-inter bg-secondary-container text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                  {publicacionesFiltradas.length} {publicacionesFiltradas.length === 1 ? "activa" : "activas"}
                </span>
              </div>
              {publicacionesFiltradas.map((p) => (
                <PublicacionCard key={p.id} publicacion={p} onOpciones={abrirOpciones} />
              ))}
            </section>
          )}

          {/* Feed */}
          {postsFiltrados.map((post) => (
            <PostComunidadCard key={post.id} post={post} onAbrirComentarios={setHiloId} />
          ))}

          {postsFiltrados.length === 0 && publicacionesFiltradas.length === 0 && (
            <div className="flex flex-col items-center text-center gap-2 p-space-xl bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <SearchX className="w-8 h-8 text-outline" />
              <p className="text-headline-sm text-on-surface">Nada por aquí todavía</p>
              <p className="text-body-sm text-on-surface-variant">Sé el primero en publicar en esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      {postHilo && <ComentariosSheet post={postHilo} onClose={() => setHiloId(null)} />}

      <AppBottomNav onPublishClick={() => abrirCrear({ tema: filtro === "dudas" ? "academico" : "comunidad" })} />
      {hojas}
    </div>
  );
}

