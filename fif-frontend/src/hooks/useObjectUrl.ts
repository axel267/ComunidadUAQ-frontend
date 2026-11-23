"use client";

import { useEffect, useState } from "react";

// Crea la URL temporal dentro del efecto (y la revoca al limpiar) para que sobreviva al doble
// montaje de StrictMode, que revocaría una URL creada durante el render.
export function useObjectUrl(archivo?: File | Blob | unknown) {
  const [actual, setActual] = useState<{ archivo: unknown; url: string } | null>(null);

  useEffect(() => {
    if (!archivo) {
      setActual(null);
      return;
    }
    if (typeof archivo === "string") {
      setActual({ archivo, url: archivo });
      return;
    }
    if (typeof window === "undefined" || !(archivo instanceof Blob)) {
      setActual(null);
      return;
    }
    try {
      const url = URL.createObjectURL(archivo);
      setActual({ archivo, url });
      return () => URL.revokeObjectURL(url);
    } catch {
      setActual(null);
    }
  }, [archivo]);

  return archivo && actual?.archivo === archivo ? actual.url : null;
}
