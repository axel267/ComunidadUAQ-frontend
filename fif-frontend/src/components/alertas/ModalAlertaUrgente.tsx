"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCheck, ShieldAlert, X } from "lucide-react";
import { getAvisosUrgentesPendientes, confirmarLecturaAviso, type AvisoBackend } from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { useAppToast } from "@/context/ToastContext";

export function ModalAlertaUrgente() {
  const showToast = useAppToast();
  const [avisosPendientes, setAvisosPendientes] = useState<AvisoBackend[]>([]);
  const [avisoActual, setAvisoActual] = useState<AvisoBackend | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [cerradoTemporal, setCerradoTemporal] = useState(false);

  const cargarUrgentes = () => {
    const session = getStoredSession();
    const userId = session?.user?.id ?? 2;

    getAvisosUrgentesPendientes(userId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvisosPendientes(data);
          setAvisoActual(data[0]);
          setCerradoTemporal(false);
        } else {
          setAvisosPendientes([]);
          setAvisoActual(null);
        }
      })
      .catch((err) => {
        console.error("Error al cargar alertas urgentes:", err);
      });
  };

  useEffect(() => {
    cargarUrgentes();
  }, []);

  if (!avisoActual || cerradoTemporal) {
    return null;
  }

  const handleConfirmar = async () => {
    setConfirmando(true);
    const session = getStoredSession();
    const userId = session?.user?.id ?? 2;

    try {
      await confirmarLecturaAviso(avisoActual.id, userId);
      showToast("Acuse de recibo registrado exitosamente", { tipo: "exito" });

      const restantes = avisosPendientes.filter((a) => a.id !== avisoActual.id);
      setAvisosPendientes(restantes);
      if (restantes.length > 0) {
        setAvisoActual(restantes[0]);
      } else {
        setAvisoActual(null);
      }
    } catch (err) {
      console.error("Error al registrar acuse de recibo:", err);
      showToast("No se pudo confirmar la lectura. Intenta de nuevo.", { tipo: "error" });
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border-2 border-error overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-error px-6 py-4 flex items-center justify-between text-on-error">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-label-md font-bold tracking-wider uppercase">
              Alerta Universitaria Urgente
            </span>
          </div>
          <button
            onClick={() => setCerradoTemporal(true)}
            aria-label="Cerrar temporalmente"
            className="p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5 text-on-error" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-label-xs font-semibold bg-error-container text-on-error-container">
              Acuse de recibo obligatorio
            </span>
            {avisoActual.facultad && (
              <span className="text-body-xs text-secondary font-medium">
                {avisoActual.facultad.abreviatura} - {avisoActual.facultad.nombre}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-title-lg font-bold text-on-surface leading-snug">
              {avisoActual.titulo}
            </h3>
            <p className="mt-2 text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
              {avisoActual.contenido}
            </p>
          </div>

          <div className="pt-2 text-body-xs text-outline flex items-center justify-between border-t border-outline-variant">
            <span>
              Publicado el:{" "}
              {new Date(avisoActual.fechaPublicacion).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {avisoActual.autor && <span>Emisor: {avisoActual.autor.nombre}</span>}
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleConfirmar}
              disabled={confirmando}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-error text-on-error font-semibold hover:bg-error/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
            >
              <CheckCheck className="w-5 h-5" />
              <span>{confirmando ? "Registrando acuse..." : "Confirmar lectura y enterado"}</span>
            </button>
            <button
              onClick={() => setCerradoTemporal(true)}
              className="px-4 py-3 rounded-xl border border-outline-variant text-secondary font-medium hover:bg-surface-container transition-colors"
            >
              Posponer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
