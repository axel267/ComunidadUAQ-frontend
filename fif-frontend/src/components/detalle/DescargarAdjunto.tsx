"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppToast } from "@/context/ToastContext";

interface DescargarAdjuntoProps {
  url?: string | null;
  nombre: string;
  etiqueta?: string;
}

const CLASES =
  "flex items-center justify-center gap-2 h-touch-target-min px-space-md rounded-xl bg-primary text-on-primary text-label-lg shadow-sm active:scale-95 transition-transform disabled:opacity-60";

export function DescargarAdjunto({ url, nombre, etiqueta = "Descargar adjunto" }: DescargarAdjuntoProps) {
  const showToast = useAppToast();
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    if (!url) {
      showToast("El archivo aún no está disponible para descarga", { tipo: "advertencia" });
      return;
    }
    setDescargando(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("descarga");
      const href = URL.createObjectURL(await res.blob());
      const enlace = document.createElement("a");
      enlace.href = href;
      enlace.download = nombre;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(href);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <button type="button" onClick={descargar} disabled={descargando} className={CLASES}>
      {descargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      {etiqueta}
    </button>
  );
}
