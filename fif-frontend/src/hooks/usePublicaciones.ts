"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AUTOR_MOCK,
  type AdjuntoPublicacion,
  type AutorPublicacion,
  type NuevaPublicacion,
  type Publicacion,
} from "@/data/publicaciones";
import { getPostsPorAutor, createPublicacion, deletePublicacion } from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { esIdTemporal, mapearDesdeBackend } from "@/services/publicacionesMapper";
import {
  guardarPublicacionesLocales,
  leerPublicacionesLocales,
  limpiarStorageLegado,
} from "@/services/publicacionesStorage";

function nuevoId() {
  return `pub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function obtenerUserId(): number | undefined {
  return getStoredSession()?.user?.id;
}

function serializarAdjunto(adjunto?: AdjuntoPublicacion): AdjuntoPublicacion | undefined {
  if (adjunto?.tipo !== "documento" || !(adjunto.archivo instanceof File)) return adjunto;
  const { name, size, type } = adjunto.archivo;
  return { ...adjunto, archivo: { name, size, type } as unknown as File };
}

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(archivo);
  });
}

export function usePublicaciones(autor: AutorPublicacion = AUTOR_MOCK) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  const aplicar = useCallback((cambio: (prev: Publicacion[]) => Publicacion[]) => {
    setPublicaciones((prev) => {
      const siguiente = cambio(prev);
      guardarPublicacionesLocales(obtenerUserId(), siguiente);
      return siguiente;
    });
  }, []);

  useEffect(() => {
    limpiarStorageLegado();
    const userId = obtenerUserId();
    if (!userId) {
      setPublicaciones([]);
      return;
    }

    const locales = leerPublicacionesLocales(userId);
    setPublicaciones(locales);

    getPostsPorAutor(userId)
      .then((data) => {
        const propias = (Array.isArray(data) ? data : []).filter(
          (item) => (item.autorId ?? item.autor?.id) === userId
        );
        const remotas = propias.map((item) => {
          const local = locales.find((p) => p.id === String(item.id));
          return mapearDesdeBackend(item, autor, local?.adjunto);
        });
        const pendientes = locales.filter((p) => esIdTemporal(p.id));
        aplicar(() => [...pendientes, ...remotas]);
      })
      .catch((err) => {
        console.error("[ERROR] Sincronizando publicaciones del usuario:", err);
      });
  }, [autor, aplicar]);

  const adjuntarImagenLocal = useCallback(
    (tempId: string, archivo: File) => {
      leerComoDataUrl(archivo)
        .then((dataUrl) =>
          aplicar((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? { ...p, adjunto: { tipo: "imagen" as const, archivo: dataUrl as unknown as File } }
                : p
            )
          )
        )
        .catch(() => {});
    },
    [aplicar]
  );

  const crear = useCallback(
    (datos: NuevaPublicacion) => {
      const userId = obtenerUserId();
      const tempId = nuevoId();
      const temporal: Publicacion = {
        ...datos,
        adjunto: serializarAdjunto(datos.adjunto),
        id: tempId,
        autorId: userId,
        autor,
        creadaEn: Date.now(),
      };

      aplicar((prev) => [temporal, ...prev]);

      if (datos.adjunto?.tipo === "imagen" && datos.adjunto.archivo instanceof File) {
        adjuntarImagenLocal(tempId, datos.adjunto.archivo);
      }

      const imgUrlRemota =
        datos.adjunto?.tipo === "imagen" && typeof datos.adjunto.archivo === "string"
          ? datos.adjunto.archivo
          : undefined;

      const encuestaRemota =
        datos.adjunto?.tipo === "encuesta"
          ? {
              pregunta: datos.adjunto.pregunta,
              opciones: datos.adjunto.opciones,
              duracion: datos.adjunto.duracion,
            }
          : undefined;

      const eventoRemoto =
        datos.adjunto?.tipo === "evento"
          ? {
              titulo: datos.adjunto.titulo,
              fechaHora: datos.adjunto.fechaHora,
              lugar: datos.adjunto.lugar,
            }
          : undefined;

      const textoFinal = datos.texto.trim() || eventoRemoto?.titulo || "Publicacion";

      createPublicacion({
        titulo: textoFinal.slice(0, 100),
        contenido: textoFinal,
        categoria: datos.tema || "comunidad",
        imagenesUrl: imgUrlRemota,
        autorId: userId,
        encuesta: encuestaRemota,
        evento: eventoRemoto,
      })
        .then((creada) =>
          aplicar((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: String(creada.id) } : p)))
        )
        .catch((e) => console.error("[ERROR] Persistiendo publicacion en backend:", e));

      return temporal;
    },
    [autor, aplicar, adjuntarImagenLocal]
  );

  const editar = useCallback(
    (id: string, datos: NuevaPublicacion) => {
      aplicar((prev) => prev.map((p) => (p.id === id ? { ...p, ...datos, editadaEn: Date.now() } : p)));
    },
    [aplicar]
  );

  const eliminar = useCallback(
    (id: string) => {
      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        deletePublicacion(numId).catch(() => {});
      }
      aplicar((prev) => prev.filter((p) => p.id !== id));
    },
    [aplicar]
  );

  const restaurar = useCallback(
    (publicacion: Publicacion) => {
      aplicar((prev) =>
        prev.some((p) => p.id === publicacion.id)
          ? prev
          : [...prev, publicacion].sort((a, b) => b.creadaEn - a.creadaEn)
      );
    },
    [aplicar]
  );

  return { publicaciones, crear, editar, eliminar, restaurar };
}
