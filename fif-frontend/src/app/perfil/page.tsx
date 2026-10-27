"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bookmark,
  ChevronRight,
  Copy,
  FilePlus2,
  LogOut,
  Pencil,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import { CredencialDigital } from "@/components/perfil/CredencialDigital";
import { ResumenRecompensas } from "@/components/perfil/ResumenRecompensas";
import { PublicacionCard } from "@/components/publicar/PublicacionCard";
import { useAppToast } from "@/context/ToastContext";
import { useGuardados } from "@/context/GuardadosContext";
import { useNotificacionesApp } from "@/context/NotificacionesContext";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import { AVISOS_MOCK } from "@/data/avisos";
import {
  CUENTA_SEGURIDAD,
  EVENTOS_REGISTRADOS_MOCK,
  GESTION_ACADEMICA,
  PERFIL_MOCK,
  type EntradaMenu,
} from "@/data/perfil";

type Pestana = "publicaciones" | "guardados";

function GrupoMenu({ entradas, onSeleccionar }: { entradas: EntradaMenu[]; onSeleccionar: (e: EntradaMenu) => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
      {entradas.map((entrada, i) => {
        const Icono: LucideIcon = entrada.icono;
        return (
          <div key={entrada.id}>
            {i > 0 && <div className="h-px bg-surface-container mx-space-md" />}
            <button
              type="button"
              onClick={() => onSeleccionar(entrada)}
              className="w-full flex items-center justify-between gap-space-sm p-space-md text-left hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entrada.iconoClases}`}>
                  <Icono className="w-[22px] h-[22px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-headline-sm text-on-surface">{entrada.titulo}</span>
                  <span className="text-body-sm text-on-surface-variant">{entrada.descripcion}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline shrink-0" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const showToast = useAppToast();
  const { publicaciones } = usePublicacionesApp();
  const { guardados, alternar } = useGuardados();
  const { abrir: abrirNotificaciones } = useNotificacionesApp();
  const { abrirCrear, abrirOpciones, hojas } = useGestionPublicacion();
  const [pestana, setPestana] = useState<Pestana>("publicaciones");
  const [credencialCompleta, setCredencialCompleta] = useState(false);

  const perfil = PERFIL_MOCK;
  const avisosGuardados = AVISOS_MOCK.filter((a) => guardados.has(a.id));

  const copiarExpediente = async () => {
    try {
      await navigator.clipboard.writeText(`EXP-${perfil.expediente}`);
      showToast("Matrícula copiada al portapapeles", { tipo: "exito", detalle: `EXP-${perfil.expediente}` });
    } catch {
      showToast("No se pudo copiar la matrícula", { tipo: "error", detalle: "Inténtalo de nuevo." });
    }
  };

  const proximamente = (que: string) => showToast(`${que} estará disponible próximamente.`);

  const seleccionarEntrada = (entrada: EntradaMenu) => {
    if (entrada.id === "avisos") return abrirNotificaciones();
    proximamente(entrada.titulo);
  };

  const cerrarSesion = () => {
    // TODO: invalidar la sesión en el backend y limpiar el token cuando auth.ts la persista.
    router.push("/login");
  };

  const pestanas: { id: Pestana; label: string; icono: LucideIcon; total: number }[] = [
    { id: "publicaciones", label: "Mis Publicaciones", icono: FilePlus2, total: publicaciones.length },
    {
      id: "guardados",
      label: "Guardados & Eventos",
      icono: Bookmark,
      total: avisosGuardados.length + EVENTOS_REGISTRADOS_MOCK.length,
    },
  ];

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Mi perfil" />

      <main className="flex flex-col w-full pt-20 pb-28 gap-space-md">
        <section aria-label="Identidad" className="px-screen-margin-mobile pt-space-xs flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary shadow-md ring-4 ring-primary-fixed flex items-center justify-center text-headline-lg">
                {perfil.siglas}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary-container text-on-primary rounded-full w-7 h-7 flex items-center justify-center shadow-md ring-2 ring-surface">
                <BadgeCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                aria-label="Ajustes de cuenta"
                onClick={() => proximamente("Los ajustes de cuenta")}
                className="w-touch-target-min h-touch-target-min rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm"
              >
                <Settings className="w-[22px] h-[22px]" />
              </button>
              <button
                type="button"
                onClick={() => proximamente("La edición del perfil")}
                className="h-10 px-space-md rounded-full bg-surface-container text-on-surface text-label-md flex items-center gap-space-xxs hover:bg-surface-container-high transition-colors shadow-sm"
              >
                <Pencil className="w-[18px] h-[18px] text-primary" />
                Editar
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-space-xxs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="text-headline-lg text-on-surface">{perfil.nombre}</h1>
              <span className="bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded-full text-label-sm font-inter">
                {perfil.estatus}
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant">
              {perfil.carrera} <span className="text-outline-variant">•</span> {perfil.semestre}º Semestre
            </p>
            <p className="text-body-sm text-secondary">{perfil.facultad}</p>
            <div className="pt-space-xs">
              <button
                type="button"
                onClick={copiarExpediente}
                aria-label={`Copiar matrícula EXP-${perfil.expediente}`}
                className="inline-flex items-center gap-space-xs bg-surface-container-low hover:bg-surface-container px-space-sm py-1 rounded-full text-on-surface-variant transition-colors active:scale-95 shadow-sm"
              >
                <span className="text-label-md font-mono tracking-tight text-on-surface">EXP-{perfil.expediente}</span>
                <Copy className="w-4 h-4 text-secondary" />
              </button>
            </div>
          </div>
        </section>

        <div className="px-screen-margin-mobile flex flex-col gap-space-md">
          <CredencialDigital
            perfil={perfil}
            completa={credencialCompleta}
            onAbrir={() => setCredencialCompleta(true)}
            onCerrar={() => setCredencialCompleta(false)}
          />
          <ResumenRecompensas />
        </div>

        <section aria-label="Actividad" className="px-screen-margin-mobile flex flex-col gap-space-md">
          <div role="tablist" aria-label="Actividad del perfil" className="flex bg-surface-container rounded-full p-1 gap-1">
            {pestanas.map(({ id, label, icono: Icono, total }) => {
              const activa = pestana === id;
              return (
                <button
                  key={id}
                  id={`tab-${id}`}
                  role="tab"
                  type="button"
                  aria-selected={activa}
                  aria-controls={`panel-${id}`}
                  onClick={() => setPestana(id)}
                  className={`flex-1 py-2 px-space-sm rounded-full text-label-md text-center transition-all flex items-center justify-center gap-space-xxs ${
                    activa
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <Icono className="w-[18px] h-[18px]" />
                  <span className="truncate">{label}</span>
                  {total > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm flex items-center justify-center">
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {pestana === "publicaciones" && (
            <div
              id="panel-publicaciones"
              role="tabpanel"
              aria-labelledby="tab-publicaciones"
              className="flex flex-col gap-space-md"
            >
              {publicaciones.map((publicacion) => (
                <PublicacionCard key={publicacion.id} publicacion={publicacion} onOpciones={abrirOpciones} />
              ))}
              {publicaciones.length === 0 && (
                <div className="flex flex-col items-center text-center gap-space-sm p-space-xl bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                    <FilePlus2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-headline-sm text-on-surface">Aún no has publicado</h2>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Comparte apuntes, eventos o dudas con tu comunidad universitaria.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={abrirCrear}
                    className="h-10 px-space-md rounded-xl bg-primary text-on-primary text-label-lg shadow-sm active:scale-95 transition-transform"
                  >
                    Crear publicación
                  </button>
                </div>
              )}
            </div>
          )}

          {pestana === "guardados" && (
            <div id="panel-guardados" role="tabpanel" aria-labelledby="tab-guardados" className="flex flex-col gap-space-md">
              {avisosGuardados.map((aviso) => (
                <article
                  key={aviso.id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-space-xs py-0.5 rounded-full text-label-sm font-inter ${aviso.etiquetaClases}`}>
                      {aviso.etiqueta}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar “${aviso.titulo}” de guardados`}
                      onClick={() => {
                        alternar(aviso.id);
                        showToast("Aviso removido de guardados");
                      }}
                      className="text-primary hover:text-error transition-colors"
                    >
                      <Bookmark className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  <h2 className="text-headline-sm text-on-surface">{aviso.titulo}</h2>
                  <p className="text-body-md text-on-surface-variant line-clamp-2">{aviso.descripcion}</p>
                  <span className="text-body-sm text-secondary">
                    {aviso.autor} • {aviso.referencia}
                  </span>
                </article>
              ))}

              {EVENTOS_REGISTRADOS_MOCK.map((evento) => (
                <article
                  key={evento.id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded-full text-label-sm font-inter">
                      Convocatoria
                    </span>
                    <span className="text-label-md text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Registrado
                    </span>
                  </div>
                  <h2 className="text-headline-sm text-on-surface">{evento.titulo}</h2>
                  <p className="text-body-md text-on-surface-variant">{evento.detalle}</p>
                  <span className="text-body-sm text-secondary">Organiza: {evento.organiza}</span>
                </article>
              ))}

              {avisosGuardados.length === 0 && (
                <p className="text-body-sm text-secondary text-center px-space-md">
                  Guarda avisos desde el inicio con el ícono de marcador y aparecerán aquí.
                </p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="gestion-academica" className="px-screen-margin-mobile pt-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h2 id="gestion-academica" className="text-headline-sm text-on-surface">
              Gestión Académica
            </h2>
            <span className="text-label-sm font-inter text-secondary uppercase tracking-wider">Trámites y Consultas</span>
          </div>
          <GrupoMenu entradas={GESTION_ACADEMICA} onSeleccionar={seleccionarEntrada} />
        </section>

        <section aria-labelledby="cuenta-seguridad" className="px-screen-margin-mobile flex flex-col gap-space-xs">
          <h2
            id="cuenta-seguridad"
            className="text-label-sm font-inter text-secondary uppercase tracking-wider px-space-xxs"
          >
            Cuenta &amp; Seguridad
          </h2>
          <GrupoMenu entradas={CUENTA_SEGURIDAD} onSeleccionar={seleccionarEntrada} />
          <button
            type="button"
            onClick={cerrarSesion}
            className="mt-space-sm w-full h-12 rounded-xl bg-surface-container-low text-error hover:bg-error-container/40 text-label-lg flex items-center justify-center gap-space-xs transition-colors active:scale-[0.98] shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </section>
      </main>

      <AppBottomNav onPublishClick={abrirCrear} />
      {hojas}
    </div>
  );
}
