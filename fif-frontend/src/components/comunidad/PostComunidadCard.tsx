"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Flame,
  HelpCircle,
  Hourglass,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Trophy,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useComunidad } from "@/context/ComunidadContext";
import { useGuardados } from "@/context/GuardadosContext";
import { useAppToast } from "@/context/ToastContext";
import { contarComentarios, type PostComunidad } from "@/data/comunidad";

interface PostComunidadCardProps {
  post: PostComunidad;
  onAbrirComentarios: (postId: string) => void;
}

function AvatarAutor({ post, tamano = "w-10 h-10" }: { post: PostComunidad; tamano?: string }) {
  const { autor } = post;
  return (
    <div className="relative shrink-0">
      {autor.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatares remotos del diseño de Stitch
        <img src={autor.avatarUrl} alt="" className={`${tamano} rounded-full object-cover`} />
      ) : (
        <div className={`${tamano} rounded-full flex items-center justify-center text-headline-sm ${autor.avatarClases}`}>
          {autor.siglas}
        </div>
      )}
      {autor.verificado && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 text-on-primary flex items-center justify-center shadow-sm">
          <BadgeCheck className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}

function NombreAutor({ post }: { post: PostComunidad }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-headline-sm text-on-surface leading-tight">{post.autor.nombre}</span>
      <span className={`text-label-sm font-inter px-2 py-0.5 rounded-full ${post.autor.facultadClases}`}>{post.autor.facultad}</span>
    </div>
  );
}

