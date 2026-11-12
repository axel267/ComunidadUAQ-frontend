"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  AJUSTES_INICIALES,
  PERFIL_MOCK,
  calcularSiglas,
  type AjustesCuenta,
  type PerfilEstudiante,
} from "@/data/perfil";

/** Solo campos editables por el alumno; correo institucional y expediente están bloqueados por Control Escolar. */
export type CambiosPerfilEditables = Partial<
  Pick<PerfilEstudiante, "nombre" | "campus" | "biografia" | "telefono" | "intereses">
>;

export type ResultadoCambioPassword = { ok: true } | { ok: false; motivo: string };

interface PerfilContextValue {
  perfil: PerfilEstudiante;
  ajustes: AjustesCuenta;
  actualizarPerfil: (cambios: CambiosPerfilEditables) => void;
  actualizarPrivacidad: (cambios: Partial<AjustesCuenta["privacidad"]>) => void;
  actualizarNotificaciones: (cambios: Partial<AjustesCuenta["notificaciones"]>) => void;
  alternarDobleFactor: () => boolean;
  cambiarContrasena: (actual: string, nueva: string) => ResultadoCambioPassword;
  cerrarOtrasSesiones: () => number;
  restablecerAjustes: () => void;
}

const PerfilContext = createContext<PerfilContextValue | null>(null);

// TODO: persistir perfil editable y preferencias en el backend (RF02 / RF07); correo y expediente son inmutables.
export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilEstudiante>(PERFIL_MOCK);
  const [ajustes, setAjustes] = useState<AjustesCuenta>(AJUSTES_INICIALES);

  const actualizarPerfil = useCallback((cambios: CambiosPerfilEditables) => {
    setPerfil((actual) => {
      const nombreLimpio = cambios.nombre !== undefined ? cambios.nombre.trim() : actual.nombre;
      const nombreFinal = nombreLimpio || actual.nombre;
      return {
        ...actual,
        nombre: nombreFinal,
        siglas: calcularSiglas(nombreFinal),
        campus: cambios.campus ?? actual.campus,
        biografia: cambios.biografia !== undefined ? cambios.biografia.trim() : actual.biografia,
        telefono: cambios.telefono !== undefined ? cambios.telefono.trim() : actual.telefono,
        intereses: cambios.intereses ?? actual.intereses,
      };
    });
  }, []);

  const actualizarPrivacidad = useCallback((cambios: Partial<AjustesCuenta["privacidad"]>) => {
    setAjustes((actual) => ({
      ...actual,
      privacidad: { ...actual.privacidad, ...cambios },
    }));
  }, []);

  const actualizarNotificaciones = useCallback((cambios: Partial<AjustesCuenta["notificaciones"]>) => {
    setAjustes((actual) => ({
      ...actual,
      notificaciones: { ...actual.notificaciones, ...cambios },
    }));
  }, []);

  const alternarDobleFactor = useCallback(() => {
    const siguiente = !ajustes.seguridad.dobleFactor;
    setAjustes((actual) => ({
      ...actual,
      seguridad: { ...actual.seguridad, dobleFactor: siguiente },
    }));
    return siguiente;
  }, [ajustes.seguridad.dobleFactor]);

  const cambiarContrasena = useCallback((actual: string, nueva: string): ResultadoCambioPassword => {
    if (!actual.trim()) {
      return { ok: false, motivo: "Ingresa tu contraseña actual para confirmar." };
    }
    if (nueva.length < 8) {
      return { ok: false, motivo: "La nueva contraseña debe tener al menos 8 caracteres." };
    }
    if (actual === nueva) {
      return { ok: false, motivo: "La nueva contraseña debe ser distinta a la actual." };
    }
    setAjustes((prev) => ({
      ...prev,
      seguridad: { ...prev.seguridad, ultimoCambioPassword: "Actualizada hoy" },
    }));
    return { ok: true };
  }, []);

  const cerrarOtrasSesiones = useCallback(() => {
    const cerradas = ajustes.seguridad.sesiones.filter((s) => !s.actual).length;
    setAjustes((actual) => ({
      ...actual,
      seguridad: {
        ...actual.seguridad,
        sesiones: actual.seguridad.sesiones.filter((s) => s.actual),
      },
    }));
    return cerradas;
  }, [ajustes.seguridad.sesiones]);

  const restablecerAjustes = useCallback(() => {
    setAjustes((actual) => ({
      ...AJUSTES_INICIALES,
      seguridad: {
        ...AJUSTES_INICIALES.seguridad,
        sesiones: actual.seguridad.sesiones,
      },
    }));
  }, []);

  const valor = useMemo(
    () => ({
      perfil,
      ajustes,
      actualizarPerfil,
      actualizarPrivacidad,
      actualizarNotificaciones,
      alternarDobleFactor,
      cambiarContrasena,
      cerrarOtrasSesiones,
      restablecerAjustes,
    }),
    [
      perfil,
      ajustes,
      actualizarPerfil,
      actualizarPrivacidad,
      actualizarNotificaciones,
      alternarDobleFactor,
      cambiarContrasena,
      cerrarOtrasSesiones,
      restablecerAjustes,
    ]
  );

  return <PerfilContext.Provider value={valor}>{children}</PerfilContext.Provider>;
}

export function usePerfil() {
  const ctx = useContext(PerfilContext);
  if (!ctx) throw new Error("usePerfil debe usarse dentro de <AppProviders>.");
  return ctx;
}

