"use client";

import { useState } from "react";
import { FileText, Megaphone, X } from "lucide-react";
import { useAppToast } from "@/context/ToastContext";
import { formatearTamanoBytes } from "@/services/comunicadoMapper";
import {
  actualizarComunicadoOficial,
  crearComunicadoOficial,
  subirAdjuntoComunicado,
  type ComunicadoOficial,
  type DatosComunicado,
  type UrgenciaComunicado,
} from "@/services/comunicadoOficial";

interface ComunicadoFormularioProps {
  inicial?: ComunicadoOficial;
  onClose: () => void;
  onGuardado: () => void;
}

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const CAMPO =
  "w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";

export function ComunicadoFormulario({ inicial, onClose, onGuardado }: ComunicadoFormularioProps) {
  const showToast = useAppToast();
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [resumen, setResumen] = useState(inicial?.resumen ?? "");
  const [contenido, setContenido] = useState(inicial?.contenido ?? "");
  const [urgencia, setUrgencia] = useState<UrgenciaComunicado>(inicial?.urgencia ?? "MEDIA");
  const [fechaLimite, setFechaLimite] = useState(inicial?.fechaLimite?.slice(0, 10) ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [quitarAdjunto, setQuitarAdjunto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const adjuntoActual = inicial?.adjuntoUrl && !quitarAdjunto ? inicial : null;

  const elegirArchivo = (nuevo: File | null) => {
    if (nuevo && (nuevo.type !== "application/pdf" || nuevo.size > MAX_PDF_BYTES)) {
      showToast("Selecciona un PDF de máximo 10 MB", { tipo: "advertencia" });
      return;
    }
    setArchivo(nuevo);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) {
      showToast("El título y el contenido son requeridos", { tipo: "advertencia" });
      return;
    }

    setGuardando(true);
    try {
      const datos: DatosComunicado = {
        titulo: titulo.trim(),
        resumen: resumen.trim() || null,
        contenido: contenido.trim(),
        urgencia,
        fechaLimite: fechaLimite || null,
      };

      if (archivo) {
        const subido = await subirAdjuntoComunicado(archivo);
        Object.assign(datos, subido);
      } else if (inicial && quitarAdjunto) {
        Object.assign(datos, { adjuntoUrl: null, adjuntoNombre: null, adjuntoTamano: null });
      }

      if (inicial) await actualizarComunicadoOficial(inicial.id, datos);
      else await crearComunicadoOficial(datos);

      showToast(inicial ? "Comunicado oficial actualizado" : "Comunicado oficial publicado", { tipo: "exito" });
      onGuardado();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo guardar el comunicado", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[58] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={inicial ? "Editar comunicado oficial" : "Publicar comunicado oficial"}
        className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <h3 className="text-title-lg font-bold text-on-surface">
              {inicial ? "Editar Comunicado Oficial" : "Publicar Comunicado Oficial"}
            </h3>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="p-1 rounded-lg text-secondary hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={guardar} className="p-6 overflow-y-auto flex flex-col gap-4">
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1">Título *</label>
            <input
              type="text"
              required
              maxLength={255}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Periodo de Reinscripciones Semestre 2026-A abierto"
              className={CAMPO}
            />
          </div>

          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1">Resumen (se muestra en el banner)</label>
            <textarea
              rows={2}
              maxLength={500}
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Una frase breve para el banner principal"
              className={CAMPO}
            />
          </div>

          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1">Contenido completo *</label>
            <textarea
              rows={6}
              required
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Instrucciones oficiales para la comunidad..."
              className={CAMPO}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Nivel de urgencia *</label>
              <select value={urgencia} onChange={(e) => setUrgencia(e.target.value as UrgenciaComunicado)} className={CAMPO}>
                <option value="URGENTE">Urgente (acuse de recibo obligatorio)</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Fecha límite</label>
              <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className={CAMPO} />
            </div>
          </div>

          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1">Archivo adjunto (PDF, máx. 10 MB)</label>
            {adjuntoActual && !archivo && (
              <div className="flex items-center justify-between gap-2 mb-2 bg-surface-container-low rounded-xl px-3 py-2 text-body-sm text-on-surface">
                <span className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{adjuntoActual.adjuntoNombre}</span>
                </span>
                <button type="button" onClick={() => setQuitarAdjunto(true)} className="text-label-md text-error shrink-0">
                  Quitar
                </button>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
              className="block w-full text-body-sm text-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-primary-fixed file:px-3 file:py-2 file:text-label-md file:text-primary"
            />
            {archivo && (
              <p className="text-body-sm text-secondary mt-1">
                {archivo.name} ({formatearTamanoBytes(archivo.size)})
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary font-medium hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl font-semibold text-on-primary bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {guardando ? "Guardando..." : inicial ? "Guardar cambios" : "Publicar comunicado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
