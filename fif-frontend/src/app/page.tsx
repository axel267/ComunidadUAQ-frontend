"use client";

import { useCallback, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { HeroAnnouncement } from "@/components/home/HeroAnnouncement";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { AvisoCard } from "@/components/home/AvisoCard";
import { UpcomingDates } from "@/components/home/UpcomingDates";
import { TelegramBanner } from "@/components/home/TelegramBanner";
import { CrearPublicacionSheet } from "@/components/publicar/CrearPublicacionSheet";
import { NotificacionesPanel } from "@/components/notificaciones/NotificacionesPanel";
import { useNotificaciones } from "@/hooks/useNotificaciones";
import { AVISOS_MOCK, type CategoriaAviso } from "@/data/avisos";

export default function HomePage() {
  const { message, showToast } = useToast();
  const [categoria, setCategoria] = useState<"all" | CategoriaAviso>("all");
  const [publicando, setPublicando] = useState(false);
  const [verNotificaciones, setVerNotificaciones] = useState(false);
  const { notificaciones, sinLeer, marcarLeida, marcarTodasLeidas, descartar } = useNotificaciones();

  const cerrarNotificaciones = useCallback(() => setVerNotificaciones(false), []);

  const cerrarPublicar = useCallback(() => setPublicando(false), []);
  const handlePublicar = useCallback(() => {
    // TODO: recibir `NuevaPublicacion` y enviarla a la API cuando el backend defina el contrato (RF04).
    setPublicando(false);
    showToast("¡Publicación creada!");
  }, [showToast]);

  const avisosFiltrados = useMemo(
    () => (categoria === "all" ? AVISOS_MOCK : AVISOS_MOCK.filter((a) => a.categoria === categoria)),
    [categoria]
  );

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader
        subtitle="Anuncios"
        notificacionesSinLeer={sinLeer}
        onNotificationsClick={() => setVerNotificaciones(true)}
      />

      <main className="flex flex-col w-full pt-20 pb-24 px-screen-margin-mobile gap-space-lg">
        <HeroAnnouncement onConsultarClick={() => showToast("Abriendo Convocatoria Oficial...")} />

        <CategoryFilter active={categoria} onChange={setCategoria} total={avisosFiltrados.length} />

        <div className="flex flex-col gap-space-md">
          {avisosFiltrados.map((aviso) => (
            <AvisoCard key={aviso.id} aviso={aviso} onToast={showToast} />
          ))}
          {avisosFiltrados.length === 0 && (
            <div className="p-8 text-center text-secondary bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              No hay avisos en esta categoría por ahora.
            </div>
          )}
        </div>

        <UpcomingDates onVerTodoClick={() => showToast("Abriendo Calendario Semestral...")} />

        <TelegramBanner onJoinClick={() => showToast("Redirigiendo a Telegram...")} />
      </main>

      <Toast message={message} />
      <AppBottomNav onPublishClick={() => setPublicando(true)} />

      {publicando && <CrearPublicacionSheet onClose={cerrarPublicar} onSubmit={handlePublicar} />}

      {verNotificaciones && (
        <NotificacionesPanel
          notificaciones={notificaciones}
          sinLeer={sinLeer}
          onMarcarLeida={marcarLeida}
          onMarcarTodasLeidas={marcarTodasLeidas}
          onDescartar={descartar}
          onClose={cerrarNotificaciones}
        />
      )}
    </div>
  );
}
