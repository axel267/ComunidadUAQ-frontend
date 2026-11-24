"use client";

import { Trash2 } from "lucide-react";
import type { ComentarioBackend } from "@/services/api";

interface ComentarioItemProps {
  comentario: ComentarioBackend;
  usuarioActualId?: number;
  esAdmin?: boolean;
  onEliminar: (id: number) => void;
}

function obtenerSiglas(nombre?: string): string {
  if (!nombre) return "U";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return (partes[0]?.slice(0, 2) || "U").toUpperCase();
}

function formatearFecha(fechaIso?: string): string {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ComentarioItem({
  comentario,
  usuarioActualId,
  esAdmin,
  onEliminar,
}: ComentarioItemProps) {
  const autorNombre = comentario.autor?.nombre || "Comunidad UAQ";
  const siglas = obtenerSiglas(autorNombre);
  const puedeEliminar =
    esAdmin || (usuarioActualId && comentario.autor?.id === usuarioActualId);

  return (
    <div className="flex items-start gap-2.5 bg-surface-container-low/70 p-2.5 rounded-xl border border-outline-variant/50">
      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0">
        {siglas}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-label-md font-semibold text-on-surface truncate">
              {autorNombre}
            </span>
            <span className="text-body-sm text-secondary font-mono text-[11px]">
              {formatearFecha(comentario.fechaCreacion)}
            </span>
          </div>
          {puedeEliminar && (
            <button
              type="button"
              aria-label="Eliminar comentario"
              onClick={() => onEliminar(comentario.id)}
              className="text-secondary hover:text-error transition-colors p-1 rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-body-sm text-on-surface mt-0.5 whitespace-pre-wrap break-words">
          {comentario.contenido}
        </p>
      </div>
    </div>
  );
}
