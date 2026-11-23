"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AUTOR_MOCK,
  type AutorPublicacion,
  type NuevaPublicacion,
  type Publicacion,
  type TemaPublicacion,
} from "@/data/publicaciones";
import {
  getPostsPorAutor,
  createPublicacion,
  deletePublicacion,
  type PublicacionBackend,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";

const STORAGE_KEY = "fif_publicaciones_usuario";

function nuevoId() {
  return `pub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function parsearTema(categoria?: string): TemaPublicacion {
  if (categoria === "hub" || categoria === "academico" || categoria === "ventas" || categoria === "comunidad") {
    return categoria;
  }
  return "comunidad";
}

function mapearDesdeBackend(item: PublicacionBackend, autor: AutorPublicacion): Publicacion {
  return {
    id: String(item.id),
    texto: item.titulo,
    tema: parsearTema(item.categoria),
    visibilidad: "facultad",
    autor: {
      nombre: item.autor?.nombre || autor.nombre,
      siglas: autor.siglas,
      facultad: autor.facultad,
      etiqueta: autor.etiqueta,
    },
    creadaEn: new Date(item.fechaCreacion).getTime(),
  };
}

export function usePublicaciones(autor: AutorPublicacion = AUTOR_MOCK) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  useEffect(() => {
    try {
      const guardadas = localStorage.getItem(STORAGE_KEY);
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) {
          const limpias = parsed.map((p) => {
            if (
              p.adjunto?.tipo === "imagen" &&
              p.adjunto.archivo &&
              typeof p.adjunto.archivo !== "string" &&
              !(p.adjunto.archivo instanceof Blob)
            ) {
              return { ...p, adjunto: undefined };
            }
            return p;
          });
          setPublicaciones(limpias);
        }
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }

    const session = getStoredSession();
    const userId = session?.user?.id ?? 2;

    getPostsPorAutor(userId)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const remotas = data.map((item) => mapearDesdeBackend(item, autor));
          setPublicaciones(remotas);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remotas));
          } catch {}
        }
      })
      .catch((err) => {
        console.error("Error al sincronizar publicaciones del usuario:", err);
      });
  }, [autor]);

  const crear = useCallback(
    (datos: NuevaPublicacion) => {
      const session = getStoredSession();
      const userId = session?.user?.id ?? 2;
      const temporal: Publicacion = { ...datos, id: nuevoId(), autor, creadaEn: Date.now() };

      setPublicaciones((prev) => {
        const siguiente = [temporal, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
        } catch {}
        return siguiente;
      });

      if (datos.adjunto?.tipo === "imagen" && datos.adjunto.archivo instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setPublicaciones((prev) => {
            const actualizada = prev.map((p) =>
              p.id === temporal.id
                ? {
                    ...p,
                    adjunto: { tipo: "imagen" as const, archivo: dataUrl as unknown as File },
                  }
                : p
            );
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada));
            } catch {}
            return actualizada;
          });
        };
        reader.readAsDataURL(datos.adjunto.archivo);
      }

      createPublicacion({
        titulo: datos.texto.slice(0, 100),
        contenido: datos.texto,
        categoria: datos.tema || "comunidad",
        autorId: userId,
      })
        .then((creadaEnBackend) => {
          setPublicaciones((prev) => {
            const actualizada = prev.map((p) =>
              p.id === temporal.id ? { ...p, id: String(creadaEnBackend.id) } : p
            );
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada));
            } catch {}
            return actualizada;
          });
        })
        .catch((e) => {
          console.error("Error persistiendo publicacion en backend:", e);
        });

      return temporal;
    },
    [autor]
  );

  const editar = useCallback((id: string, datos: NuevaPublicacion) => {
    setPublicaciones((actuales) => {
      const actualizadas = actuales.map((p) =>
        p.id === id ? { ...p, ...datos, editadaEn: Date.now() } : p
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
      } catch {}
      return actualizadas;
    });
  }, []);

  const eliminar = useCallback((id: string) => {
    const numId = Number(id);
    if (!Number.isNaN(numId)) {
      deletePublicacion(numId).catch(() => {});
    }

    setPublicaciones((actuales) => {
      const filtradas = actuales.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
      } catch {}
      return filtradas;
    });
  }, []);

  const restaurar = useCallback((publicacion: Publicacion) => {
    setPublicaciones((actuales) => {
      const lista = actuales.some((p) => p.id === publicacion.id)
        ? actuales
        : [...actuales, publicacion].sort((a, b) => b.creadaEn - a.creadaEn);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      } catch {}
      return lista;
    });
  }, []);

  return { publicaciones, crear, editar, eliminar, restaurar };
}
