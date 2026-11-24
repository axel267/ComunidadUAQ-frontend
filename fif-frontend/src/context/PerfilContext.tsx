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
import {
  AuthApiError,
  getStoredSession,
  persistSession,
  cambiarContrasenaApi,
  updateProfileApi,
  getUserApi,
  type AuthUser,
} from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
/** Solo campos editables por el alumno; correo institucional y expediente están bloqueados por Control Escolar. */
export type CambiosPerfilEditables = Partial<
  Pick<PerfilEstudiante, "nombre" | "carrera" | "semestre" | "campus" | "biografia" | "telefono" | "intereses">
>;

export type ResultadoCambioPassword = { ok: true } | { ok: false; motivo: string };

function mapUserToPerfil(u: AuthUser, prev: PerfilEstudiante): PerfilEstudiante {
  const facultadPrincipal = u.facultades?.[0];
  const campusOpciones: readonly string[] = [...CAMPUSES_UAQ, "No definido"];
  const campus = campusOpciones.includes(u.campus ?? "")
    ? (u.campus as CampusPerfil)
    : "No definido";
  const nombre = u.nombre?.trim() || prev.nombre;

  return {
    ...prev,
    nombre,
    nombreCredencial: nombre,
    siglas: calcularSiglas(nombre),
    correoInstitucional: u.email || prev.correoInstitucional || "No definido",
    expediente: u.expediente != null ? String(u.expediente) : prev.expediente || "No definido",
    carrera: u.carrera?.trim() || "No definido",
    semestre: u.semestre?.trim() || "No definido",
    facultad: facultadPrincipal?.nombre || prev.facultad || "No definido",
    facultadSigla: facultadPrincipal?.abreviatura || prev.facultadSigla || "ND",
    campus,
    biografia: u.biografia?.trim() || "No definido",
    telefono: u.telefono?.trim() || "No definido",
    intereses: Array.isArray(u.intereses) ? u.intereses : prev.intereses || [],
    estatus: u.rol === "Estudiante" ? "Alumno Regular" : u.rol || "No definido",
  };
}

interface PerfilContextValue {
  perfil: PerfilEstudiante;
  ajustes: AjustesCuenta;
  actualizarPerfil: (cambios: CambiosPerfilEditables) => Promise<void>;
  actualizarPrivacidad: (cambios: Partial<AjustesCuenta["privacidad"]>) => void;
  actualizarNotificaciones: (cambios: Partial<AjustesCuenta["notificaciones"]>) => void;
  alternarDobleFactor: () => boolean;
  cambiarContrasena: (actual: string, nueva: string) => Promise<ResultadoCambioPassword>;
  cerrarOtrasSesiones: () => number;
  restablecerAjustes: () => void;
}

const PerfilContext = createContext<PerfilContextValue | null>(null);

export function PerfilProvider({ children }: { children: ReactNode }) {
  const { session, cerrarSesion } = useAuth();
  const [perfilOverride, setPerfilOverride] = useState<{
    userId: number;
    data: PerfilEstudiante;
  } | null>(null);
  const [ajustes, setAjustes] = useState<AjustesCuenta>(AJUSTES_INICIALES);

  const perfil = useMemo<PerfilEstudiante>(() => {
    if (!session?.user) return PERFIL_MOCK;
    if (perfilOverride && perfilOverride.userId === session.user.id) {
      return perfilOverride.data;
    }
    return mapUserToPerfil(session.user, PERFIL_MOCK);
  }, [session, perfilOverride]);

  const actualizarPerfil = useCallback(
    async (cambios: CambiosPerfilEditables) => {
      const currentSession = getStoredSession();
      const basePerfil = currentSession?.user
        ? mapUserToPerfil(currentSession.user, perfil)
        : perfil;

      const nombreLimpio = cambios.nombre !== undefined ? cambios.nombre.trim() : basePerfil.nombre;
      const nombreFinal = nombreLimpio || basePerfil.nombre;
      const optimista: PerfilEstudiante = {
        ...basePerfil,
        nombre: nombreFinal,
        nombreCredencial: nombreFinal,
        siglas: calcularSiglas(nombreFinal),
        carrera: cambios.carrera !== undefined ? cambios.carrera.trim() || "No definido" : basePerfil.carrera,
        semestre: cambios.semestre !== undefined ? cambios.semestre.trim() || "No definido" : basePerfil.semestre,
        campus: cambios.campus ?? basePerfil.campus,
        biografia:
          cambios.biografia !== undefined
            ? cambios.biografia.trim() || "No definido"
            : basePerfil.biografia,
        telefono:
          cambios.telefono !== undefined
            ? cambios.telefono.trim() || "No definido"
            : basePerfil.telefono,
        intereses: cambios.intereses ?? basePerfil.intereses,
      };

      if (currentSession?.user?.id) {
        setPerfilOverride({ userId: currentSession.user.id, data: optimista });
        try {
          const res = await updateProfileApi({
            userId: currentSession.user.id,
            nombre: cambios.nombre,
            carrera: cambios.carrera,
            semestre: cambios.semestre,
            campus: cambios.campus,
            biografia: cambios.biografia,
            telefono: cambios.telefono,
            intereses: cambios.intereses,
          });

          const updatedUser = {
            ...currentSession.user,
            ...res.user,
          };
          const updatedSession = {
            ...currentSession,
            user: updatedUser,
          };
          persistSession(updatedSession);
          setPerfilOverride({
            userId: updatedUser.id,
            data: mapUserToPerfil(updatedUser, optimista),
          });
        } catch (err) {
          console.error("Error al persistir cambios en backend:", err);
          throw err;
        }
      }
    },
    [perfil]
  );

  useEffect(() => {
    const sessionUser = session?.user;
    if (!sessionUser?.id) return;

    let cancelled = false;
    getUserApi(sessionUser.id)
      .then((freshUser) => {
        if (cancelled || !freshUser) return;
        const merged = { ...sessionUser, ...freshUser };
        localStorage.setItem("auth_user", JSON.stringify(merged));
        setPerfilOverride({
          userId: merged.id,
          data: mapUserToPerfil(merged, PERFIL_MOCK),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AuthApiError && err.status === 401) {
          cerrarSesion();
          return;
        }
        console.error("Error al cargar perfil actualizado:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [session, cerrarSesion]);
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

  const cambiarContrasena = useCallback(async (actual: string, nueva: string): Promise<ResultadoCambioPassword> => {
    if (!actual.trim()) {
      return { ok: false, motivo: "Ingresa tu contraseña actual para confirmar." };
    }
    if (nueva.length < 8) {
      return { ok: false, motivo: "La nueva contraseña debe tener al menos 8 caracteres." };
    }
    if (actual === nueva) {
      return { ok: false, motivo: "La nueva contraseña debe ser distinta a la actual." };
    }
    const currentSession = getStoredSession();
    if (!currentSession?.user?.id) {
      return { ok: false, motivo: "No hay una sesión activa para cambiar la contraseña." };
    }

    try {
      await cambiarContrasenaApi({
        userId: currentSession.user.id,
        contrasenaActual: actual,
        nuevaContrasena: nueva,
        confirmarContrasena: nueva,
      });

      setAjustes((prev) => ({
        ...prev,
        seguridad: { ...prev.seguridad, ultimoCambioPassword: "Actualizada hoy" },
      }));
      return { ok: true };
    } catch (e: unknown) {
      const motivo = e instanceof Error ? e.message : "No se pudo actualizar la contraseña.";
      return { ok: false, motivo };
    }
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

