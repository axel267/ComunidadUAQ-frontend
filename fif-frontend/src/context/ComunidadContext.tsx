"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import {
  POSTS_COMUNIDAD_INICIALES,
  type ComentarioComunidad,
  type PostComunidad,
  type RespuestaComentario,
} from "@/data/comunidad";
import { usePerfil } from "@/context/PerfilContext";
import {
  getPostsComunidad,
  votarPublicacion,
  deletePublicacion,
  createComentario,
  votarComentario,
  deleteComentario,
} from "@/services/api";

interface ComunidadContextValue {
  posts: PostComunidad[];
  eliminarPost: (postId: string) => void;
  /** Devuelve true si el fuego quedó activo. */
  alternarFuego: (postId: string) => boolean;
  /** Devuelve true si el equipo quedó inscrito. */
  alternarInscripcion: (postId: string) => boolean;
  comentar: (postId: string, texto: string) => void;
  responder: (postId: string, comentarioId: string, texto: string, mencion?: string) => void;
  editarComentario: (postId: string, comentarioId: string, texto: string) => void;
  /** Elimina el comentario y lo devuelve (con su posición) para poder deshacer. */
  eliminarComentario: (postId: string, comentarioId: string) => { comentario: ComentarioComunidad; indice: number } | null;
  restaurarComentario: (postId: string, comentario: ComentarioComunidad, indice: number) => void;
  /** Devuelve true si quedó con "me gusta". */
  alternarLike: (postId: string, comentarioId: string, respuestaId?: string) => boolean;
}

const ComunidadContext = createContext<ComunidadContextValue | null>(null);

