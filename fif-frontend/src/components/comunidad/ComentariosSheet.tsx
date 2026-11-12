"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Ban,
  BadgeCheck,
  Bot,
  Check,
  ChevronDown,
  CornerDownRight,
  Flag,
  Heart,
  Megaphone,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Reply,
  Save,
  Send,
  Trash2,
  UnfoldVertical,
  X,
} from "lucide-react";
import { useComunidad } from "@/context/ComunidadContext";
import { useAppToast } from "@/context/ToastContext";
import { usePerfil } from "@/context/PerfilContext";
import {
  contarComentarios,
  MOTIVOS_REPORTE,
  type ComentarioComunidad,
  type MotivoReporte,
  type PostComunidad,
} from "@/data/comunidad";

type Orden = "Más relevantes" | "Más recientes";
const ORDENES: Orden[] = ["Más relevantes", "Más recientes"];

const ICONO_MOTIVO = { block: Ban, warning: AlertTriangle, bot: Bot, campaign: Megaphone } as const;

function Avatar({ url, siglas, clases, tamano }: { url?: string; siglas: string; clases: string; tamano: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- avatares remotos del diseño de Stitch
    return <img src={url} alt="" className={`${tamano} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${tamano} rounded-full flex items-center justify-center font-bold shrink-0 ${clases}`}>{siglas}</div>
  );
}

function BotonLike({ liked, likes, onClick, pequeno }: { liked?: boolean; likes: number; onClick: () => void; pequeno?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={!!liked}
      aria-label={liked ? "Quitar me gusta" : "Me gusta"}
      onClick={onClick}
      className={`flex items-center gap-1 transition-all active:scale-125 ${
        liked ? "text-error font-bold" : "text-on-surface-variant hover:text-error"
      }`}
    >
      <Heart className={`${pequeno ? "w-3.5 h-3.5" : "w-4 h-4"} ${liked ? "fill-current" : ""}`} />
      <span className={pequeno ? "text-label-sm font-inter" : "text-label-md"}>{likes}</span>
    </button>
  );
}

