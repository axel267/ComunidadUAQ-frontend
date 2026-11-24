"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Building2, Copy, Maximize2, Nfc, QrCode, X } from "lucide-react";
import { useAppToast } from "@/context/ToastContext";
import type { PerfilEstudiante } from "@/data/perfil";
import { getStoredSession } from "@/services/auth";
import { puedeCrearEventos } from "@/services/permisos";
import { CodigoQrReal } from "./asistencia/CodigoQrReal";
import { PaseListaQrModal } from "./asistencia/PaseListaQrModal";

function construirPayloadQr(perfil: PerfilEstudiante, userId?: number): string {
  const exp = perfil.expediente || "000000";
  const nombre = (perfil.nombreCredencial || perfil.nombre || "UAQ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 32);
  return `UAQ-QR|EXP:${exp}|ID:${userId ?? 0}|NOM:${nombre}`;
}

function CredencialPantallaCompleta({
  perfil,
  payloadQr,
  onClose,
}: {
  perfil: PerfilEstudiante;
  payloadQr: string;
  onClose: () => void;
}) {
  const showToast = useAppToast();
  const tituloId = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(payloadQr);
      showToast("Codigo QR copiado para pase de lista", { tipo: "exito", detalle: payloadQr });
    } catch {
      showToast("No se pudo copiar el codigo", { tipo: "error" });
    }
  };

  return (
    <div
      data-sheet-open
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      className="sheet-backdrop fixed inset-0 z-[60] flex flex-col items-center justify-center gap-space-lg p-space-xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-on-primary"
    >
      <button
        ref={cerrarRef}
        type="button"
        aria-label="Cerrar credencial"
        onClick={onClose}
        className="absolute top-4 right-4 w-touch-target-min h-touch-target-min rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest/30 active:scale-95 transition-all cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center">
        <span className="text-label-sm uppercase tracking-widest text-primary-fixed">Comunidad UAQ</span>
        <h2 id={tituloId} className="text-headline-lg">
          Credencial Universitaria
        </h2>
      </div>

      <div className="bg-surface-container-lowest text-on-surface p-space-md rounded-3xl shadow-2xl flex flex-col items-center">
        <CodigoQrReal
          valor={payloadQr}
          className="w-64 h-64 max-w-[70vw] max-h-[70vw]"
          etiquetaAria={`Codigo QR de asistencia para ${perfil.nombreCredencial}`}
        />
        <p className="text-center text-label-sm font-mono tracking-tight text-secondary mt-1.5">
          PASE DE LISTA · EXP-{perfil.expediente}
        </p>
        <button
          type="button"
          onClick={copiarCodigo}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-primary text-label-sm cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copiar codigo QR</span>
        </button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-headline-md">{perfil.nombreCredencial}</p>
        <p className="text-body-md text-on-primary/85">
          {perfil.carrera} • {perfil.nivelEducativo}
        </p>
        <p className="text-label-md font-mono text-primary-fixed">EXP-{perfil.expediente}</p>
      </div>
    </div>
  );
}

interface CredencialDigitalProps {
  perfil: PerfilEstudiante;
  completa: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
}

export function CredencialDigital({ perfil, completa, onAbrir, onCerrar }: CredencialDigitalProps) {
  const [paseListaAbierto, setPaseListaAbierto] = useState(false);
  const session = getStoredSession();
  const esCoordinadorODocente = puedeCrearEventos(session?.user);
  const payloadQr = useMemo(
    () => construirPayloadQr(perfil, session?.user?.id),
    [perfil, session?.user?.id]
  );

  return (
    <>
      <section
        aria-label="Credencial digital"
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-tertiary text-on-primary p-space-md shadow-xl flex flex-col justify-between min-h-[220px]"
      >
        <div className="absolute -right-8 -bottom-10 w-44 h-44 opacity-10 pointer-events-none flex items-center justify-center">
          <Building2 className="w-44 h-44" strokeWidth={1} />
        </div>
        <div className="absolute -left-12 -top-12 w-36 h-36 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-inner overflow-hidden">
              <Image src="/logo-uaqnecta.png" alt="UAQnecta" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase tracking-widest text-primary-fixed">UAQnecta</span>
              <span className="text-headline-sm tracking-tight">Credencial Universitaria</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest/20 backdrop-blur-md px-space-xs py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
            <span className="text-label-sm">{perfil.periodo}</span>
          </div>
        </div>

        <div className="relative z-10 my-space-md flex items-center justify-between gap-space-sm">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-label-sm uppercase text-primary-fixed tracking-wider">Titular</span>
            <span className="text-headline-md truncate leading-tight">{perfil.nombreCredencial}</span>
            <span className="text-body-sm text-on-primary/85 truncate">
              {perfil.carrera.replace("Lic. en ", "")} • {perfil.nivelEducativo}
            </span>
            <div className="flex items-center gap-space-xs mt-1">
              <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container-lowest/25 font-mono">
                EST-ACTIVO
              </span>
              <span className="text-label-sm text-primary-fixed flex items-center gap-0.5">
                <Nfc className="w-3.5 h-3.5" /> Contactless
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onAbrir}
            aria-label="Ampliar codigo QR de asistencia"
            className="shrink-0 bg-surface-container-lowest text-on-surface p-2 rounded-xl shadow-lg flex flex-col items-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
              <CodigoQrReal valor={payloadQr} className="w-full h-full" />
            </div>
            <span className="text-label-sm text-secondary font-mono tracking-tighter mt-1">ASISTENCIA</span>
          </button>
        </div>

        <div className="relative z-10 pt-space-xs flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAbrir}
            className="h-9 px-space-md rounded-full bg-surface-container-lowest text-primary text-label-md flex items-center justify-center gap-space-xxs shadow-md hover:bg-surface-bright transition-all active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-[18px] h-[18px]" />
            Ver Pantalla Completa
          </button>

          {esCoordinadorODocente && (
            <button
              type="button"
              onClick={() => setPaseListaAbierto(true)}
              className="h-9 px-space-md rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-md flex items-center justify-center gap-space-xxs shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-[18px] h-[18px]" />
              Escanear QR / Pasar lista
            </button>
          )}
        </div>
      </section>

      {completa && (
        <CredencialPantallaCompleta perfil={perfil} payloadQr={payloadQr} onClose={onCerrar} />
      )}

      {paseListaAbierto && <PaseListaQrModal onClose={() => setPaseListaAbierto(false)} />}
    </>
  );
}
