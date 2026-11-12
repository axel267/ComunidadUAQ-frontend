"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { HojaInferior } from "@/components/ui/HojaInferior";
import { PasswordInput } from "@/components/PasswordInput";
import { usePerfil } from "@/context/PerfilContext";
import { useAppToast } from "@/context/ToastContext";

interface CambiarContrasenaSheetProps {
  onClose: () => void;
}

export function CambiarContrasenaSheet({ onClose }: CambiarContrasenaSheetProps) {
  const showToast = useAppToast();
  const { cambiarContrasena, perfil } = usePerfil();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cumpleLongitud = nueva.length >= 8;
  const coincide = confirmacion.length > 0 && nueva === confirmacion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nueva !== confirmacion) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    const resultado = cambiarContrasena(actual, nueva);
    if (!resultado.ok) {
      setError(resultado.motivo);
      return;
    }

    onClose();
    showToast("Contraseña actualizada correctamente", {
      tipo: "exito",
      detalle: `Cuenta protegida: ${perfil.correoInstitucional}`,
    });
  };

  return (
    <HojaInferior
      titulo="Cambiar Contraseña"
      subtitulo="Seguridad de Acceso UAQ"
      icono={KeyRound}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm pt-space-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-body-sm">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            Tu nueva contraseña aplicará para iniciar sesión en{" "}
            <span className="font-mono text-on-surface">{perfil.correoInstitucional}</span>.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm">
            {error}
          </div>
        )}

        <PasswordInput
          label="Contraseña actual"
          placeholder="Ingresa tu contraseña vigente"
          value={actual}
          onChange={setActual}
          autoComplete="current-password"
        />

        <PasswordInput
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          value={nueva}
          onChange={setNueva}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirmar nueva contraseña"
          placeholder="Repite la nueva contraseña"
          value={confirmacion}
          onChange={setConfirmacion}
          autoComplete="new-password"
        />

        <div className="flex flex-col gap-1 px-1 text-label-sm font-inter">
          <span className={`flex items-center gap-1.5 ${cumpleLongitud ? "text-emerald-700" : "text-secondary"}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Al menos 8 caracteres
          </span>
          <span className={`flex items-center gap-1.5 ${coincide ? "text-emerald-700" : "text-secondary"}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Las contraseñas coinciden
          </span>
        </div>

        <div className="flex items-center gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface text-label-lg hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!actual || !cumpleLongitud || !coincide}
            className="flex-1 h-11 rounded-xl bg-primary text-on-primary text-label-lg shadow-sm hover:bg-primary-container disabled:opacity-45 transition-all active:scale-95"
          >
            Guardar contraseña
          </button>
        </div>
      </form>
    </HojaInferior>
  );
}