export function PostComunidadCard({ post, onAbrirComentarios }: PostComunidadCardProps) {
  const showToast = useAppToast();
  const { alternarFuego, alternarInscripcion, comentar } = useComunidad();
  const { estaGuardado, alternar } = useGuardados();
  const [respuesta, setRespuesta] = useState("");
  const [fotoIdx, setFotoIdx] = useState<number | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const fotosGaleria = post.galeria
    ? [post.galeria.principal, post.galeria.secundariaSuperior, post.galeria.secundariaInferior]
    : [];
  const foto = fotoIdx !== null ? fotosGaleria[fotoIdx] ?? null : null;

  useEffect(() => {
    if (fotoIdx === null && !menuAbierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFotoIdx(null);
        setMenuAbierto(false);
      } else if (fotoIdx !== null && fotosGaleria.length > 1) {
        if (e.key === "ArrowRight") setFotoIdx((i) => ((i ?? 0) + 1) % fotosGaleria.length);
        if (e.key === "ArrowLeft") setFotoIdx((i) => ((i ?? 0) - 1 + fotosGaleria.length) % fotosGaleria.length);
      }
    };
    const onClick = () => setMenuAbierto(false);
    document.addEventListener("keydown", onKey);
    if (menuAbierto) window.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [fotoIdx, menuAbierto, fotosGaleria.length]);

  const guardado = estaGuardado(post.id);
  const totalComentarios = contarComentarios(post);
  const abrirHilo = () => onAbrirComentarios(post.id);

  const handleFuego = () => {
    if (alternarFuego(post.id)) showToast("¡Apoyo enviado! 🔥", { tipo: "exito", duracion: 1800 });
  };

  const handleGuardar = () => {
    showToast(alternar(post.id) ? "Publicación guardada en tu perfil" : "Publicación removida de guardados");
  };

  const handleCompartir = async () => {
    const datos = { title: `Comunidad UAQ — ${post.autor.nombre}`, text: post.texto, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(datos);
      } catch {
        // el usuario canceló el share nativo
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(datos.url);
      showToast("Enlace copiado al portapapeles");
    } catch {
      showToast("No se pudo copiar el enlace", { tipo: "error" });
    }
  };

  const enviarRespuestaRapida = () => {
    if (!respuesta.trim()) return;
    comentar(post.id, respuesta);
    setRespuesta("");
    showToast("Respuesta publicada", { tipo: "exito", detalle: `En la pregunta de ${post.autor.nombre}` });
  };

  const handleInscribir = () => {
    if (alternarInscripcion(post.id)) {
      showToast("¡Pre-registro de equipo enviado!", {
        tipo: "exito",
        detalle: "Revisa tu correo institucional para confirmar integrantes.",
      });
    } else {
      showToast("Inscripción cancelada", { tipo: "advertencia" });
    }
  };

  const botonFuego = (
    <button
      type="button"
      aria-pressed={!!post.fuegoActivo}
      aria-label={`Apoyar publicación (${post.fuegos})`}
      onClick={handleFuego}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md active:scale-90 transition-all ${
        post.fuegoActivo ? "bg-error-container text-on-error-container" : "bg-surface-container-low text-secondary hover:text-on-surface"
      }`}
    >
      <Flame className={`w-[18px] h-[18px] ${post.fuegoActivo ? "text-error fill-error" : ""}`} />
      <span className="font-bold">{post.fuegos}</span>
    </button>
  );

  const botonComentarios = (
    <button
      type="button"
      aria-label={`Ver ${totalComentarios} comentarios`}
      onClick={abrirHilo}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-surface-container-low text-secondary hover:text-primary text-label-md transition-colors"
    >
      <MessageCircle className="w-[18px] h-[18px]" />
      <span>{totalComentarios}</span>
    </button>
  );

  const botonCompartir = (
    <button
      type="button"
      aria-label="Compartir"
      onClick={handleCompartir}
      className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-surface-container-low hover:text-primary transition-colors"
    >
      <Share2 className="w-[18px] h-[18px]" />
    </button>
  );

  const botonGuardar = (
    <button
      type="button"
      aria-label={guardado ? "Quitar de guardados" : "Guardar"}
      aria-pressed={guardado}
      onClick={handleGuardar}
      className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-surface-container-low hover:text-primary transition-colors"
    >
      <Bookmark className={`w-[18px] h-[18px] ${guardado ? "fill-current text-primary" : ""}`} />
    </button>
  );

  // Convocatoria oficial con banner
  if (post.tipo === "convocatoria" && post.eventoConvocatoria) {
    const ev = post.eventoConvocatoria;
    return (
      <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-card-padding pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <NombreAutor post={post} />
              <span className="text-body-sm text-secondary">{post.subtituloTiempo}</span>
            </div>
          </div>
          {botonGuardar}
        </div>

        <div className="relative w-full h-44 bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del diseño de Stitch */}
          <img src={ev.imagenUrl} alt={ev.imagenAlt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex flex-col justify-end p-card-padding">
            <span className="bg-primary-container text-on-primary text-label-sm font-inter px-2.5 py-0.5 rounded-full w-max mb-1 shadow-sm">
              {ev.torneoPill}
            </span>
            <h2 className="text-headline-lg text-surface-container-lowest leading-snug">{ev.titulo}</h2>
          </div>
        </div>

        <div className="p-card-padding flex flex-col gap-space-xs">
          <p className="text-body-md text-on-surface">{post.texto}</p>
          <div className="flex flex-wrap gap-2 py-1">
            <span className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant text-label-md">
              <CalendarDays className="w-4 h-4 text-primary" /> {ev.fecha}
            </span>
            <span className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant text-label-md">
              <MapPin className="w-4 h-4 text-tertiary" /> {ev.lugar}
            </span>
            <span className="flex items-center gap-1.5 bg-error-container px-3 py-1.5 rounded-lg text-on-error-container text-label-md">
              <Hourglass className="w-4 h-4 text-error" /> {ev.cierre}
            </span>
          </div>
          <div className="pt-1 flex items-center gap-space-xs">
            <button
              type="button"
              aria-pressed={!!ev.inscrito}
              onClick={handleInscribir}
              className={`flex-1 h-touch-target-min rounded-xl text-headline-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
                ev.inscrito ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-primary-container hover:bg-primary text-on-primary"
              }`}
            >
              {ev.inscrito ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {ev.inscrito ? "Equipo pre-registrado" : ev.ctaLabel}
            </button>
            {botonComentarios}
            {botonCompartir}
          </div>
        </div>
      </article>
    );
  }

  // Pregunta comunitaria con respuestas en vivo
  if (post.tipo === "pregunta") {
    const ultimas = post.comentariosLista.slice(-2);
    const primerNombre = post.autor.nombre.split(" ")[0];
    return (
      <article className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm flex flex-col gap-space-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AvatarAutor post={post} />
            <div className="flex flex-col min-w-0">
              <NombreAutor post={post} />
              <div className="flex items-center gap-1 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-body-sm text-primary font-semibold">{post.etiquetaDestacada}</span>
                <span className="text-body-sm text-secondary">• {post.subtituloTiempo}</span>
              </div>
            </div>
          </div>
          <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-xl">
          <p className="text-headline-sm text-on-surface mb-1">{post.texto}</p>
          {post.textoSecundario && <p className="text-body-sm text-secondary">{post.textoSecundario}</p>}
        </div>

        {ultimas.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 pl-2">
            {ultimas.map((c) => (
              <div key={c.id} className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded-lg shadow-sm">
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatares remotos del diseño de Stitch
                  <img src={c.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${c.avatarClases}`}>
                    {c.siglas}
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 min-w-0">
                      <span className="text-label-md text-on-surface truncate">{c.autor}</span>
                      {c.verificado && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                    </span>
                    <span className="text-label-sm font-inter text-secondary shrink-0">{c.tiempo}</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant break-words">{c.texto}</p>
                </div>
              </div>
            ))}
            {post.comentariosLista.length > ultimas.length && (
              <button type="button" onClick={abrirHilo} className="text-label-md text-primary hover:underline text-left pl-1">
                Ver las {totalComentarios} respuestas
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            aria-label={`Responder a ${primerNombre}`}
            value={respuesta}
            maxLength={500}
            onChange={(e) => setRespuesta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                enviarRespuestaRapida();
              }
            }}
            placeholder={`Responder a ${primerNombre}...`}
            className="flex-1 min-w-0 bg-surface-container-low text-on-surface text-body-sm px-3.5 py-2 rounded-full placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            aria-label="Enviar respuesta"
            disabled={!respuesta.trim()}
            onClick={enviarRespuestaRapida}
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center active:scale-95 shadow-sm disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-space-xs">
          <div className="flex items-center gap-space-xs">
            {botonFuego}
            {botonComentarios}
          </div>
          <div className="flex items-center gap-1">
            {botonCompartir}
            {botonGuardar}
          </div>
        </div>
      </article>
    );
  }

  // Vida estudiantil (galería) y debates
  return (
    <>
      <article className="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm flex flex-col gap-space-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AvatarAutor post={post} />
            <div className="flex flex-col min-w-0">
              <NombreAutor post={post} />
              <span className="text-body-sm text-secondary">{post.subtituloTiempo}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {post.etiquetaDestacada && (
              <span className="px-2 py-1 bg-surface-container-low text-secondary rounded-lg text-label-sm font-inter uppercase tracking-wider shrink-0">
                {post.etiquetaDestacada}
              </span>
            )}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                aria-label="Opciones de publicación"
                aria-haspopup="menu"
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto((v) => !v)}
                className="w-touch-target-min h-touch-target-min -mr-2 flex items-center justify-center rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {menuAbierto && (
                <div
                  role="menu"
                  className="absolute right-0 top-10 w-48 bg-surface-container-lowest rounded-xl shadow-xl z-30 py-1.5 flex flex-col border border-surface-container"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAbierto(false);
                      abrirHilo();
                    }}
                    className="px-4 py-2.5 text-left text-label-md text-on-surface hover:bg-surface-container flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Ver discusión ({totalComentarios})
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAbierto(false);
                      showToast("Reporte enviado a coordinación universitaria", {
                        tipo: "info",
                        detalle: `Publicación de ${post.autor.nombre} en revisión.`,
                      });
                    }}
                    className="px-4 py-2.5 text-left text-label-md text-error hover:bg-error-container/20 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Reportar publicación
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-body-md text-on-surface">{post.texto}</p>

        {post.galeria && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mt-1">
            <button type="button" aria-label="Ver foto 1" onClick={() => setFotoIdx(0)} className="h-44 bg-surface-container overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del diseño de Stitch */}
              <img src={post.galeria.principal.url} alt={post.galeria.principal.alt} className="w-full h-full object-cover active:scale-105 transition-transform" />
            </button>
            <div className="h-44 flex flex-col gap-2">
              <button type="button" aria-label="Ver foto 2" onClick={() => setFotoIdx(1)} className="h-[84px] bg-surface-container overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del diseño de Stitch */}
                <img src={post.galeria.secundariaSuperior.url} alt={post.galeria.secundariaSuperior.alt} className="w-full h-full object-cover" />
              </button>
              <button type="button" aria-label="Ver más fotos" onClick={() => setFotoIdx(2)} className="h-[84px] bg-surface-container overflow-hidden rounded-lg relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del diseño de Stitch */}
                <img src={post.galeria.secundariaInferior.url} alt={post.galeria.secundariaInferior.alt} className="w-full h-full object-cover" />
                {post.galeria.secundariaInferior.extraCount > 0 && (
                  <span className="absolute inset-0 bg-secondary/40 flex items-center justify-center text-on-primary text-headline-sm backdrop-blur-[2px]">
                    +{post.galeria.secundariaInferior.extraCount} fotos
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-space-xs mt-1">
          <div className="flex items-center gap-space-xs">
            {botonFuego}
            {botonComentarios}
          </div>
          <div className="flex items-center gap-1">
            {botonCompartir}
            {botonGuardar}
          </div>
        </div>
      </article>

      {foto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
          onClick={() => setFotoIdx(null)}
          className="fixed inset-0 z-[65] bg-on-surface/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Cerrar imagen"
            onClick={() => setFotoIdx(null)}
            className="absolute top-6 right-5 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative flex items-center justify-center max-w-full" onClick={(e) => e.stopPropagation()}>
            {fotosGaleria.length > 1 && (
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={() => setFotoIdx((i) => ((i ?? 0) - 1 + fotosGaleria.length) % fotosGaleria.length)}
                className="absolute left-2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota del diseño de Stitch */}
            <img src={foto.url} alt={foto.alt} className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl" />
            {fotosGaleria.length > 1 && (
              <button
                type="button"
                aria-label="Siguiente foto"
                onClick={() => setFotoIdx((i) => ((i ?? 0) + 1) % fotosGaleria.length)}
                className="absolute right-2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-body-sm text-white/90 text-center max-w-md mt-3">
            {(fotoIdx ?? 0) + 1} / {fotosGaleria.length} • {foto.alt}
          </p>
        </div>
      )}
    </>
  );
}

