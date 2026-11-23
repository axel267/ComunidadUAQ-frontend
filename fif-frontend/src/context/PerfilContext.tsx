"use client";

import {
  AJUSTES_INICIALES,
  CAMPUSES_UAQ,
  PERFIL_MOCK,
  calcularSiglas,
  type AjustesCuenta,
  type PerfilEstudiante,
  type CampusPerfil,
} from "@/data/perfil";
import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { getStoredSession, cambiarContrasenaApi } from "@/services/auth";
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
        biografia:
          cambios.biografia !== undefined
            ? cambios.biografia.trim() || "No definido"
            : actual.biografia,
        telefono:
          cambios.telefono !== undefined
            ? cambios.telefono.trim() || "No definido"
            : actual.telefono,
        intereses: cambios.intereses ?? actual.intereses,
      };
    });
  }, []);
  useEffect(() => {
    const session = getStoredSession();

    if (session && session.user) {
      const u = session.user;
      const facultadPrincipal = u.facultades?.[0];
      const campusOpciones: readonly string[] = [...CAMPUSES_UAQ, "No definido"];
      const campus = campusOpciones.includes(u.campus ?? "")
        ? (u.campus as CampusPerfil)
        : "No definido";

      setPerfil((prev) => ({
        ...prev,
        nombre: u.nombre,
        nombreCredencial: u.nombre,
        siglas: calcularSiglas(u.nombre),
        correoInstitucional: u.email || "No definido",
        expediente: u.expediente != null ? String(u.expediente) : "No definido",
        carrera: u.carrera?.trim() || "No definido",
        semestre: u.semestre?.trim() || "No definido",
        facultad: facultadPrincipal?.nombre || "No definido",
        facultadSigla: facultadPrincipal?.abreviatura || "ND",
        campus,
        biografia: u.biografia?.trim() || "No definido",
        telefono: u.telefono?.trim() || "No definido",
        intereses: u.intereses || [],
        estatus: u.rol === "Estudiante" ? "Alumno Regular" : u.rol || "No definido",
      }));
    }
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
    const session = getStoredSession();
    if (session?.user?.id) {
      cambiarContrasenaApi({
        userId: session.user.id,
        contrasenaActual: actual,
        nuevaContrasena: nueva,
        confirmarContrasena: nueva,
      }).catch((e) => {
        console.error("Error al actualizar contrasena en el backend:", e);
      });
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

