"use client";

import { CalendarDays, MapPin, Share2 } from "lucide-react";
import { HojaInferior } from "@/components/ui/HojaInferior";
import { useAppToast } from "@/context/ToastContext";
import type { Insignia } from "@/data/recompensas";

interface DetalleInsigniaSheetProps {
  insignia: Insignia;
  onClose: () => void;
}

export function DetalleInsigniaSheet({ insignia, onClose }: DetalleInsigniaSheetProps) {
  const showToast = useAppToast();
  const Icono = insignia.icono;

  const compartir = async () => {
    const texto = `Desbloqueé “${insignia.titulo}” en Comunidad UAQ: +${insignia.puntos} Pts${insignia.folio ? ` · Folio ${insignia.folio}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: insignia.titulo, text: texto });
      } catch {
        // el usuario canceló el share nativo, no hay nada que hacer
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(texto);
      showToast("Logro copiado al portapapeles", { tipo: "exito", detalle: "Listo para pegarlo donde quieras." });
    } catch {
      showToast("No se pudo copiar el logro", { tipo: "error" });
    }
  };

  return (
    <HojaInferior titulo={insignia.titulo} subtitulo="Logro Facultativo Oficial" icono={Icono} onClose={onClose}>
      <div className="flex flex-col gap-space-sm pt-space-xs">
        <p className="text-body-md text-on-surface-variant">{insignia.descripcion}</p>
        <div className="grid grid-cols-2 gap-space-xs bg-surface-container-low p-space-sm rounded-lg">
          <div>
            <span className="text-label-sm font-inter text-on-surface-variant flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" /> Fecha Validada
            </span>
            <span className="text-label-lg text-on-surface font-semibold">{insignia.fecha}</span>
          </div>
          <div>
            <span className="text-label-sm font-inter text-on-surface-variant block">Puntos Acreditados</span>
            <span className="text-label-lg text-primary font-bold">+{insignia.puntos} Pts</span>
          </div>
          {insignia.lugar && (
            <div className="col-span-2">
              <span className="text-label-sm font-inter text-on-surface-variant flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Lugar
              </span>
              <span className="text-label-lg text-on-surface font-semibold">{insignia.lugar}</span>
            </div>
          )}
          {insignia.folio && (
            <div className="col-span-2 pt-1">
              <span className="text-label-sm font-inter text-on-surface-variant block">Folio de Verificación UAQ</span>
              <span className="text-label-md font-mono text-on-surface font-semibold">{insignia.folio}</span>
            </div>
          )}
        </div>
        <div className="flex gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={compartir}
            className="flex-1 h-11 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-[18px] h-[18px]" />
            Compartir Logro
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-label-lg font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </HojaInferior>
  );
}
