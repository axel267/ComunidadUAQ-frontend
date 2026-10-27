"use client";

import { useCallback, useState } from "react";
import { AUTOR_MOCK, type AutorPublicacion, type NuevaPublicacion, type Publicacion } from "@/data/publicaciones";

function nuevoId() {
  return `pub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// TODO: reemplazar por llamadas a la API cuando el backend defina el CRUD de publicaciones (RF04).
export function usePublicaciones(autor: AutorPublicacion = AUTOR_MOCK) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  const crear = useCallback(
    (datos: NuevaPublicacion) => {
      const publicacion: Publicacion = { ...datos, id: nuevoId(), autor, creadaEn: Date.now() };
      setPublicaciones((actuales) => [publicacion, ...actuales]);
      return publicacion;
    },
    [autor]
  );

  const editar = useCallback((id: string, datos: NuevaPublicacion) => {
    setPublicaciones((actuales) =>
      actuales.map((p) => (p.id === id ? { ...p, ...datos, editadaEn: Date.now() } : p))
    );
  }, []);

  const eliminar = useCallback((id: string) => {
    setPublicaciones((actuales) => actuales.filter((p) => p.id !== id));
  }, []);

  // Reinserta la publicación respetando el orden original (más recientes primero).
  const restaurar = useCallback((publicacion: Publicacion) => {
    setPublicaciones((actuales) =>
      actuales.some((p) => p.id === publicacion.id)
        ? actuales
        : [...actuales, publicacion].sort((a, b) => b.creadaEn - a.creadaEn)
    );
  }, []);

  return { publicaciones, crear, editar, eliminar, restaurar };
}
