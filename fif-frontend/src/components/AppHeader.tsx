"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificacionesApp } from "@/context/NotificacionesContext";
import { usePerfil } from "@/context/PerfilContext";

interface AppHeaderProps {
  subtitle: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const { sinLeer: notificacionesSinLeer, abrir } = useNotificacionesApp();
  const { perfil } = usePerfil();

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-md flex items-center justify-between">
        <Link href="/" aria-label="Ir al inicio" className="flex items-center gap-space-xs">
          <div className="h-10 w-10 rounded-xl bg-white border border-outline-variant/40 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/logo-uaqnecta.png"
              alt="UAQnecta"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-headline-sm text-primary leading-none">UAQnecta</span>
            <span className="text-label-sm font-inter text-secondary leading-tight mt-0.5">{subtitle}</span>
          </div>
        </Link>
        <div className="flex items-center gap-space-xs">
          <button
            aria-label={
              notificacionesSinLeer > 0 ? `Notificaciones, ${notificacionesSinLeer} sin leer` : "Notificaciones"
            }
            onClick={abrir}
            className="relative w-touch-target-min h-touch-target-min flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full"
          >
            <Bell className="w-6 h-6" />
            {notificacionesSinLeer > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-surface-container-lowest"
              >
                {notificacionesSinLeer > 9 ? "9+" : notificacionesSinLeer}
              </span>
            )}
          </button>
          <Link
            href="/perfil"
            aria-label="Mi perfil"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary text-label-sm ring-2 ring-primary-fixed hover:scale-105 active:scale-95 transition-transform"
          >
            {perfil.siglas}
          </Link>
        </div>
      </div>
    </header>
  );
}
