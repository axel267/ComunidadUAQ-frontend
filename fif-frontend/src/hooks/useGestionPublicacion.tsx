"use client";

import { useCallback, useState, type ReactNode } from "react";
import { CrearPublicacionSheet } from "@/components/publicar/CrearPublicacionSheet";
import { OpcionesPublicacionSheet } from "@/components/publicar/OpcionesPublicacionSheet";
import { useAppToast } from "@/context/ToastContext";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import { etiquetaVisibilidad, type NuevaPublicacion, type Publicacion } from "@/data/publicaciones";

const VENTANA_DESHACER_MS = 5000;

/**
 * Flujo completo de publicaciones (crear, editar, eliminar con deshacer) con sus hojas y avisos.
 * Cualquier pantalla lo usa así: `abrirCrear` para el botón "Publicar", `abrirOpciones` para el ⋮ de una
 * tarjeta y `hojas` renderizado una vez en el JSX.
 */
export function useGestionPublicacion() {
  const showToast = useAppToast();
  const { crear, editar, eliminar, restaurar } = usePublicacionesApp();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Publicacion | null>(null);
  const [gestionando, setGestionando] = useState<Publicacion | null>(null);

  const abrirCrear = useCallback(() => setCreando(true), []);
  const abrirOpciones = useCallback((publicacion: Publicacion) => setGestionando(publicacion), []);
  const cerrarCrear = useCallback(() => setCreando(false), []);
  const cerrarEdicion = useCallback(() => setEditando(null), []);
  const cerrarOpciones = useCallback(() => setGestionando(null), []);

  const handlePublicar = useCallback(
    (datos: NuevaPublicacion) => {
      // TODO: enviar `NuevaPublicacion` a la API cuando el backend defina el contrato (RF04).
      const creada = crear(datos);
      setCreando(false);
      showToast("¡Publicación creada exitosamente!", {
        tipo: "exito",
        detalle: `Visible en: ${etiquetaVisibilidad(creada.visibilidad).toLowerCase()}.`,
        accion: {
          label: "Ver",
          onClick: () =>
            requestAnimationFrame(() =>
              document.getElementById(`publicacion-${creada.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
            ),
        },
        duracion: 4200,
      });
    },
    [crear, showToast]
  );

  const handleEditar = useCallback(
    (datos: NuevaPublicacion) => {
      if (!editando) return;
      editar(editando.id, datos);
      setEditando(null);
      showToast("Publicación editada correctamente.", {
        tipo: "editado",
        detalle: "Actualizado en el feed general.",
        duracion: 4200,
      });
    },
    [editando, editar, showToast]
  );

  const handleEliminar = useCallback(
    (publicacion: Publicacion) => {
      eliminar(publicacion.id);
      setGestionando(null);
      showToast("Publicación eliminada del muro universitario.", {
        tipo: "eliminado",
        detalle: "Deshacer disponible",
        cuentaRegresiva: true,
        duracion: VENTANA_DESHACER_MS,
        accion: {
          label: "Deshacer",
          onClick: () => {
            restaurar(publicacion);
            showToast("Publicación restaurada con éxito.", {
              tipo: "restaurado",
              detalle: "Nuevamente visible en tu perfil.",
              duracion: 3000,
            });
          },
        },
      });
    },
    [eliminar, restaurar, showToast]
  );

  const hojas: ReactNode = (
    <>
      {creando && <CrearPublicacionSheet onClose={cerrarCrear} onSubmit={handlePublicar} />}

      {gestionando && (
        <OpcionesPublicacionSheet
          publicacion={gestionando}
          onClose={cerrarOpciones}
          onEditar={(publicacion) => {
            setGestionando(null);
            setEditando(publicacion);
          }}
          onEliminar={handleEliminar}
        />
      )}

      {editando && (
        <CrearPublicacionSheet
          key={editando.id}
          publicacion={editando}
          onClose={cerrarEdicion}
          onSubmit={handleEditar}
        />
      )}
    </>
  );

  return { abrirCrear, abrirOpciones, hojas };
}
