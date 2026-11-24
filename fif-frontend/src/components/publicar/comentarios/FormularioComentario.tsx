"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface FormularioComentarioProps {
  enviando: boolean;
  onEnviar: (texto: string) => Promise<boolean>;
  siglasUsuario?: string;
}

export function FormularioComentario({
  enviando,
  onEnviar,
  siglasUsuario = "YO",
}: FormularioComentarioProps) {
  const [texto, setTexto] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    const ok = await onEnviar(texto);
    if (ok) {
      setTexto("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold flex items-center justify-center shrink-0">
        {siglasUsuario}
      </div>
      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un comentario..."
          disabled={enviando}
          className="w-full bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-3.5 pr-10 text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          aria-label="Enviar comentario"
          disabled={!texto.trim() || enviando}
          className="absolute right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