function Modal({ children, onClose, abajo }: { children: ReactNode; onClose: () => void; abajo?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[65] bg-on-surface/40 backdrop-blur-sm flex justify-center ${
        abajo ? "items-end" : "items-center px-4"
      }`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className={abajo ? "w-full max-w-lg" : "w-full max-w-sm"}>
        {children}
      </div>
    </div>
  );
}

interface ComentariosSheetProps {
  post: PostComunidad;
  onClose: () => void;
}

export function ComentariosSheet({ post, onClose }: ComentariosSheetProps) {
  const showToast = useAppToast();
  const { perfil } = usePerfil();
  const { comentar, responder, editarComentario, eliminarComentario, restaurarComentario, alternarLike } = useComunidad();

  const [orden, setOrden] = useState<Orden>("Más relevantes");
  const [menuOrden, setMenuOrden] = useState(false);
  const [menuComentario, setMenuComentario] = useState<string | null>(null);
  const [editando, setEditando] = useState<{ id: string; texto: string } | null>(null);
  const [eliminando, setEliminando] = useState<ComentarioComunidad | null>(null);
  const [reportando, setReportando] = useState<{ autor: string; texto: string } | null>(null);
  const [motivo, setMotivo] = useState<MotivoReporte>(MOTIVOS_REPORTE[0].id);
  const [detalles, setDetalles] = useState("");
  const [hilosOcultos, setHilosOcultos] = useState<Record<string, boolean>>({});
  const [texto, setTexto] = useState("");
  const [respondiendoA, setRespondiendoA] = useState<{ comentarioId: string; autor: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  // Escape cierra primero el modal más interno; el fondo no se desplaza mientras la hoja está abierta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (reportando) setReportando(null);
      else if (eliminando) setEliminando(null);
      else if (editando) setEditando(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose, reportando, eliminando, editando]);

  const total = contarComentarios(post);

  const comentarios = useMemo(() => {
    const copia = [...post.comentariosLista];
    if (orden === "Más recientes") return copia.sort((a, b) => b.creadoEn - a.creadoEn);
    // Relevancia: los recién publicados por el usuario se quedan al final para que los vea aparecer.
    return copia.sort((a, b) => {
      if (a.recienPublicado !== b.recienPublicado) return a.recienPublicado ? 1 : -1;
      return b.likes + b.respuestas.length - (a.likes + a.respuestas.length);
    });
  }, [post.comentariosLista, orden]);

  const cerrarMenus = () => {
    setMenuComentario(null);
    setMenuOrden(false);
  };

  const handleLike = (comentarioId: string, respuestaId?: string) => {
    if (alternarLike(post.id, comentarioId, respuestaId)) showToast("Te gusta este comentario", { tipo: "exito", duracion: 1800 });
  };

  const guardarEdicion = () => {
    if (!editando) return;
    if (!editando.texto.trim()) {
      showToast("El comentario no puede estar vacío", { tipo: "advertencia" });
      return;
    }
    editarComentario(post.id, editando.id, editando.texto);
    setEditando(null);
    showToast("Comentario editado con éxito", { tipo: "editado", detalle: "Actualizado en el hilo." });
  };

  const confirmarEliminar = () => {
    if (!eliminando) return;
    const resultado = eliminarComentario(post.id, eliminando.id);
    setEliminando(null);
    if (!resultado) return;
    showToast("Comentario eliminado", {
      tipo: "eliminado",
      detalle: "Deshacer disponible",
      cuentaRegresiva: true,
      duracion: 5000,
      accion: {
        label: "Deshacer",
        onClick: () => {
          restaurarComentario(post.id, resultado.comentario, resultado.indice);
          showToast("Comentario restaurado", { tipo: "restaurado", duracion: 2500 });
        },
      },
    });
  };

  const enviarReporte = () => {
    // TODO: enviar el reporte al endpoint de moderación cuando exista.
    setReportando(null);
    setDetalles("");
    showToast("Gracias. Tu reporte ha sido enviado a la coordinación", { tipo: "exito", detalle: `Motivo: ${motivo}` });
  };

  const iniciarRespuesta = (comentarioId: string, autor: string) => {
    setRespondiendoA({ comentarioId, autor });
    setHilosOcultos((h) => ({ ...h, [comentarioId]: false }));
    inputRef.current?.focus();
  };

  const insertar = (valor: string) => {
    setTexto((t) => t + valor);
    inputRef.current?.focus();
  };

  const publicar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    if (respondiendoA) {
      responder(post.id, respondiendoA.comentarioId, limpio, respondiendoA.autor);
      setRespondiendoA(null);
      showToast("Respuesta publicada en el hilo", { tipo: "exito" });
    } else {
      comentar(post.id, limpio);
      showToast("Comentario publicado", { tipo: "exito" });
      requestAnimationFrame(() => finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
    setTexto("");
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Comentarios de la publicación" className="fixed inset-0 z-[60] bg-surface flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.04)] pt-safe">
        <div className="h-16 px-screen-margin-mobile flex items-center justify-between gap-space-xs max-w-2xl mx-auto">
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              aria-label="Volver a Comunidad"
              onClick={onClose}
              className="w-touch-target-min h-touch-target-min -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-headline-sm text-on-surface leading-tight">Comentarios</h1>
              <span className="text-label-sm font-inter text-on-surface-variant">En hilo de UAQnecta</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-sm flex items-center justify-center ring-2 ring-surface-container-high">
            {perfil.siglas}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-screen-margin-mobile pt-space-xs pb-32" onClick={cerrarMenus}>
        <div className="max-w-2xl mx-auto flex flex-col gap-space-md">
          {/* 1. Resumen de la publicación */}
          <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="relative">
                  <Avatar url={post.autor.avatarUrl} siglas={post.autor.siglas} clases={post.autor.avatarClases} tamano="w-10 h-10 text-headline-sm" />
                  {post.autor.verificado && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary">
                      <BadgeCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-headline-sm text-on-surface truncate">{post.autor.nombre}</span>
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-inter ${post.autor.facultadClases}`}>{post.autor.facultad}</span>
                  </div>
                  <span className="text-body-sm text-on-surface-variant truncate">{post.subtituloTiempo}</span>
                </div>
              </div>
              {post.etiquetaDestacada && (
                <span className="px-2 py-1 bg-surface-container-low text-secondary rounded-lg text-label-sm font-inter uppercase tracking-wider shrink-0">
                  {post.etiquetaDestacada}
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface">{post.texto}</p>
            {post.textoSecundario && <p className="text-body-sm text-secondary">{post.textoSecundario}</p>}
            <div className="flex items-center justify-between pt-space-xs text-on-surface-variant text-label-md">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">🔥</span>
                <span className="text-on-surface">{post.fuegos} reacciones</span>
              </span>
              <span className="flex items-center gap-1 text-primary font-bold">
                <MessageSquare className="w-4 h-4" />
                {total} comentarios
              </span>
            </div>
          </article>

          {/* 2. Encabezado con orden */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-headline-sm text-on-surface">Comentarios</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-inter">{total}</span>
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={menuOrden}
                onClick={() => setMenuOrden((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-label-md active:scale-95 transition-transform"
              >
                {orden}
                <ChevronDown className="w-4 h-4" />
              </button>
              {menuOrden && (
                <div role="listbox" className="absolute right-0 mt-1 w-44 bg-surface-container-lowest rounded-xl shadow-xl z-30 py-1 flex flex-col">
                  {ORDENES.map((o) => (
                    <button
                      key={o}
                      type="button"
                      role="option"
                      aria-selected={orden === o}
                      onClick={() => {
                        setOrden(o);
                        setMenuOrden(false);
                        showToast(`Ordenando por: ${o}`, { duracion: 1800 });
                      }}
                      className={`px-4 py-2 text-left text-label-md hover:bg-surface-container-low flex items-center justify-between ${
                        orden === o ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {o}
                      {orden === o && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Lista de comentarios */}
          <section className="flex flex-col gap-space-sm" aria-live="polite">
            {comentarios.length === 0 && (
              <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                <MessageSquare className="w-8 h-8 text-outline mx-auto mb-2" />
                <p className="text-headline-sm text-on-surface">Sé el primero en comentar</p>
                <p className="text-body-sm text-on-surface-variant">Comparte tu opinión de forma respetuosa.</p>
              </div>
            )}

            {comentarios.map((c) => {
              const enEdicion = editando?.id === c.id;
              const oculto = !!hilosOcultos[c.id];
              return (
                <div key={c.id} className="flex flex-col gap-1">
                  <div
                    className={`rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs ${
                      c.esPropio && !c.recienPublicado ? "bg-primary/5" : "bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-space-xs min-w-0">
                        <Avatar url={c.avatarUrl} siglas={c.siglas} clases={c.avatarClases} tamano="w-8 h-8 text-label-md" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-headline-sm text-on-surface">{c.autor}</span>
                            {c.verificado && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                            {c.esPropio && (
                              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-label-sm font-inter">Tú</span>
                            )}
                            {c.insignia && (
                              <span className={`px-1.5 py-0.5 rounded text-label-sm font-inter ${c.insigniaClases ?? "bg-surface-container-high text-on-surface-variant"}`}>
                                {c.insignia}
                              </span>
                            )}
                          </div>
                          <span className="text-body-sm text-on-surface-variant">
                            {c.tiempo} {c.editado && <span className="text-primary font-medium">(editado)</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {c.recienPublicado && (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-label-sm font-inter">Publicado</span>
                        )}
                        <div className="relative">
                          <button
                            type="button"
                            aria-label={c.esPropio ? "Gestionar tu comentario" : "Opciones del comentario"}
                            aria-haspopup="menu"
                            aria-expanded={menuComentario === c.id}
                            onClick={() => setMenuComentario((m) => (m === c.id ? null : c.id))}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container active:scale-90 transition-transform"
                          >
                            {c.esPropio ? <MoreVertical className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                          </button>
                          {menuComentario === c.id && (
                            <div role="menu" className="absolute right-0 top-9 w-48 bg-surface-container-lowest rounded-xl shadow-xl z-30 py-1.5 flex flex-col">
                              {c.esPropio ? (
                                <>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setMenuComentario(null);
                                      setEditando({ id: c.id, texto: c.texto });
                                    }}
                                    className="px-4 py-2.5 text-left text-label-md text-on-surface hover:bg-surface-container flex items-center gap-2"
                                  >
                                    <Pencil className="w-4 h-4 text-primary" /> Editar comentario
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setMenuComentario(null);
                                      setEliminando(c);
                                    }}
                                    className="px-4 py-2.5 text-left text-label-md text-error hover:bg-error-container/20 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" /> Eliminar comentario
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuComentario(null);
                                    setReportando({ autor: c.autor, texto: c.texto });
                                  }}
                                  className="px-4 py-2.5 text-left text-label-md text-error hover:bg-error-container/20 flex items-center gap-2"
                                >
                                  <Flag className="w-4 h-4" /> Reportar a moderación
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {enEdicion ? (
                      <div className="pl-10 flex flex-col gap-2 pt-1">
                        <div className="flex items-center justify-between text-primary text-label-sm font-inter">
                          <span className="flex items-center gap-1">
                            <Pencil className="w-3.5 h-3.5" /> Editando tu comentario...
                          </span>
                          <span className="text-on-surface-variant">Presiona guardar para actualizar</span>
                        </div>
                        <textarea
                          autoFocus
                          aria-label="Editar comentario"
                          rows={3}
                          value={editando.texto}
                          onChange={(e) => setEditando({ id: c.id, texto: e.target.value })}
                          className="w-full p-2.5 bg-surface rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-inner resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditando(null)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={guardarEdicion}
                            className="px-4 py-1.5 rounded-lg bg-primary text-label-md text-on-primary hover:bg-primary-container shadow-sm active:scale-95 transition-all flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Guardar cambios
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pl-10 flex flex-col gap-2">
                        <p className="text-body-md text-on-surface whitespace-pre-wrap break-words">{c.texto}</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-4">
                            <BotonLike liked={c.liked} likes={c.likes} onClick={() => handleLike(c.id)} />
                            <button
                              type="button"
                              onClick={() => iniciarRespuesta(c.id, c.autor)}
                              className="text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                            >
                              <Reply className="w-4 h-4" /> Responder
                            </button>
                          </div>
                          {c.respuestas.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setHilosOcultos((h) => ({ ...h, [c.id]: !h[c.id] }))}
                              className="flex items-center gap-1 text-primary text-label-sm font-inter hover:underline"
                            >
                              <UnfoldVertical className="w-3.5 h-3.5" />
                              {oculto ? "Ver" : "Ocultar"} respuestas ({c.respuestas.length})
                            </button>
                          ) : (
                            c.ubicacion && <span className="text-label-sm font-inter text-on-surface-variant/80">{c.ubicacion}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hilo anidado */}
                  {c.respuestas.length > 0 && !oculto && (
                    <div className="relative ml-4 pl-6 pt-1 flex flex-col gap-2 before:absolute before:left-2 before:top-0 before:bottom-3 before:w-0.5 before:bg-outline-variant/50">
                      {c.respuestas.map((r) => (
                        <div key={r.id} className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-space-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-space-xs min-w-0">
                              <Avatar siglas={r.siglas} clases={r.avatarClases} tamano="w-6 h-6 text-[10px]" />
                              <div className="flex items-center gap-1 flex-wrap min-w-0">
                                <span className="text-[13px] font-semibold text-on-surface truncate">{r.autor}</span>
                                {r.verificado && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                                {r.esAutorPost && <span className="text-body-sm text-on-surface-variant">• autor</span>}
                                {r.esPropio && <span className="px-1.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">Tú</span>}
                                {r.facultad && (
                                  <span className="px-1.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-semibold">{r.facultad}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-on-surface-variant shrink-0">{r.tiempo}</span>
                          </div>
                          <p className="text-body-md text-on-surface pl-8 break-words">
                            {r.mencion && <span className="text-primary font-medium">@{r.mencion} </span>}
                            {r.texto}
                          </p>
                          <div className="pl-8 flex items-center gap-3">
                            <BotonLike pequeno liked={r.liked} likes={r.likes} onClick={() => handleLike(c.id, r.id)} />
                            <button
                              type="button"
                              onClick={() => iniciarRespuesta(c.id, r.autor)}
                              className="text-label-sm font-inter text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                            >
                              <Reply className="w-3.5 h-3.5" /> Responder
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => iniciarRespuesta(c.id, c.autor)}
                        className="flex items-center gap-1.5 text-primary text-label-sm font-inter hover:underline pl-3 py-1 text-left"
                      >
                        <MessageSquarePlus className="w-4 h-4" /> Escribir una respuesta en este hilo...
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={finRef} />
          </section>
        </div>
      </div>

      {/* 4. Barra para redactar */}
      <footer className="fixed bottom-0 inset-x-0 bg-surface-container-lowest/95 backdrop-blur-lg shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.08)] px-screen-margin-mobile pt-2.5 pb-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-1.5">
          {respondiendoA && (
            <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-primary-fixed/60 text-on-primary-fixed text-label-sm font-inter">
              <span className="flex items-center gap-1.5 truncate">
                <CornerDownRight className="w-3.5 h-3.5 text-primary shrink-0" />
                Respondiendo a <strong>@{respondiendoA.autor}</strong>
              </span>
              <button
                type="button"
                aria-label="Cancelar respuesta"
                onClick={() => setRespondiendoA(null)}
                className="w-5 h-5 rounded-full hover:bg-primary/10 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-space-xs">
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-sm shrink-0">
              {perfil.siglas}
            </div>
            <div className="flex-1 flex items-center bg-surface-container-low rounded-full px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
              <input
                ref={inputRef}
                type="text"
                aria-label="Escribe un comentario"
                value={texto}
                maxLength={500}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    publicar();
                  }
                }}
                placeholder={respondiendoA ? `Responder a @${respondiendoA.autor}...` : "Escribe un comentario respetuoso..."}
                className="w-full min-w-0 bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Mencionar usuario"
                onClick={() => insertar("@")}
                className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container shrink-0"
              >
                <AtSign className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Insertar emoji de aplauso"
                onClick={() => insertar("👏 ")}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-sm shrink-0"
              >
                👏
              </button>
            </div>
            <button
              type="button"
              aria-label="Publicar comentario"
              disabled={!texto.trim()}
              onClick={publicar}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 hover:bg-primary-container disabled:opacity-40 disabled:active:scale-100 transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Confirmar eliminación */}
      {eliminando && (
        <Modal onClose={() => setEliminando(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="titulo-eliminar" className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 id="titulo-eliminar" className="text-headline-sm text-on-surface">¿Deseas eliminar este comentario?</h3>
            <p className="text-body-sm text-on-surface-variant">
              Tu aporte se removerá de este hilo de discusión. Tendrás unos segundos para deshacerlo.
            </p>
            <div className="flex items-center justify-end gap-2 pt-space-xs">
              <button type="button" onClick={() => setEliminando(null)} className="px-4 h-10 rounded-xl bg-surface-container text-label-md text-on-surface hover:bg-surface-container-high transition-colors">
                Mantener
              </button>
              <button type="button" onClick={confirmarEliminar} className="px-4 h-10 rounded-xl bg-error text-label-md text-on-error hover:bg-error/90 active:scale-95 transition-transform">
                Sí, eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reportar a moderación */}
      {reportando && (
        <Modal abajo onClose={() => setReportando(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-reporte" className="bg-surface-container-lowest rounded-t-3xl p-space-lg pb-8 shadow-2xl flex flex-col gap-space-md max-h-[88vh] overflow-y-auto">
            <div className="w-12 h-1.5 rounded-full bg-outline-variant mx-auto -mt-2" />
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                    <Flag className="w-4 h-4" />
                  </span>
                  <h3 id="titulo-reporte" className="text-headline-md text-on-surface">Reportar comentario</h3>
                </div>
                <p className="text-body-sm text-on-surface-variant">Ayúdanos a mantener un entorno seguro y respetuoso en la comunidad UAQnecta.</p>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setReportando(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1">
              <span className="text-label-sm font-inter uppercase text-outline">Comentario seleccionado:</span>
              <p className="text-body-sm text-on-surface line-clamp-2 italic">
                &ldquo;{reportando.autor}: {reportando.texto}&rdquo;
              </p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-label-md text-on-surface mb-2">Selecciona el motivo principal:</legend>
              {MOTIVOS_REPORTE.map((m) => {
                const Icono = ICONO_MOTIVO[m.icono];
                return (
                  <label key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-container-low cursor-pointer transition-colors">
                    <span className="flex items-center gap-3">
                      <Icono className={`w-5 h-5 ${m.colorClase}`} />
                      <span className="text-body-md text-on-surface">{m.id}</span>
                    </span>
                    <input type="radio" name="motivo-reporte" checked={motivo === m.id} onChange={() => setMotivo(m.id)} className="w-4 h-4 accent-primary" />
                  </label>
                );
              })}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reporte-detalles" className="text-label-md text-on-surface">Cuéntanos más detalles (opcional):</label>
              <textarea
                id="reporte-detalles"
                rows={2}
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                placeholder="Agrega contexto para el equipo de moderación universitaria..."
                className="w-full p-3 bg-surface rounded-xl text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-inner resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-space-xs">
              <button type="button" onClick={() => setReportando(null)} className="px-space-md h-12 rounded-xl bg-surface-container text-label-lg text-on-surface hover:bg-surface-container-high transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={enviarReporte} className="px-space-lg h-12 rounded-xl bg-error text-label-lg text-on-error hover:bg-error/90 active:scale-95 transition-all flex items-center gap-2 shadow-md">
                <Send className="w-4 h-4" /> Enviar reporte
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