// TODO: sustituir por llamadas a la API cuando el backend exponga el feed comunitario y sus comentarios.
export function ComunidadProvider({ children }: { children: ReactNode }) {
  const { perfil } = usePerfil();
  const [posts, setPosts] = useState<PostComunidad[]>(POSTS_COMUNIDAD_INICIALES);

  useEffect(() => {
    getPostsComunidad()
      .then((data) => {
        if (data.length > 0) {
          setPosts(data);
        }
      })
      .catch((err) => {
        console.error("Error al cargar publicaciones de la comunidad:", err);
      });
  }, []);

  const autorActual = useMemo(
    () => ({
      autor: perfil.nombre,
      siglas: perfil.siglas,
      avatarClases: "bg-primary text-on-primary",
      esPropio: true,
    }),
    [perfil.nombre, perfil.siglas]
  );

  const actualizarPost = useCallback((postId: string, cambio: (post: PostComunidad) => PostComunidad) => {
    setPosts((actuales) => actuales.map((p) => (p.id === postId ? cambio(p) : p)));
  }, []);

  const actualizarComentarios = useCallback(
    (postId: string, cambio: (lista: ComentarioComunidad[]) => ComentarioComunidad[]) =>
      actualizarPost(postId, (p) => ({ ...p, comentariosLista: cambio(p.comentariosLista) })),
    [actualizarPost]
  );

  const alternarFuego = useCallback(
    (postId: string) => {
      const activo = !posts.find((p) => p.id === postId)?.fuegoActivo;
      actualizarPost(postId, (p) => ({ ...p, fuegoActivo: activo, fuegos: Math.max(0, p.fuegos + (activo ? 1 : -1)) }));
      const numId = Number(postId);
      if (!Number.isNaN(numId)) {
        votarPublicacion(numId, activo ? 1 : -1).catch(() => {});
      }
      return activo;
    },
    [posts, actualizarPost]
  );

  const alternarInscripcion = useCallback(
    (postId: string) => {
      const inscrito = !posts.find((p) => p.id === postId)?.eventoConvocatoria?.inscrito;
      actualizarPost(postId, (p) =>
        p.eventoConvocatoria ? { ...p, eventoConvocatoria: { ...p.eventoConvocatoria, inscrito } } : p
      );
      return inscrito;
    },
    [posts, actualizarPost]
  );

  const comentar = useCallback(
    (postId: string, texto: string) => {
      const limpio = texto.trim();
      if (!limpio) return;
      const ahora = Date.now();
      const nuevo: ComentarioComunidad = {
        ...autorActual,
        id: `com-${ahora}`,
        recienPublicado: true,
        tiempo: "Ahora mismo",
        creadoEn: ahora,
        texto: limpio,
        likes: 0,
        respuestas: [],
      };
      actualizarComentarios(postId, (lista) => [...lista, nuevo]);

      const numPostId = Number(postId);
      if (!Number.isNaN(numPostId)) {
        createComentario({ publicacionId: numPostId, contenido: limpio })
          .then((backendComentario) => {
            actualizarComentarios(postId, (lista) =>
              lista.map((c) => (c.id === nuevo.id ? { ...c, id: String(backendComentario.id) } : c))
            );
          })
          .catch(() => {});
      }
    },
    [actualizarComentarios, autorActual]
  );

  const responder = useCallback(
    (postId: string, comentarioId: string, texto: string, mencion?: string) => {
      const limpio = texto.trim();
      if (!limpio) return;
      const ahora = Date.now();
      const nueva: RespuestaComentario = {
        ...autorActual,
        id: `resp-${ahora}`,
        tiempo: "Ahora mismo",
        creadoEn: ahora,
        mencion,
        texto: limpio,
        likes: 0,
      };
      actualizarComentarios(postId, (lista) =>
        lista.map((c) => (c.id === comentarioId ? { ...c, respuestas: [...c.respuestas, nueva] } : c))
      );
    },
    [actualizarComentarios, autorActual]
  );

  const editarComentario = useCallback(
    (postId: string, comentarioId: string, texto: string) => {
      const limpio = texto.trim();
      if (!limpio) return;
      actualizarComentarios(postId, (lista) =>
        lista.map((c) => (c.id === comentarioId ? { ...c, texto: limpio, editado: true } : c))
      );
    },
    [actualizarComentarios]
  );

  const eliminarComentario = useCallback(
    (postId: string, comentarioId: string) => {
      const lista = posts.find((p) => p.id === postId)?.comentariosLista ?? [];
      const indice = lista.findIndex((c) => c.id === comentarioId);
      if (indice === -1) return null;
      actualizarComentarios(postId, (actual) => actual.filter((c) => c.id !== comentarioId));
      const numComentarioId = Number(comentarioId);
      if (!Number.isNaN(numComentarioId)) {
        deleteComentario(numComentarioId).catch(() => {});
      }
      return { comentario: lista[indice], indice };
    },
    [posts, actualizarComentarios]
  );

  const eliminarPost = useCallback((postId: string) => {
    const numId = Number(postId);
    if (!Number.isNaN(numId)) {
      deletePublicacion(numId).catch((err) => {
        console.error("Error al eliminar post en el backend:", err);
      });
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const restaurarComentario = useCallback(
    (postId: string, comentario: ComentarioComunidad, indice: number) => {
      actualizarComentarios(postId, (lista) => {
        if (lista.some((c) => c.id === comentario.id)) return lista;
        const copia = [...lista];
        copia.splice(Math.min(indice, copia.length), 0, comentario);
        return copia;
      });
    },
    [actualizarComentarios]
  );

  const alternarLike = useCallback(
    (postId: string, comentarioId: string, respuestaId?: string) => {
      const comentario = posts.find((p) => p.id === postId)?.comentariosLista.find((c) => c.id === comentarioId);
      const objetivo = respuestaId ? comentario?.respuestas.find((r) => r.id === respuestaId) : comentario;
      const liked = !objetivo?.liked;
      const aplicar = <T extends { liked?: boolean; likes: number }>(item: T): T => ({
        ...item,
        liked,
        likes: Math.max(0, item.likes + (liked ? 1 : -1)),
      });
      actualizarComentarios(postId, (lista) =>
        lista.map((c) => {
          if (c.id !== comentarioId) return c;
          if (!respuestaId) return aplicar(c);
          return { ...c, respuestas: c.respuestas.map((r) => (r.id === respuestaId ? aplicar(r) : r)) };
        })
      );
      const numComentarioId = Number(comentarioId);
      if (!Number.isNaN(numComentarioId) && !respuestaId) {
        votarComentario(numComentarioId, liked ? 1 : -1).catch(() => {});
      }
      return liked;
    },
    [posts, actualizarComentarios]
  );

  const valor = useMemo(
    () => ({
      posts,
      eliminarPost,
      alternarFuego,
      alternarInscripcion,
      comentar,
      responder,
      editarComentario,
      eliminarComentario,
      restaurarComentario,
      alternarLike,
    }),
    [posts, eliminarPost, alternarFuego, alternarInscripcion, comentar, responder, editarComentario, eliminarComentario, restaurarComentario, alternarLike]
  );

  return <ComunidadContext.Provider value={valor}>{children}</ComunidadContext.Provider>;
}

export function useComunidad() {
  const ctx = useContext(ComunidadContext);
  if (!ctx) throw new Error("useComunidad debe usarse dentro de <AppProviders>.");
  return ctx;
}
