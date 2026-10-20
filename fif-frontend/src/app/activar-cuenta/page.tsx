"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { activateAccount, resendActivationCode, verifyActivationCode } from "@/services/auth";
import { PasswordInput } from "@/components/PasswordInput";
import { ChevronLeftIcon, ShieldCheckIcon } from "@/components/icons";

const RESEND_COOLDOWN_SECONDS = 60;

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 1)}***@${domain}`;
}

export default function ActivarCuentaPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [expediente, setExpediente] = useState("");
  const [carrera, setCarrera] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loadingStep1, setLoadingStep1] = useState(false);
  const [errorStep1, setErrorStep1] = useState("");

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loadingStep2, setLoadingStep2] = useState(false);
  const [errorStep2, setErrorStep2] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStep1("");

    if (password !== confirmPassword) {
      setErrorStep1("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptTerms) {
      setErrorStep1("Debes aceptar el reglamento universitario y la política de privacidad.");
      return;
    }

    setLoadingStep1(true);
    try {
      await activateAccount({ expediente, carrera, email, password });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep(2);
    } catch (err) {
      setErrorStep1(err instanceof Error ? err.message : "No se pudo validar el expediente.");
    } finally {
      setLoadingStep1(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStep2("");
    const otp = code.join("");
    if (otp.length !== 6) {
      setErrorStep2("Ingresa los 6 dígitos del código.");
      return;
    }

    setLoadingStep2(true);
    try {
      await verifyActivationCode(email, otp);
      router.push("/login");
    } catch (err) {
      setErrorStep2(err instanceof Error ? err.message : "El código ingresado es incorrecto o ha expirado.");
    } finally {
      setLoadingStep2(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorStep2("");
    try {
      await resendActivationCode(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setErrorStep2(err instanceof Error ? err.message : "No se pudo reenviar el código.");
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
              onClick={() => (step === 2 ? setStep(1) : router.push("/login"))}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-slate-200/80 text-slate-600 shadow-sm active:scale-95 transition-all duration-150 hover:bg-slate-100"
            >
              <ChevronLeftIcon />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-blue-700 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Comunidad UAQ • {step === 1 ? "Nuevo Ingreso" : "Verificación Segura"}</span>
            </div>
            <div aria-hidden className="w-10 h-10" />
          </div>

          <div className="relative mt-1 mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-[0_10px_25px_-3px_rgba(37,99,235,0.35)] border border-blue-400/20">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
          </div>

          {step === 1 ? (
            <div className="text-center px-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activar Cuenta</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Ingresa tu expediente y matrícula oficial para validar tu identidad universitaria.
              </p>
            </div>
          ) : (
            <div className="text-center px-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Verificar Código</h1>
              <p className="text-[13px] text-slate-500 max-w-[310px] mx-auto leading-relaxed mb-3">
                Hemos enviado un código de seguridad de 6 dígitos al correo registrado:
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-100 rounded-full text-xs text-blue-900 font-semibold">
                <span>{maskEmail(email)}</span>
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-800 underline text-[11px] font-medium">
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </header>

        {step === 1 ? (
          <section className="w-full bg-white/95 rounded-3xl border border-slate-200/90 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.07)] p-5 sm:p-6 mb-5">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">1</span>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Validación de Alumno</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Paso 1 de 2</span>
            </div>

            {errorStep1 && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[13px]">
                {errorStep1}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleStep1Submit}>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="student-id">
                  Número de Expediente
                </label>
                <input
                  id="student-id"
                  required
                  value={expediente}
                  onChange={(e) => setExpediente(e.target.value)}
                  placeholder="Ej. 333350"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="carrera">
                  Carrera que estás cursando
                </label>
                <input
                  id="carrera"
                  required
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  placeholder="Ej. Lic. en Ingeniería de Software"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="email">
                  Correo Electrónico de Contacto
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alumno@correo.com"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-colors"
                />
              </div>

              <PasswordInput
                label="Crear Contraseña Institucional"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={setPassword}
              />
              <p className="text-[11px] text-slate-400 -mt-2">Debe incluir letras, números y al menos 8 caracteres.</p>

              <PasswordInput
                label="Confirmar Contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              <div className="pt-1 flex items-start">
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
                disabled={loadingStep1}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-150"
              >
                <span>{loadingStep1 ? "Validando..." : "Verificar y Activar Cuenta"}</span>
              </button>
            </form>
          </section>
        ) : (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_36px_-4px_rgba(37,99,235,0.08),0_4px_16px_-2px_rgba(15,23,42,0.04)] border border-slate-100/90 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</div>
                <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">Código de confirmación</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Paso 2 de 2</span>
            </div>

            {errorStep2 && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[13px]">
                {errorStep2}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleStep2Submit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ingresa los 6 dígitos recibidos</label>
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 my-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputsRef.current[index] = el;
                      }}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-full h-12 py-3 text-center text-xl font-extrabold text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-1 pb-1 text-center">
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <span>¿No recibiste el código?</span>
                  {cooldown > 0 ? (
                    <span className="font-semibold text-slate-700">
                      Reenviar en <span className="text-blue-600 font-mono font-bold">00:{String(cooldown).padStart(2, "0")}</span>
                    </span>
                  ) : (
                    <button type="button" onClick={handleResend} className="font-semibold text-blue-600 hover:underline">
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-normal bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/70">
                <p>El código expirará en 10 minutos. Revisa tu carpeta de correo no deseado o spam si no lo encuentras.</p>
              </div>

              <button
                type="submit"
                disabled={loadingStep2}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-[0_8px_20px_-3px_rgba(37,99,235,0.42)] flex items-center justify-center gap-2 transition duration-150 transform active:scale-[0.99] mt-1"
              >
                {loadingStep2 ? "Verificando..." : "Confirmar y Finalizar Activación"}
              </button>
            </form>
          </div>
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
            <span>Conexión segura institucional • Comunidad UAQ</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
