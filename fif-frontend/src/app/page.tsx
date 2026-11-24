"use client";

import { useMemo, useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, ShieldCheck, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { useAppToast } from "@/context/ToastContext";
import { useDetalle } from "@/context/DetalleContext";
import { HeroAnnouncement } from "@/components/home/HeroAnnouncement";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { AvisoCard } from "@/components/home/AvisoCard";
import { UpcomingDates } from "@/components/home/UpcomingDates";
import { TelegramBanner } from "@/components/home/TelegramBanner";
import { PublicacionCard } from "@/components/publicar/PublicacionCard";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import {
  getAvisos,
  createAviso,
  getFacultades,
  type Facultade,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";
import type { Aviso, CategoriaAviso } from "@/data/avisos";

const subscribeToSession = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSessionSnapshot = () => {
  const session = getStoredSession();
  return session ? JSON.stringify([session.user.rol, session.user.rolId]) : null;
};

export default function HomePage() {
  const router = useRouter();
  const showToast = useAppToast();
  const { abrirConvocatoriaOficial } = useDetalle();
  const { publicaciones } = usePublicacionesApp();
  const { abrirCrear, abrirOpciones, hojas } = useGestionPublicacion();
  const [categoria, setCategoria] = useState<"all" | CategoriaAviso>("all");
  const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const sesionVerificada = sessionSnapshot !== null;
  const esAdmin = sessionSnapshot !== null && (() => {
    const [rol, rolId] = JSON.parse(sessionSnapshot) as [string, number | undefined];
    return rol === "Administrador" || rolId === 1;
  })();

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [facultades, setFacultades] = useState<Facultade[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal para crear Aviso / Alerta Urgente (Admin)
  const [modalAvisoAbierto, setModalAvisoAbierto] = useState(false);
  const [tituloAviso, setTituloAviso] = useState("");
  const [contenidoAviso, setContenidoAviso] = useState("");
  const [urgenciaAviso, setUrgenciaAviso] = useState<"BAJA" | "MEDIA" | "ALTA" | "URGENTE">("URGENTE");
  const [facultadAvisoId, setFacultadAvisoId] = useState<string>("todas");
  const [guardandoAviso, setGuardandoAviso] = useState(false);

  const cargarAvisos = useCallback(() => {
    getAvisos()
      .then((data) => setAvisos(data))
      .catch((err) => {
        console.error("Error cargando comunicados oficiales:", err);
        showToast("No se pudieron cargar los comunicados");
      })
      .finally(() => setCargando(false));
  }, [showToast]);

  useEffect(() => {
    if (!sesionVerificada) {
      router.replace("/login");
      return;
    }

    cargarAvisos();
    getFacultades().then((f) => setFacultades(f)).catch(() => []);
  }, [cargarAvisos, router, sesionVerificada]);

  const avisosFiltrados = useMemo(
    () => (categoria === "all" ? avisos : avisos.filter((a) => a.categoria === categoria)),
    [categoria, avisos]
  );

  if (!sesionVerificada) {
    return <main className="min-h-screen bg-surface" aria-label="Verificando sesión" />;
  }

  const handleCrearAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloAviso.trim() || !contenidoAviso.trim()) {
      showToast("El título y el mensaje son requeridos", { tipo: "advertencia" });
      return;
    }

    setGuardandoAviso(true);
    try {
      await createAviso({
        titulo: tituloAviso.trim(),
        contenido: contenidoAviso.trim(),
        urgencia: urgenciaAviso,
        facultadId: facultadAvisoId === "todas" ? null : Number(facultadAvisoId),
      });

      setModalAvisoAbierto(false);
      setTituloAviso("");
      setContenidoAviso("");
      setUrgenciaAviso("URGENTE");
      setFacultadAvisoId("todas");

      cargarAvisos();

      if (urgenciaAviso === "URGENTE") {
        showToast("Alerta urgente publicada. Desplegará acuse de recibo obligatorio a los alumnos.", {
          tipo: "exito",
        });
      } else {
        showToast("Comunicado oficial publicado con éxito.", { tipo: "exito" });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error al publicar el comunicado", { tipo: "error" });
    } finally {
      setGuardandoAviso(false);
    }
  };

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Anuncios" />

      <main className="flex flex-col w-full pt-20 pb-24 px-screen-margin-mobile gap-space-lg">
        {/* Panel de Emisión de Alertas (Exclusivo Administrador) */}
        {esAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-primary-container/30 border border-primary/20 rounded-2xl p-4 gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-label-md font-bold text-on-surface">Centro de Alertas Oficiales</span>
                <span className="text-body-xs text-secondary">
                  Emite alertas urgentes con acuse de recibo obligatorio o comunicados generales.
                </span>
              </div>
            </div>
            <button
              onClick={() => setModalAvisoAbierto(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90 transition-all shrink-0 shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Alerta / Aviso</span>
            </button>
          </div>
        )}

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

        <HeroAnnouncement onConsultarClick={abrirConvocatoriaOficial} />

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

      {/* Modal Crear Comunicado / Alerta Urgente (Admin) */}
      {modalAvisoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <h3 className="text-title-lg font-bold text-on-surface">Emitir Comunicado Oficial</h3>
              </div>
              <button
                onClick={() => setModalAvisoAbierto(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearAviso} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Nivel de Urgencia *
                </label>
                <select
                  value={urgenciaAviso}
                  onChange={(e) =>
                    setUrgenciaAviso(e.target.value as "BAJA" | "MEDIA" | "ALTA" | "URGENTE")
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="URGENTE">
                    [URGENTE] Despliega ventana emergente obligatoria y acuse de recibo
                  </option>
                  <option value="ALTA">[ALTA] Prioridad alta en la lista de avisos</option>
                  <option value="MEDIA">[MEDIA] Comunicado regular de coordinación</option>
                  <option value="BAJA">[BAJA] Notificación informativa general</option>
                </select>
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Alcance / Facultad
                </label>
                <select
                  value={facultadAvisoId}
                  onChange={(e) => setFacultadAvisoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todas">Toda la Universidad (Transversal UAQ)</option>
                  {facultades.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre} ({f.abreviatura})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Título del aviso o alerta *
                </label>
                <input
                  type="text"
                  required
                  value={tituloAviso}
                  onChange={(e) => setTituloAviso(e.target.value)}
                  placeholder="Ej. Suspensión de actividades por contingencia climática"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Mensaje / Contenido detallado *
                </label>
                <textarea
                  rows={4}
                  required
                  value={contenidoAviso}
                  onChange={(e) => setContenidoAviso(e.target.value)}
                  placeholder="Instrucciones oficiales para la comunidad estudiantil y docente..."
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setModalAvisoAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary font-medium hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoAviso}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-on-primary transition-all disabled:opacity-50 ${
                    urgenciaAviso === "URGENTE"
                      ? "bg-error hover:bg-error/90"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {guardandoAviso
                    ? "Publicando..."
                    : urgenciaAviso === "URGENTE"
                    ? "Emitir Alerta Urgente"
                    : "Publicar Comunicado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppBottomNav onPublishClick={abrirCrear} />
      {hojas}
    </div>
  );
}
