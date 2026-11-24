"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, Hourglass, MapPin, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import { ComentariosSheet } from "@/components/comunidad/ComentariosSheet";
import { EncuestaInteractiva } from "@/components/publicar/encuesta/EncuestaInteractiva";
import { useComunidad } from "@/context/ComunidadContext";
import { useAppToast } from "@/context/ToastContext";
import { contarComentarios, type PostComunidad } from "@/data/comunidad";
import { DetalleShell } from "./DetalleShell";

interface DetallePostProps {
  post: PostComunidad;
  onClose: () => void;
}

function Avatar({ post }: { post: PostComunidad }) {
  const { autor } = post;
  if (autor.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- avatares remotos
    return <img src={autor.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-headline-sm shrink-0 ${autor.avatarClases}`}>
      {autor.siglas}
    </div>
  );
}

function ListaComentarios({ post }: { post: PostComunidad }) {
  if (post.comentariosLista.length === 0) {
    return <p className="text-body-sm text-secondary italic">Aún no hay comentarios en esta publicación.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {post.comentariosLista.map((c) => (
        <div key={c.id} className="flex flex-col gap-1 bg-surface-container-low rounded-xl p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-label-md text-on-surface min-w-0">
              {c.autor}
              {c.verificado && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
              {c.insignia && (
                <span className={`text-label-sm font-inter px-1.5 py-0.5 rounded-md ${c.insigniaClases ?? "bg-surface-container text-secondary"}`}>
                  {c.insignia}
                </span>
              )}
            </span>
            <span className="text-label-sm font-inter text-secondary shrink-0">{c.tiempo}</span>
          </div>
          <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap break-words">{c.texto}</p>
          {c.respuestas.map((r) => (
            <div key={r.id} className="ml-3 pl-3 border-l-2 border-outline-variant/60 flex flex-col">
              <span className="text-label-md text-on-surface">
                {r.autor} <span className="text-label-sm font-inter text-secondary">• {r.tiempo}</span>
              </span>
              <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap break-words">{r.texto}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function DetallePost({ post, onClose }: DetallePostProps) {
  const showToast = useAppToast();
  const { alternarInscripcion } = useComunidad();
  const [hiloAbierto, setHiloAbierto] = useState(false);
  const ev = post.eventoConvocatoria;
  const fotos = post.galeria ? [post.galeria.principal, post.galeria.secundariaSuperior, post.galeria.secundariaInferior] : [];
  const total = contarComentarios(post);

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

  return (
    <>
      <DetalleShell etiqueta={ev ? "Convocatoria" : "Publicación"} onClose={onClose} bloquearEscape={hiloAbierto}>
        <div className="flex items-center gap-space-xs">
          <Avatar post={post} />
          <div className="flex flex-col min-w-0">
            <span className="flex items-center gap-1 text-headline-sm text-on-surface">
              {post.autor.nombre}
              {post.autor.verificado && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            </span>
            <span className="text-label-sm font-inter text-secondary">{post.subtituloTiempo}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`text-label-md font-inter px-2.5 py-1 rounded-full ${post.autor.facultadClases}`}>{post.autor.facultad}</span>
          {post.etiquetaDestacada && (
            <span className="text-label-md font-inter px-2.5 py-1 rounded-full bg-surface-container text-secondary">{post.etiquetaDestacada}</span>
          )}
          {post.categoriasFiltro.map((c) => (
            <span key={c} className="text-label-md font-inter px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant">
              #{c}
            </span>
          ))}
        </div>

        {ev && (
          <div className="flex flex-col gap-space-xs">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen remota */}
            <img src={ev.imagenUrl} alt={ev.imagenAlt} className="w-full rounded-xl object-contain bg-surface-container" />
            <span className="bg-primary-container text-on-primary text-label-sm font-inter px-2.5 py-0.5 rounded-full w-max">{ev.torneoPill}</span>
            <h3 className="text-headline-md text-on-surface">{ev.titulo}</h3>
          </div>
        )}

        <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap break-words">{post.texto}</p>
        {post.textoSecundario && post.textoSecundario !== post.texto && (
          <p className="text-body-md text-on-surface-variant whitespace-pre-wrap break-words">{post.textoSecundario}</p>
        )}

        {ev && (
          <>
            <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              aria-pressed={!!ev.inscrito}
              onClick={handleInscribir}
              className={`h-touch-target-min rounded-xl text-headline-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
                ev.inscrito ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-primary-container hover:bg-primary text-on-primary"
              }`}
            >
              {ev.inscrito ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {ev.inscrito ? "Equipo pre-registrado" : ev.ctaLabel}
            </button>
          </>
        )}

        {post.encuesta && <EncuestaInteractiva publicacionId={post.id} encuesta={post.encuesta} />}

        {fotos.length > 0 && (
          <div className="flex flex-col gap-2">
            {fotos.map((f) => (
              // eslint-disable-next-line @next/next/no-img-element -- imágenes remotas
              <img key={f.url} src={f.url} alt={f.alt} className="w-full rounded-xl object-contain bg-surface-container" />
            ))}
          </div>
        )}

        <section aria-label="Comentarios" className="flex flex-col gap-space-xs pt-space-xs border-t border-outline-variant/40">
          <h3 className="flex items-center gap-1.5 text-label-lg text-on-surface">
            <MessageCircle className="w-4 h-4 text-primary" />
            Comentarios ({total})
          </h3>
          <ListaComentarios post={post} />
          <button
            type="button"
            onClick={() => setHiloAbierto(true)}
            className="h-touch-target-min rounded-xl bg-surface-container-low text-primary text-label-lg hover:bg-secondary-container transition-colors"
          >
            Participar en la discusión
          </button>
        </section>
      </DetalleShell>

      {hiloAbierto && <ComentariosSheet post={post} onClose={() => setHiloAbierto(false)} />}
    </>
  );
}
