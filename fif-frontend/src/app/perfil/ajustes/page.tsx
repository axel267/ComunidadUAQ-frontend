"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Eye,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Phone,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
} from "lucide-react";
import { AppBottomNav } from "@/components/AppBottomNav";
import { CambiarContrasenaSheet } from "@/components/perfil/CambiarContrasenaSheet";
import { usePerfil } from "@/context/PerfilContext";
import { useAppToast } from "@/context/ToastContext";
import { useGestionPublicacion } from "@/hooks/useGestionPublicacion";
import {
  CAMPUSES_UAQ,
  INTERESES_DISPONIBLES,
  calcularSiglas,
  type CampusUAQ,
} from "@/data/perfil";
import { VISIBILIDADES, type VisibilidadPublicacion } from "@/data/publicaciones";

const MAX_BIO = 160;

const inputBase =
  "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

function Interruptor({
  id,
  titulo,
  descripcion,
  activo,
  onChange,
}: {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-space-sm py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-headline-sm text-on-surface cursor-pointer">
          {titulo}
        </label>
        <p className="text-body-sm text-on-surface-variant">{descripcion}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          activo ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-surface-container-lowest shadow-sm transition-transform ${
            activo ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function CampoBloqueado({
  id,
  etiqueta,
  valor,
  ayuda,
  icono: Icono,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  ayuda: string;
  icono: typeof Mail;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-label-md text-on-surface-variant">
          {etiqueta}
        </label>
        <span className="inline-flex items-center gap-1 text-label-sm font-inter text-secondary bg-surface-container px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3" />
          No editable
        </span>
      </div>
      <div className="relative flex items-center">
        <Icono className="w-4 h-4 text-outline absolute left-3.5 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={valor}
          disabled
          readOnly
          aria-readonly="true"
          className="w-full bg-surface-container/70 border border-outline-variant/70 rounded-xl pl-10 pr-10 py-2.5 text-body-md font-mono text-secondary cursor-not-allowed select-all"
        />
        <Lock className="w-4 h-4 text-outline absolute right-3.5 pointer-events-none" />
      </div>
      <p className="text-body-sm text-secondary">{ayuda}</p>
    </div>
  );
}

export default function AjustesPerfilPage() {
  const router = useRouter();
  const showToast = useAppToast();
  const {
    perfil,
    ajustes,
    actualizarPerfil,
    actualizarPrivacidad,
    actualizarNotificaciones,
    alternarDobleFactor,
    cerrarOtrasSesiones,
    restablecerAjustes,
  } = usePerfil();
  const { abrirCrear, hojas } = useGestionPublicacion();

  // Estado local del formulario de perfil editable
  const [nombre, setNombre] = useState(perfil.nombre);
  const [campus, setCampus] = useState<CampusUAQ>(perfil.campus);
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [biografia, setBiografia] = useState(perfil.biografia);
  const [intereses, setIntereses] = useState<string[]>(perfil.intereses);

  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const hayCambiosPerfil = useMemo(() => {
    const interesesIguales =
      intereses.length === perfil.intereses.length &&
      intereses.every((tag) => perfil.intereses.includes(tag));
    return (
      nombre.trim() !== perfil.nombre ||
      campus !== perfil.campus ||
      telefono.trim() !== perfil.telefono ||
      biografia.trim() !== perfil.biografia ||
      !interesesIguales
    );
  }, [nombre, campus, telefono, biografia, intereses, perfil]);

  const toggleInteres = (tag: string) => {
    setIntereses((actuales) =>
      actuales.includes(tag) ? actuales.filter((t) => t !== tag) : [...actuales, tag]
    );
  };

  const guardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) {
      showToast("El nombre visible debe tener al menos 2 caracteres", { tipo: "advertencia" });
      return;
    }
    actualizarPerfil({ nombre, campus, telefono, biografia, intereses });
    showToast("Cambios guardados en tu perfil", {
      tipo: "exito",
      detalle: "Tu información pública ya está actualizada.",
    });
  };

  const handleToggle2FA = () => {
    const activo = alternarDobleFactor();
    showToast(activo ? "Verificación en dos pasos activada" : "Verificación en dos pasos desactivada", {
      tipo: activo ? "exito" : "advertencia",
      detalle: activo
        ? "Tu cuenta cuenta con capa extra de seguridad."
        : "Te recomendamos mantenerla activa para proteger tu cuenta.",
    });
  };

  const handleCerrarOtrasSesiones = () => {
    const cerradas = cerrarOtrasSesiones();
    if (cerradas > 0) {
      showToast(`Se cerraron ${cerradas} sesión(es) en otros dispositivos`, { tipo: "exito" });
    }
  };

  const handleRestablecer = () => {
    restablecerAjustes();
    showToast("Preferencias de privacidad y notificaciones restablecidas", { tipo: "info" });
  };

  const cerrarSesion = () => {
    // TODO: invalidar la sesión en el backend y limpiar el token cuando auth.ts la persista.
    router.push("/login");
  };

  const otrasSesiones = ajustes.seguridad.sesiones.filter((s) => !s.actual).length;

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      {/* Header fijo consistente con Recompensas */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-screen-margin-mobile flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <Link
              href="/perfil"
              aria-label="Regresar al perfil"
              className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="text-headline-sm text-on-surface truncate">Ajustes de Cuenta</h1>
              <span className="text-label-sm font-inter text-primary uppercase tracking-wider font-bold">
                Campus U • UAQnecta
              </span>
            </div>
          </div>
          <Link
            href="/perfil"
            aria-label="Ver perfil"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest"
          >
            {perfil.siglas}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-20 pb-28 px-screen-margin-mobile gap-space-lg">
        {/* 1. Datos Institucionales Bloqueados (Correo y Expediente nunca editables) */}
        <section
          id="institucional"
          aria-labelledby="titulo-institucional"
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/50"
        >
          <div className="flex items-start justify-between gap-space-xs">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 id="titulo-institucional" className="text-headline-sm text-on-surface">
                  Datos Institucionales
                </h2>
                <p className="text-body-sm text-secondary">Vinculados a Control Escolar UAQ</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-body-sm">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Tu <strong>correo institucional</strong> y tu <strong>número de expediente</strong> son permanentes y no
              pueden modificarse desde la aplicación. Si necesitas corregirlos, acude a Servicios Escolares.
            </p>
          </div>

          <CampoBloqueado
            id="ajuste-correo"
            etiqueta="Correo institucional"
            valor={perfil.correoInstitucional}
            ayuda="Cuenta oficial utilizada para tu acceso y comunicados escolares."
            icono={Mail}
          />

          <CampoBloqueado
            id="ajuste-expediente"
            etiqueta="Expediente / Matrícula"
            valor={`EXP-${perfil.expediente}`}
            ayuda={`${perfil.facultad} (${perfil.facultadSigla}) • ${perfil.carrera} • ${perfil.semestre}º Semestre`}
            icono={Lock}
          />
        </section>

        {/* 2. Información Editable del Perfil */}
        <section
          id="perfil"
          aria-labelledby="titulo-perfil-editable"
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md scroll-mt-20"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 id="titulo-perfil-editable" className="text-headline-sm text-on-surface">
                  Perfil en Comunidad
                </h2>
                <p className="text-body-sm text-secondary">Cómo te ven otros estudiantes</p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-lg flex items-center justify-center shadow-sm"
            >
              {calcularSiglas(nombre)}
            </div>
          </div>

          <form onSubmit={guardarPerfil} className="flex flex-col gap-space-sm">
            <div className="space-y-1">
              <label htmlFor="ajuste-nombre" className="block text-label-md text-on-surface-variant">
                Nombre visible
              </label>
              <input
                id="ajuste-nombre"
                type="text"
                maxLength={50}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre para mostrar en el campus"
                className={inputBase}
              />
              <p className="text-body-sm text-secondary">
                Tu credencial universitaria oficial conserva el registro de Servicios Escolares.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="ajuste-campus" className="block text-label-md text-on-surface-variant">
                Campus habitual
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="ajuste-campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value as CampusUAQ)}
                  className={`${inputBase} appearance-none pl-10 pr-9 cursor-pointer`}
                >
                  {CAMPUSES_UAQ.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="ajuste-telefono" className="block text-label-md text-on-surface-variant">
                Teléfono de contacto (opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="ajuste-telefono"
                  type="tel"
                  maxLength={20}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="442 000 0000"
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="ajuste-bio" className="text-label-md text-on-surface-variant">
                  Biografía breve
                </label>
                <span className="text-label-sm font-inter text-secondary">
                  {biografia.length} / {MAX_BIO}
                </span>
              </div>
              <textarea
                id="ajuste-bio"
                rows={3}
                maxLength={MAX_BIO}
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Cuéntale a la comunidad tus proyectos, materias o clubes..."
                className={`${inputBase} resize-none`}
              />
            </div>

            <div className="space-y-2 pt-1">
              <span className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
                <Sparkles className="w-4 h-4 text-primary" />
                Intereses y clubes universitarios
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INTERESES_DISPONIBLES.map((tag) => {
                  const activo = intereses.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => toggleInteres(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md transition-all active:scale-95 ${
                        activo
                          ? "bg-primary-fixed text-on-primary-fixed font-semibold shadow-xs"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {activo && <Check className="w-3.5 h-3.5 text-primary" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!hayCambiosPerfil || nombre.trim().length < 2}
              className="mt-space-xs w-full h-11 rounded-xl bg-primary text-on-primary text-label-lg shadow-sm hover:bg-primary-container disabled:opacity-45 disabled:hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar cambios del perfil
            </button>
          </form>
        </section>

        {/* 3. Seguridad y Sesiones Activas */}
        <section
          id="seguridad"
          aria-labelledby="titulo-seguridad"
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs scroll-mt-20"
        >
          <div className="flex items-center gap-2 pb-1">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed/50 text-tertiary flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="titulo-seguridad" className="text-headline-sm text-on-surface">
                Seguridad y Acceso
              </h2>
              <p className="text-body-sm text-secondary">Contraseña, 2FA y dispositivos</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-space-sm py-3 border-b border-surface-container">
            <div className="min-w-0">
              <p className="text-headline-sm text-on-surface">Contraseña institucional</p>
              <p className="text-body-sm text-on-surface-variant">{ajustes.seguridad.ultimoCambioPassword}</p>
            </div>
            <button
              type="button"
              onClick={() => setCambiandoPassword(true)}
              className="h-9 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-label-md shrink-0 transition-colors"
            >
              Cambiar
            </button>
          </div>

          <Interruptor
            id="switch-2fa"
            titulo="Verificación en dos pasos (2FA)"
            descripcion="Solicita código adicional al iniciar sesión en dispositivos nuevos"
            activo={ajustes.seguridad.dobleFactor}
            onChange={handleToggle2FA}
          />

          <div className="pt-2 border-t border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">Sesiones activas</span>
              {otrasSesiones > 0 && (
                <button
                  type="button"
                  onClick={handleCerrarOtrasSesiones}
                  className="text-label-md text-error hover:underline"
                >
                  Cerrar otras ({otrasSesiones})
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {ajustes.seguridad.sesiones.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-space-xs p-2.5 rounded-xl bg-surface-container-low"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0">
                      {s.actual ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-label-md text-on-surface truncate">{s.dispositivo}</p>
                      <p className="text-body-sm text-secondary truncate">{s.detalle}</p>
                    </div>
                  </div>
                  {s.actual && (
                    <span className="shrink-0 text-label-sm font-inter bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Actual
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Privacidad en Comunidad */}
        <section
          id="privacidad"
          aria-labelledby="titulo-privacidad"
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col divide-y divide-surface-container"
        >
          <div className="flex items-center gap-2 pb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="titulo-privacidad" className="text-headline-sm text-on-surface">
                Privacidad en Comunidad
              </h2>
              <p className="text-body-sm text-secondary">Controla quién ve tus aportes</p>
            </div>
          </div>

          <div className="py-3 space-y-1.5">
            <label htmlFor="ajuste-visibilidad" className="block text-headline-sm text-on-surface">
              Visibilidad predeterminada al publicar
            </label>
            <p className="text-body-sm text-on-surface-variant">
              Se seleccionará automáticamente cada vez que crees una nueva publicación.
            </p>
            <div className="relative mt-1">
              <select
                id="ajuste-visibilidad"
                value={ajustes.privacidad.visibilidadDefault}
                onChange={(e) => {
                  const visibilidadDefault = e.target.value as VisibilidadPublicacion;
                  actualizarPrivacidad({ visibilidadDefault });
                  showToast("Visibilidad predeterminada actualizada", { tipo: "exito" });
                }}
                className={`${inputBase} appearance-none pr-9 cursor-pointer`}
              >
                {VISIBILIDADES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <Interruptor
            id="switch-campus"
            titulo="Mostrar mi campus en el perfil"
            descripcion="Permite que otros alumnos vean tu campus habitual"
            activo={ajustes.privacidad.mostrarCampus}
            onChange={() =>
              actualizarPrivacidad({ mostrarCampus: !ajustes.privacidad.mostrarCampus })
            }
          />

          <Interruptor
            id="switch-menciones"
            titulo="Permitir menciones (@)"
            descripcion="Otros compañeros pueden etiquetarte en hilos y respuestas"
            activo={ajustes.privacidad.permitirMenciones}
            onChange={() =>
              actualizarPrivacidad({ permitirMenciones: !ajustes.privacidad.permitirMenciones })
            }
          />

          <Interruptor
            id="switch-en-linea"
            titulo="Mostrar estado en línea"
            descripcion="Visible en preguntas rápidas y comentarios en vivo"
            activo={ajustes.privacidad.mostrarEnLinea}
            onChange={() =>
              actualizarPrivacidad({ mostrarEnLinea: !ajustes.privacidad.mostrarEnLinea })
            }
          />
        </section>

        {/* 5. Preferencias de Notificaciones */}
        <section
          id="notificaciones"
          aria-labelledby="titulo-notificaciones"
          className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col divide-y divide-surface-container"
        >
          <div className="flex items-center gap-2 pb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="titulo-notificaciones" className="text-headline-sm text-on-surface">
                Notificaciones
              </h2>
              <p className="text-body-sm text-secondary">Elige qué avisos deseas recibir</p>
            </div>
          </div>

          <Interruptor
            id="notif-avisos"
            titulo="Avisos oficiales y becas"
            descripcion="Comunicados académicos, calendarios y trámites urgentes"
            activo={ajustes.notificaciones.avisosOficiales}
            onChange={() =>
              actualizarNotificaciones({
                avisosOficiales: !ajustes.notificaciones.avisosOficiales,
              })
            }
          />

          <Interruptor
            id="notif-comunidad"
            titulo="Respuestas y menciones"
            descripcion="Alertas cuando alguien comenta en tus publicaciones"
            activo={ajustes.notificaciones.respuestasComunidad}
            onChange={() =>
              actualizarNotificaciones({
                respuestasComunidad: !ajustes.notificaciones.respuestasComunidad,
              })
            }
          />

          <Interruptor
            id="notif-eventos"
            titulo="Eventos y recompensas"
            descripcion="Recordatorios de convocatorias e insignias acreditadas"
            activo={ajustes.notificaciones.eventosRecompensas}
            onChange={() =>
              actualizarNotificaciones({
                eventosRecompensas: !ajustes.notificaciones.eventosRecompensas,
              })
            }
          />

          <Interruptor
            id="notif-resumen"
            titulo="Resumen semanal por correo"
            descripcion={`Se enviará a ${perfil.correoInstitucional}`}
            activo={ajustes.notificaciones.resumenCorreo}
            onChange={() =>
              actualizarNotificaciones({
                resumenCorreo: !ajustes.notificaciones.resumenCorreo,
              })
            }
          />
        </section>

        {/* 6. Acciones Finales */}
        <section aria-label="Administración de cuenta" className="flex flex-col gap-space-xs">
          <button
            type="button"
            onClick={handleRestablecer}
            className="w-full h-11 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container text-label-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer preferencias predeterminadas
          </button>

          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full h-12 rounded-xl bg-surface-container-low text-error hover:bg-error-container/40 text-label-lg flex items-center justify-center gap-space-xs transition-colors active:scale-[0.98] shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </section>
      </main>

      {cambiandoPassword && <CambiarContrasenaSheet onClose={() => setCambiandoPassword(false)} />}

      <AppBottomNav onPublishClick={abrirCrear} />
      {hojas}
    </div>
  );
}
