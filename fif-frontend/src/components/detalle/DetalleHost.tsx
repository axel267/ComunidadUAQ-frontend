"use client";

import { useComunidad } from "@/context/ComunidadContext";
import { usePublicacionesApp } from "@/context/PublicacionesContext";
import type { Aviso } from "@/data/avisos";
import { DetalleAviso } from "./DetalleAviso";
import { DetallePost } from "./DetallePost";
import { DetallePublicacion } from "./DetallePublicacion";

export type DetalleActivo =
  | { tipo: "aviso"; aviso: Aviso }
  | { tipo: "publicacion"; id: string }
  | { tipo: "post"; id: string };

interface DetalleHostProps {
  activo: DetalleActivo | null;
  onClose: () => void;
}

export function DetalleHost({ activo, onClose }: DetalleHostProps) {
  const { posts } = useComunidad();
  const { publicaciones } = usePublicacionesApp();

  if (!activo) return null;

  if (activo.tipo === "aviso") return <DetalleAviso aviso={activo.aviso} onClose={onClose} />;

  if (activo.tipo === "publicacion") {
    const publicacion = publicaciones.find((p) => p.id === activo.id);
    return publicacion ? <DetallePublicacion publicacion={publicacion} onClose={onClose} /> : null;
  }

  const post = posts.find((p) => p.id === activo.id);
  return post ? <DetallePost post={post} onClose={onClose} /> : null;
}
