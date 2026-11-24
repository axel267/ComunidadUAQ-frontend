"use client";

import { Download } from "lucide-react";
import { useAppToast } from "@/context/ToastContext";

interface DescargarAdjuntoProps {
  url?: string | null;
  nombre: string;
  etiqueta?: string;
}

const CLASES =
  "flex items-center justify-center gap-2 h-touch-target-min px-space-md rounded-xl bg-primary text-on-primary text-label-lg shadow-sm active:scale-95 transition-transform";

export function DescargarAdjunto({ url, nombre, etiqueta = "Descargar adjunto" }: DescargarAdjuntoProps) {
  const showToast = useAppToast();

  if (url) {
    return (
      <a href={url} download={nombre} target="_blank" rel="noopener noreferrer" className={CLASES}>
        <Download className="w-5 h-5" />
        {etiqueta}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => showToast("El archivo aún no está disponible para descarga", { tipo: "advertencia" })}
      className={CLASES}
    >
      <Download className="w-5 h-5" />
      {etiqueta}
    </button>
  );
}
