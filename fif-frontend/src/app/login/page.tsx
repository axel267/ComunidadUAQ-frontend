"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { PasswordInput } from "@/components/PasswordInput";
import { GoogleIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password, rememberDevice });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f8fafc] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[520px]"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.28) 0%, rgba(30, 64, 175, 0.12) 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-md mx-auto px-5 pt-10 pb-8 min-h-screen">
        <header className="w-full flex flex-col items-center text-center pt-6 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center mb-5 text-white ring-4 ring-white">
            <span className="text-3xl font-black">U</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-[280px] leading-relaxed">
            Ingresa con tus credenciales universitarias
          </p>
        </header>

        <section className="w-full my-2">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.85)] border border-slate-100">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700" htmlFor="student-credential">
                  Correo institucional o ID
                </label>
                <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200/80 transition-all duration-200 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-600/15">
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                    </svg>
                  </div>
                  <input
                    id="student-credential"
                    autoComplete="username"
                    required
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@universidad.edu"
                    className="w-full py-3 pl-3 pr-4 rounded-xl bg-transparent text-slate-800 text-[14px] font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
              </div>

              <PasswordInput
                label="Contraseña"
                placeholder="Tu contraseña institucional"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() =>
                      setNotice("Te hemos enviado una guía de restablecimiento al correo alternativo registrado.")
                    }
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                }
              />

              {notice && <p className="text-[12px] text-blue-600 -mt-2">{notice}</p>}

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="remember-device">
                  <input
                    id="remember-device"
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-[13px] font-normal text-slate-600">Recordar sesión</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-150 active:scale-[0.99] mt-1 tracking-tight"
              >
                <span>{loading ? "Validando credenciales..." : "Iniciar Sesión"}</span>
                {!loading && (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-5">
              <div className="w-full h-px bg-slate-100" />
              <span className="absolute px-3 bg-white text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                o ingresa con
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotice("La autenticación con Google (SSO institucional) estará disponible próximamente.")
              }
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50/90 border border-slate-200/80 text-slate-700 font-medium text-[14px] flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] shadow-sm hover:shadow"
            >
              <GoogleIcon />
              <span className="font-medium tracking-tight">Continuar con Google</span>
            </button>
          </div>
        </section>

        <footer className="w-full flex flex-col items-center gap-3 pt-2 pb-4">
          <div className="text-center">
            <span className="text-[13px] text-slate-500 font-normal">¿Eres nuevo estudiante?</span>{" "}
            <Link
              href="/activar-cuenta"
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:underline ml-1"
            >
              Activa tu cuenta
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
