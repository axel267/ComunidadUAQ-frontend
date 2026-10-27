"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, Delete, Focus, QrCode, ScanLine, ScanQrCode, Camera, Hash } from "lucide-react";
import { HojaInferior } from "@/components/ui/HojaInferior";
import { useRecompensas } from "@/context/RecompensasContext";
import type { Insignia } from "@/data/recompensas";

type Modo = "qr" | "codigo";

interface ValidarAsistenciaSheetProps {
  modoInicial: Modo;
  onClose: () => void;
  /** Se llama al terminar con la insignia recién desbloqueada para llevar al usuario hasta ella. */
  codigoInicial?: string;
  onTerminar: (insignia: Insignia) => void;
}

export function ValidarAsistenciaSheet({ modoInicial, codigoInicial = "", onClose, onTerminar }: ValidarAsistenciaSheetProps) {
  const { acreditar, insignias } = useRecompensas();
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [codigo, setCodigo] = useState(codigoInicial);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ insignia: Insignia; folio: string } | null>(null);

  const validar = (valor: string) => {
    const resultado = acreditar(valor);
    if (resultado.ok) {
      setError(null);
      setExito({ insignia: resultado.insignia, folio: resultado.folio });
    } else {
      setError(resultado.motivo);
    }
  };

  // Demo: sin cámara real, "detecta" el QR del primer evento pendiente.
  const simularQr = () => {
    const pendiente = insignias.find((i) => i.estado === "bloqueada" && i.codigo);
    if (!pendiente?.codigo) {
      setError("No tienes eventos pendientes por acreditar.");
      return;
    }
    validar(pendiente.codigo);
  };

  if (exito) {
    return (
      <HojaInferior titulo="Validar Asistencia" subtitulo="Acreditación Oficial UAQ" icono={ScanQrCode} onClose={onClose}>
        <div className="flex flex-col items-center text-center py-space-md gap-space-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-headline-md text-on-surface font-bold">¡Asistencia Acreditada!</h3>
            <span className="text-label-sm font-inter text-emerald-700 font-bold uppercase tracking-wider block mt-0.5">
              Certificado Institucional UAQ
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-xs">
            Has sumado <strong className="text-primary">+{exito.insignia.puntos} Pts de Credibilidad</strong> a tu
            expediente y desbloqueado la insignia “{exito.insignia.titulo}”.
          </p>
          <div className="w-full bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-on-surface-variant text-label-sm font-inter">
            <span>
              Nuevo Folio: <strong>{exito.folio}</strong>
            </span>
            <span className="text-emerald-700 font-bold">En Línea</span>
          </div>
          <button
            type="button"
            onClick={() => onTerminar(exito.insignia)}
            className="w-full mt-2 h-11 rounded-xl bg-primary text-on-primary text-label-lg font-bold active:scale-[0.98] transition-transform"
          >
            Ver en mi Vitrina
          </button>
        </div>
      </HojaInferior>
    );
  }

  return (
    <HojaInferior titulo="Validar Asistencia" subtitulo="Acreditación Oficial UAQ" icono={ScanQrCode} onClose={onClose}>
      <div role="tablist" aria-label="Método de validación" className="grid grid-cols-2 gap-1 bg-surface-container-low p-1 rounded-lg mb-space-md">
        {(
          [
            { id: "qr", label: "Escanear QR", icono: Camera },
            { id: "codigo", label: "Código Temporal", icono: Hash },
          ] as const
        ).map(({ id, label, icono: Icono }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={modo === id}
            onClick={() => {
              setModo(id);
              setError(null);
            }}
            className={`h-9 rounded-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
              modo === id ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icono className="w-[18px] h-[18px]" />
            {label}
          </button>
        ))}
      </div>

      {modo === "qr" ? (
        <div className="flex flex-col items-center gap-space-md">
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl bg-on-surface/90 flex flex-col items-center justify-center overflow-hidden p-4">
            <div className="absolute inset-6 rounded-xl border-2 border-dashed border-primary-fixed/70 flex items-center justify-center">
              <div className="w-full h-0.5 bg-primary-fixed/90 shadow-[0_0_8px_#38bdf8] animate-pulse" />
            </div>
            <QrCode className="w-12 h-12 text-surface-container-lowest/40 mb-2" />
            <span className="text-label-sm font-inter text-surface-container-lowest/80 text-center px-4 z-10">
              Apunta la cámara al código QR oficial proyectado al final del evento
            </span>
          </div>
          <button
            type="button"
            onClick={simularQr}
            className="w-full h-touch-target-min rounded-xl bg-primary text-on-primary text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
          >
            <Focus className="w-5 h-5" />
            Simular detección de QR
          </button>
          <p className="text-body-sm text-on-surface-variant text-center">
            El escaneo con cámara se conectará cuando el backend emita los QR de cada evento.
          </p>
        </div>
      ) : (
        <form
          className="flex flex-col gap-space-md"
          onSubmit={(e) => {
            e.preventDefault();
            validar(codigo);
          }}
        >
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2">
            <label htmlFor="codigo-evento" className="text-label-sm font-inter text-on-surface-variant uppercase tracking-wide font-bold">
              Código entregado por la mesa del evento
            </label>
            <div className="flex items-center gap-2">
              <input
                id="codigo-evento"
                value={codigo}
                maxLength={8}
                autoComplete="off"
                autoCapitalize="characters"
                aria-invalid={!!error}
                aria-describedby={error ? "codigo-error" : undefined}
                onChange={(e) => {
                  setCodigo(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Ej. FIF-942X"
                className="flex-1 min-w-0 h-12 bg-surface-container-lowest rounded-lg px-space-sm text-headline-sm uppercase tracking-widest text-center text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <button
                type="button"
                aria-label="Borrar código"
                onClick={() => {
                  setCodigo("");
                  setError(null);
                }}
                className="w-10 h-12 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
            <span className="text-body-sm text-on-surface-variant text-center">
              Válido únicamente 30 minutos tras finalizar el evento
            </span>
            {process.env.NODE_ENV !== "production" && (
              <span className="text-label-sm font-inter text-secondary text-center">
                Demo: prueba con FIF-IA25 o FBA-AD25
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full h-touch-target-min rounded-xl bg-primary text-on-primary text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
          >
            <BadgeCheck className="w-5 h-5" />
            Acreditar y Reclamar Puntos
          </button>
        </form>
      )}

      {error && (
        <p
          id="codigo-error"
          role="alert"
          className="mt-space-sm flex items-start gap-1.5 text-body-sm text-on-error-container bg-error-container rounded-xl px-3 py-2"
        >
          <ScanLine className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </HojaInferior>
  );
}
