"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { activateAccount } from "@/services/auth";
import { getFacultades, type Facultade } from "@/services/api";
import { CAMPUSES_UAQ, INTERESES_DISPONIBLES, type CampusUAQ } from "@/data/perfil";
import { ChevronLeftIcon, ShieldCheckIcon, CheckIcon } from "@/components/icons";

export default function ActivarCuentaPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [expediente, setExpediente] = useState("");
  const [carrera, setCarrera] = useState("");
  const [email, setEmail] = useState("");
  const [facultadId, setFacultadId] = useState("");
  const [semestre, setSemestre] = useState("");
  const [campus, setCampus] = useState<CampusUAQ | "">("");
  const [telefono, setTelefono] = useState("");
  const [biografia, setBiografia] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [facultades, setFacultades] = useState<Facultade[]>([]);
  const [errorFacultades, setErrorFacultades] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    getFacultades()
      .then(setFacultades)
      .catch((err: unknown) => {
        console.error("No se pudieron cargar las facultades:", err);
        setErrorFacultades("No se pudieron cargar las facultades; puedes continuar sin seleccionar una.");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("Debes aceptar el reglamento universitario y la política de privacidad.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@uaq.mx") && !trimmedEmail.endsWith("@alumnos.uaq.mx")) {
      setError("El correo debe pertenecer al dominio institucional (@uaq.mx o @alumnos.uaq.mx).");
      return;
    }

    setLoading(true);
    try {
      await activateAccount({
        nombre: nombre.trim() || `Estudiante ${expediente.trim()}`,
        expediente: expediente.trim(),
        carrera: carrera.trim() || undefined,
        facultadId: facultadId ? Number(facultadId) : undefined,
        semestre: semestre || undefined,
        campus: campus || undefined,
        telefono: telefono.trim() || undefined,
        biografia: biografia.trim() || undefined,
        intereses,
        email: trimmedEmail,
      });

      setActivatedSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "No se pudo activar la cuenta. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f8fafc] relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(59, 130, 246, 0.18) 0%, rgba(96, 165, 250, 0.06) 45%, transparent 70%)",
        }}
      />

      <main className="relative z-10 min-h-screen flex flex-col justify-between items-center px-4 py-6 sm:px-6 max-w-md mx-auto">
        <header className="w-full pt-1 pb-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              aria-label="Regresar"
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-slate-200/80 text-slate-600 shadow-sm active:scale-95 transition-all duration-150 hover:bg-slate-100"
            >
              <ChevronLeftIcon />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-blue-700 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Comunidad UAQ • Activación de Alumno</span>
            </div>
            <div aria-hidden className="w-10 h-10" />
          </div>

          <div className="relative mt-1 mb-4 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-[0_10px_25px_-3px_rgba(37,99,235,0.18)] border border-slate-200/80 overflow-hidden">
              <Image
                src="/logo-uaqnecta.png"
                alt="UAQnecta Comunidad"
                width={80}
                height={80}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center px-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {activatedSuccess ? "¡Cuenta Activada!" : "Activar Cuenta"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {activatedSuccess
                ? "Tu cuenta ha sido creada y tu contraseña temporal ha sido enviada."
                : "Ingresa tus datos institucionales para recibir tu contraseña temporal de acceso."}
            </p>
          </div>
        </header>

        {!activatedSuccess ? (
          <section className="w-full bg-white/95 rounded-3xl border border-slate-200/90 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.07)] p-5 sm:p-6 mb-5">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="nombre">
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="student-id">
                  Número de Expediente
                </label>
                <input
                  id="student-id"
                  required
                  value={expediente}
                  onChange={(e) => setExpediente(e.target.value)}
                  placeholder="Ej. 333419"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="carrera">
                  Carrera que estás cursando
                </label>
                <input
                  id="carrera"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  placeholder="Opcional"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="facultad">
                  Facultad (opcional)
                </label>
                <select
                  id="facultad"
                  value={facultadId}
                  onChange={(e) => setFacultadId(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                >
                  <option value="">No definido</option>
                  {facultades.map((facultad) => (
                    <option key={facultad.id} value={facultad.id}>
                      {facultad.nombre}
                    </option>
                  ))}
                </select>
                {errorFacultades && <p className="text-xs text-amber-700">{errorFacultades}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="campus">
                  Campus habitual (opcional)
                </label>
                <select
                  id="campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value as CampusUAQ | "")}
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                >
                  <option value="">No definido</option>
                  {CAMPUSES_UAQ.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="semestre">
                  Semestre (opcional)
                </label>
                <input
                  id="semestre"
                  type="number"
                  min={1}
                  max={20}
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  placeholder="No definido"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="telefono">
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  type="tel"
                  maxLength={20}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="No definido"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="biografia">
                  Biografía (opcional)
                </label>
                <textarea
                  id="biografia"
                  maxLength={160}
                  rows={2}
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  placeholder="No definido"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <fieldset className="space-y-2">
                <legend className="block text-xs font-medium text-slate-700">
                  Intereses (opcional)
                </legend>
                <div className="flex flex-wrap gap-2">
                  {INTERESES_DISPONIBLES.map((interes) => {
                    const seleccionado = intereses.includes(interes);
                    return (
                      <button
                        key={interes}
                        type="button"
                        aria-pressed={seleccionado}
                        onClick={() =>
                          setIntereses((actuales) =>
                            seleccionado
                              ? actuales.filter((item) => item !== interes)
                              : [...actuales, interes]
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          seleccionado
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {interes}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="email">
                  Correo Institucional (@uaq.mx o @alumnos.uaq.mx)
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@alumnos.uaq.mx"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2.5 text-xs text-slate-600 select-none" htmlFor="terms">
                  Acepto los <span className="text-blue-600 font-medium">Términos del Reglamento Universitario</span> y la{" "}
                  <span className="text-blue-600 font-medium">Política de Privacidad</span>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-150"
              >
                <span>{loading ? "Enviando correo..." : "Activar Cuenta y Recibir Contraseña"}</span>
              </button>
            </form>
          </section>
        ) : (
          <section className="w-full bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] border border-slate-100 p-6 sm:p-7 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-1">¡Registro completado!</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Hemos enviado tu contraseña temporal a <strong className="text-slate-700">{email}</strong>.
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              Ir a Iniciar Sesión
            </button>
          </section>
        )}

        <footer className="mt-6 flex flex-col items-center text-center gap-3 text-xs text-slate-500 pb-4">
          <p>
            ¿Ya tienes tu cuenta activa?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Iniciar Sesión
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Conexión institucional segura • Comunidad UAQ</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
