"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardCheck, QrCode, Trash2, UserCheck, X } from "lucide-react";
import { useAppToast } from "@/context/ToastContext";
import {
  eliminarAsistenciaApi,
  getAsistenciasLista,
  registrarAsistenciaApi,
  type AsistenciaRegistroBackend,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { EscanerCamaraQr } from "./EscanerCamaraQr";

interface PaseListaQrModalProps {
  onClose: () => void;
}

function formatearHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaseListaQrModal({ onClose }: PaseListaQrModalProps) {
  const showToast = useAppToast();
  const session = getStoredSession();
  const [eventoTitulo, setEventoTitulo] = useState("Pase de lista general");
  const [codigoManual, setCodigoManual] = useState("");
  const [asistencias, setAsistencias] = useState<AsistenciaRegistroBackend[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarLista = useCallback(async () => {
    const lista = await getAsistenciasLista();
    setAsistencias(lista);
  }, []);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  const registrarCodigo = useCallback(
    async (valorQrOExp: string) => {
      const limpio = valorQrOExp.trim();
      if (!limpio) return;
      setCargando(true);
      try {
        const reg = await registrarAsistenciaApi({
          codigoQrOExpediente: limpio,
          eventoTitulo: eventoTitulo.trim() || "Pase de lista general",
          tomadoPorId: session?.user?.id,
        });
        setAsistencias((prev) => [reg, ...prev.filter((item) => item.id !== reg.id)]);
        setCodigoManual("");
        window.dispatchEvent(new CustomEvent("uaq:asistencia-actualizada"));
        const pts = reg.puntosOtorgados ?? 100;
        showToast(`Asistencia registrada: ${reg.nombreEstudiante} (+${pts} Pts UAQ)`, {
          tipo: "exito",
          detalle: `EXP-${reg.expediente} · ${reg.eventoTitulo}`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudo registrar asistencia";
        showToast(msg, { tipo: "error" });
      } finally {
        setCargando(false);
      }
    },
    [eventoTitulo, session?.user?.id, showToast]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    registrarCodigo(codigoManual);
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminarAsistenciaApi(id);
      setAsistencias((prev) => prev.filter((a) => a.id !== id));
      window.dispatchEvent(new CustomEvent("uaq:asistencia-actualizada"));
      showToast("Registro eliminado de la lista", { tipo: "info" });
    } catch {
      showToast("No se pudo eliminar el registro", { tipo: "error" });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escaner QR para pase de lista"
      className="fixed inset-0 z-[70] bg-on-surface/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-surface-container-lowest w-full max-w-lg max-h-[90dvh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-5 py-3.5 border-b border-surface-container flex items-center justify-between bg-primary text-on-primary">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <div>
              <h2 className="text-headline-sm leading-tight">Pase de Lista por QR</h2>
              <p className="text-label-sm text-primary-fixed">Coordinacion y Docencia UAQ</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar pase de lista"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-lowest/20 flex items-center justify-center hover:bg-surface-container-lowest/30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          <div>
            <label htmlFor="evento-asistencia" className="block text-label-md text-on-surface-variant mb-1">
              Clase, grupo o evento institucional
            </label>
            <input
              id="evento-asistencia"
              type="text"
              value={eventoTitulo}
              onChange={(e) => setEventoTitulo(e.target.value)}
              placeholder="Ej: Redes Distribuidas · Grupo 34"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <EscanerCamaraQr onDetectado={registrarCodigo} />

          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="qr-input-manual" className="block text-label-md text-on-surface-variant">
              Lector QR externo, codigo pegado o expediente del alumno
            </label>
            <div className="flex gap-2">
              <input
                id="qr-input-manual"
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value)}
                placeholder="Ej: UAQ-QR|EXP:290002 o 290002"
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={cargando || !codigoManual.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Registrar
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-label-sm text-secondary">Escaneo rapido:</span>
              <button
                type="button"
                onClick={() => registrarCodigo("UAQ-QR|EXP:290001")}
                className="text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container hover:bg-primary-fixed cursor-pointer"
              >
                QR EXP-290001
              </button>
              <button
                type="button"
                onClick={() => registrarCodigo("UAQ-QR|EXP:290002")}
                className="text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container hover:bg-primary-fixed cursor-pointer"
              >
                QR EXP-290002
              </button>
            </div>
          </form>

          <div className="space-y-2 pt-2 border-t border-outline-variant/40">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-label-lg text-on-surface">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Asistencias registradas
              </span>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                {asistencias.length} {asistencias.length === 1 ? "presente" : "presentes"}
              </span>
            </div>

            {asistencias.length === 0 ? (
              <p className="text-body-sm text-secondary text-center py-4">
                Aun no hay alumnos registrados. Escanea el QR de una credencial para pasar lista.
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {asistencias.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-label-md text-on-surface font-semibold truncate">
                          {item.nombreEstudiante}
                        </p>
                        <p className="text-body-sm text-secondary truncate">
                          EXP-{item.expediente} · {item.eventoTitulo} · {formatearHora(item.fechaRegistro)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 text-label-sm px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        +{item.puntosOtorgados ?? 100} Pts
                      </span>
                      <button
                        type="button"
                        aria-label="Eliminar asistencia"
                        onClick={() => handleEliminar(item.id)}
                        className="p-1 text-secondary hover:text-error rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
