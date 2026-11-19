"use client";

import { useMemo, useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { useAppToast } from "@/context/ToastContext";
import { HeroAnnouncement } from "@/components/home/HeroAnnouncement";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { AvisoCard } from "@/components/home/AvisoCard";
import { UpcomingDates } from "@/components/home/UpcomingDates";
import { TelegramBanner } from "@/components/home/TelegramBanner";
import { PublicacionCard } from "@/components/publicar/PublicacionCard";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import { getAvisos } from "@/services/api";
import type { Aviso, CategoriaAviso } from "@/data/avisos";

export default function HomePage() {
  const showToast = useAppToast();
  const { publicaciones } = usePublicacionesApp();
  const { abrirCrear, abrirOpciones, hojas } = useGestionPublicacion();
  const [categoria, setCategoria] = useState<"all" | CategoriaAviso>("all");

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getAvisos()
      .then((data) => setAvisos(data))
      .catch((err) => {
        console.error("Error cargando comunicados oficiales:", err);
        showToast("No se pudieron cargar los comunicados");
      })
      .finally(() => setCargando(false));
  }, [showToast]);

  const avisosFiltrados = useMemo(
    () => (categoria === "all" ? avisos : avisos.filter((a) => a.categoria === categoria)),
    [categoria, avisos]
  );

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Anuncios" />

      <main className="flex flex-col w-full pt-20 pb-24 px-screen-margin-mobile gap-space-lg">
        {publicaciones.length > 0 && (
          <section aria-label="Tus publicaciones" className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs">
                <ShieldCheck className="w-[18px] h-[18px] text-primary" />
                <h2 className="text-label-lg text-on-surface">Gestión de Publicaciones Activas</h2>
              </div>
              <span className="text-label-sm font-inter bg-secondary-container text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                {publicaciones.length} {publicaciones.length === 1 ? "activa" : "activas"}
              </span>
            </div>
            {publicaciones.map((publicacion) => (
              <PublicacionCard key={publicacion.id} publicacion={publicacion} onOpciones={abrirOpciones} />
            ))}
          </section>
        )}

        <HeroAnnouncement onConsultarClick={() => showToast("Abriendo Convocatoria Oficial...")} />

        <CategoryFilter active={categoria} onChange={setCategoria} total={avisosFiltrados.length} />

        <div className="flex flex-col gap-space-md">
          {cargando && (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
              Cargando comunicados oficiales de la UAQ...
            </div>
          )}

          {!cargando && avisosFiltrados.map((aviso) => (
            <AvisoCard key={aviso.id} aviso={aviso} onToast={showToast} />
          ))}

          {!cargando && avisosFiltrados.length === 0 && (
            <div className="p-8 text-center text-secondary bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              No hay avisos en esta categoría por ahora.
            </div>
          )}
        </div>

        <UpcomingDates onVerTodoClick={() => showToast("Abriendo Calendario Semestral...")} />

        <TelegramBanner onJoinClick={() => showToast("Redirigiendo a Telegram...")} />
      </main>

      <AppBottomNav onPublishClick={abrirCrear} />
      {hojas}
    </div>
  );
}
