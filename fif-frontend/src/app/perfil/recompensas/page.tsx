"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CalendarCheck,
  CheckCircle2,
  HeartHandshake,
  Landmark,
  Layers,
  QrCode,
  SearchX,
  TrendingUp,
} from "lucide-react";
import { AppBottomNav } from "@/components/AppBottomNav";
import { InsigniaCard } from "@/components/recompensas/InsigniaCard";
import { ValidarAsistenciaSheet } from "@/components/recompensas/ValidarAsistenciaSheet";
import { DetalleInsigniaSheet } from "@/components/recompensas/DetalleInsigniaSheet";
import { useRecompensas } from "@/context/RecompensasContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import { PERFIL_MOCK } from "@/data/perfil";
import {
  FACULTADES_FILTRO,
  PUNTOS_POR_APORTE_SOLIDARIO,
  type FacultadClave,
  type Insignia,
  type OrigenInsignia,
} from "@/data/recompensas";

type FiltroOrigen = "all" | OrigenInsignia;

export default function RecompensasPage() {
  const { insignias, puntos, nivel } = useRecompensas();
  const { abrirCrear, hojas } = useGestionPublicacion();

  const [filtroOrigen, setFiltroOrigen] = useState<FiltroOrigen>("all");
  const [facultad, setFacultad] = useState<FacultadClave>("all");
  const [validandoModo, setValidandoModo] = useState<"qr" | "codigo" | null>(null);
  const [codigoPrefill, setCodigoPrefill] = useState<string>("");
  const [insigniaSeleccionada, setInsigniaSeleccionada] = useState<Insignia | null>(null);

  const perfil = PERFIL_MOCK;
  const { actual, siguiente } = nivel;
  const meta = siguiente?.minimo ?? actual.minimo;
  const porcentaje = siguiente ? Math.min(100, Math.round((puntos.total / meta) * 100)) : 100;

  const insigniasFiltradas = useMemo(() => {
    return insignias.filter((i) => {
      const coincideOrigen = filtroOrigen === "all" || i.origen === filtroOrigen;
      const coincideFacultad = facultad === "all" || i.facultad === facultad || i.facultad === "all";
      return coincideOrigen && coincideFacultad;
    });
  }, [insignias, filtroOrigen, facultad]);

  const conteosOrigen = useMemo(() => {
    const total = insignias.length;
    const eventos = insignias.filter((i) => i.origen === "evento").length;
    const solidaridad = insignias.filter((i) => i.origen === "solidaridad").length;
    return { all: total, evento: eventos, solidaridad };
  }, [insignias]);

  const desbloqueadasTotal = useMemo(
    () => insignias.filter((i) => i.estado === "desbloqueada").length,
    [insignias]
  );

  const handleAcreditarDirecto = (codigo: string) => {
    setCodigoPrefill(codigo);
    setValidandoModo("codigo");
  };

  const handleAcreditacionExitosa = (insignia: Insignia) => {
    setValidandoModo(null);
    requestAnimationFrame(() => {
      document.getElementById(`insignia-${insignia.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      {/* Top Header con botón volver a Mi Perfil */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-screen-margin-mobile flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <Link
              href="/perfil"
              aria-label="Regresar al perfil"
              className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="text-headline-sm text-on-surface truncate">Recompensas Facultativas</h1>
              <span className="text-label-sm font-inter text-primary uppercase tracking-wider font-bold">
                UAQnecta
              </span>
            </div>
          </div>
          <Link
            href="/perfil"
            aria-label="Ver perfil"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest"
          >
            {perfil.siglas}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-20 pb-28 gap-space-md">
        {/* Tarjeta de Identidad y Resumen de Credibilidad UAQ */}
        <div className="px-screen-margin-mobile pt-space-xs">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-tertiary p-space-lg text-on-primary shadow-md">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-secondary-fixed/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary">
                    <Award className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-label-sm font-inter text-primary-fixed block uppercase tracking-wider">
                      Credencial Estudiantil
                    </span>
                    <h2 className="text-headline-sm text-on-primary truncate">{perfil.nombre}</h2>
                  </div>
                </div>
                <span className="shrink-0 bg-surface-container-lowest/20 backdrop-blur-md px-2.5 py-1 rounded-full text-label-sm font-inter font-semibold tracking-wide text-primary-fixed">
                  {perfil.facultadSigla} · Exp. {perfil.expediente}
                </span>
              </div>

              {/* Métricas Principales */}
              <div className="grid grid-cols-3 gap-space-xs bg-surface-container-lowest/15 backdrop-blur-md p-space-sm rounded-lg">
                <div className="flex flex-col col-span-2">
                  <span className="text-label-sm font-inter text-primary-fixed opacity-90">
                    Puntos UAQ Acumulados
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-headline-lg font-bold text-on-primary">{puntos.total}</span>
                    <span className="text-label-sm font-inter text-primary-fixed font-semibold">Pts totales</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-label-sm font-inter text-primary-fixed flex-wrap">
                    <span className="flex items-center gap-0.5 text-on-primary font-medium">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      +{puntos.eventos} Pts Eventos
                    </span>
                    <span className="opacity-60">•</span>
                    <span className="flex items-center gap-0.5 text-secondary-fixed font-medium">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      +{puntos.solidarios} Pts Solidarios
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-label-sm font-inter text-primary-fixed opacity-90">Rango Actual</span>
                  <span className="text-label-lg font-bold text-on-primary truncate mt-0.5">
                    Nivel {actual.numero}
                  </span>
                  <span className="text-label-sm font-inter text-secondary-fixed truncate">{actual.rango}</span>
                  <span className="text-label-sm font-inter text-primary-fixed/80 mt-1">
                    {desbloqueadasTotal} Insignias
                  </span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-primary-fixed text-label-sm font-inter">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {siguiente ? `Progreso a Nivel ${siguiente.numero}: ${siguiente.rango}` : "Rango Máximo Alcanzado"}
                  </span>
                  <span className="font-semibold text-on-primary">
                    {siguiente ? `${puntos.total} / ${meta} Pts` : `${puntos.total} Pts`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest/25 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-fixed to-surface-container-lowest rounded-full transition-all duration-700"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal: Validar Asistencia */}
        <div className="px-screen-margin-mobile">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-primary shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-headline-sm text-on-surface">Validar Asistencia a Evento</h3>
                <p className="text-body-sm text-on-surface-variant truncate">
                  Acredita puntos y desbloquea insignias oficiales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={() => setValidandoModo("qr")}
                className="flex-1 sm:flex-initial h-touch-target-min px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high active:bg-surface-container text-on-surface text-label-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-4 h-4 text-primary" />
                Escanear QR
              </button>
              <button
                type="button"
                onClick={() => setValidandoModo("codigo")}
                className="flex-1 sm:flex-initial h-touch-target-min px-space-md rounded-lg bg-primary hover:bg-primary/95 active:bg-primary-container text-on-primary text-label-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Código
              </button>
            </div>
          </div>
        </div>

        {/* Selector de Origen de Insignias */}
        <div className="px-screen-margin-mobile">
          <div className="grid grid-cols-3 gap-1 bg-surface-container-high p-1 rounded-xl text-center">
            <button
              type="button"
              onClick={() => setFiltroOrigen("all")}
              className={`py-2 px-1 rounded-lg text-label-sm font-inter flex items-center justify-center gap-1 transition-all ${
                filtroOrigen === "all"
                  ? "bg-surface-container-lowest text-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Todos ({conteosOrigen.all})</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroOrigen("evento")}
              className={`py-2 px-1 rounded-lg text-label-sm font-inter flex items-center justify-center gap-1 transition-all ${
                filtroOrigen === "evento"
                  ? "bg-surface-container-lowest text-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Eventos ({conteosOrigen.evento})</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroOrigen("solidaridad")}
              className={`py-2 px-1 rounded-lg text-label-sm font-inter flex items-center justify-center gap-1 transition-all ${
                filtroOrigen === "solidaridad"
                  ? "bg-surface-container-lowest text-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface font-semibold"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Solidaridad ({conteosOrigen.solidaridad})</span>
            </button>
          </div>
        </div>

        {/* Filtro por Facultad (Scroll Horizontal) */}
        <div className="flex flex-col gap-1.5">
          <div className="px-screen-margin-mobile flex items-center justify-between">
            <span className="text-label-sm font-inter text-on-surface-variant uppercase tracking-wider font-bold">
              Explorar por Facultad
            </span>
            <span className="text-label-sm font-inter text-primary font-semibold">
              Mostrando {insigniasFiltradas.length} recompensas
            </span>
          </div>
          <div className="flex gap-space-xs overflow-x-auto px-screen-margin-mobile py-space-xxs no-scrollbar">
            {FACULTADES_FILTRO.map((f) => {
              const activa = facultad === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFacultad(f.id)}
                  className={`shrink-0 h-8 px-space-md rounded-full text-label-md transition-all flex items-center gap-1.5 ${
                    activa
                      ? "bg-primary text-on-primary shadow-sm font-bold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-normal"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vitrina de Insignias Oficiales */}
        <div className="px-screen-margin-mobile flex flex-col gap-space-md">
          {/* Banner Explicativo de Recompensas Solidarias */}
          {(filtroOrigen === "all" || filtroOrigen === "solidaridad") && (
            <div className="rounded-xl bg-gradient-to-r from-secondary-container/80 via-primary-fixed/40 to-surface-container-lowest p-space-md border border-primary/10 shadow-sm flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-headline-sm text-on-surface font-bold">
                    Puntos por Altruismo y Asesoría
                  </h4>
                  <span className="bg-primary text-on-primary text-label-sm font-inter px-2 py-0.5 rounded-full font-bold">
                    +{PUNTOS_POR_APORTE_SOLIDARIO} Pts c/u
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Tus comentarios marcados como <strong>&apos;Respuesta Solidaria&apos;</strong> o de{" "}
                  <strong>&apos;Apoyo Útil&apos;</strong> en el muro y foros suman puntos directos y desbloquean
                  rangos de honor en el campus.
                </p>
              </div>
            </div>
          )}

          {/* Listado de tarjetas de insignias */}
          {insigniasFiltradas.map((insignia) => (
            <InsigniaCard
              key={insignia.id}
              insignia={insignia}
              onVerDetalle={setInsigniaSeleccionada}
              onAcreditarCodigo={handleAcreditarDirecto}
            />
          ))}

          {/* Estado vacío cuando no hay resultados para el filtro */}
          {insigniasFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-space-md text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-3">
                <SearchX className="w-7 h-7" />
              </div>
              <h4 className="text-headline-sm text-on-surface">Sin insignias registradas</h4>
              <p className="text-body-sm text-on-surface-variant max-w-xs mt-1">
                Participa en eventos oficiales de esta facultad para desbloquear nuevas recompensas institucionales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFacultad("all");
                  setFiltroOrigen("all");
                }}
                className="mt-4 px-space-md h-9 rounded-lg bg-surface-container-high text-on-surface text-label-md hover:bg-surface-container transition-colors"
              >
                Ver todas las facultades
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Sheets / Modales */}
      {validandoModo && (
        <ValidarAsistenciaSheet
          modoInicial={validandoModo}
          codigoInicial={codigoPrefill}
          onClose={() => {
            setValidandoModo(null);
            setCodigoPrefill("");
          }}
          onTerminar={(insignia) => {
            setCodigoPrefill("");
            handleAcreditacionExitosa(insignia);
          }}
        />
      )}

      {insigniaSeleccionada && (
        <DetalleInsigniaSheet
          insignia={insigniaSeleccionada}
          onClose={() => setInsigniaSeleccionada(null)}
        />
      )}

      <AppBottomNav onPublishClick={abrirCrear} />
      {hojas}
    </div>
  );
}
