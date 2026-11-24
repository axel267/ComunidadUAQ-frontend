"use client";

import { MessageCircle, Loader2 } from "lucide-react";
import { useComentariosPublicacion } from "@/hooks/useComentariosPublicacion";
import { getStoredSession } from "@/services/auth";
import { ComentarioItem } from "./ComentarioItem";
import { FormularioComentario } from "./FormularioComentario";

interface SeccionComentariosProps {
  publicacionId: string | number;
  abiertoInicial?: boolean;
  alturaCompleta?: boolean;
}

export function SeccionComentarios({ publicacionId, abiertoInicial = false, alturaCompleta = false }: SeccionComentariosProps) {
  const {
    comentarios,
    cargando,
    enviando,
    abierto,
    alternarAbierto,
    agregarComentario,
    eliminar,
  } = useComentariosPublicacion(publicacionId, abiertoInicial);

  const session = getStoredSession();
  const usuarioActualId = session?.user?.id;
  const esAdmin =
    session?.user?.rol === "Administrador" || session?.user?.rolId === 1;

  const siglasUsuario = session?.user?.nombre
    ? session.user.nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "YO";

  return (
    <div className="w-full pt-1 border-t border-outline-variant/30 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={alternarAbierto}
          className="flex items-center gap-1.5 text-label-md text-secondary hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface-container"
        >
          <MessageCircle className="w-4 h-4" />
          <span>
            {comentarios.length > 0
              ? `${comentarios.length} ${comentarios.length === 1 ? "comentario" : "comentarios"}`
              : "Comentar"}
          </span>
        </button>
      </div>

      {abierto && (
        <div className="flex flex-col gap-2 mt-1 pl-1">
          {cargando ? (
            <div className="flex items-center justify-center py-4 text-secondary">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <>
              {comentarios.length === 0 ? (
                <p className="text-body-sm text-secondary italic py-1 pl-1">
                  Sin comentarios todavia. Se el primero en comentar.
                </p>
              ) : (
                <div className={`flex flex-col gap-2 pr-1 ${alturaCompleta ? "" : "max-h-64 overflow-y-auto"}`}>
                  {comentarios.map((c) => (
                    <ComentarioItem
                      key={c.id}
                      comentario={c}
                      usuarioActualId={usuarioActualId}
                      esAdmin={esAdmin}
                      onEliminar={eliminar}
                    />
                  ))}
                </div>
              )}

              <FormularioComentario
                enviando={enviando}
                onEnviar={agregarComentario}
                siglasUsuario={siglasUsuario}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
