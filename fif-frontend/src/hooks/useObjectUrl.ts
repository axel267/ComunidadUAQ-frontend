"use client";

import { useEffect, useState } from "react";

// Crea la URL temporal dentro del efecto (y la revoca al limpiar) para que sobreviva al doble
// montaje de StrictMode, que revocaría una URL creada durante el render.
export function useObjectUrl(archivo?: File) {
  const [actual, setActual] = useState<{ archivo: File; url: string } | null>(null);

  useEffect(() => {
    if (!archivo) return;
    const url = URL.createObjectURL(archivo);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la URL solo existe tras crearla en el efecto
    setActual({ archivo, url });
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  return archivo && actual?.archivo === archivo ? actual.url : null;
}
