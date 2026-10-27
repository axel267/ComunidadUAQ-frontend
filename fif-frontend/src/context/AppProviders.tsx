"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { NotificacionesProvider } from "@/context/NotificacionesContext";
import { PublicacionesProvider } from "@/context/PublicacionesContext";
import { GuardadosProvider } from "@/context/GuardadosContext";
import { RecompensasProvider } from "@/context/RecompensasContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NotificacionesProvider>
        <PublicacionesProvider>
          <GuardadosProvider>
            <RecompensasProvider>{children}</RecompensasProvider>
          </GuardadosProvider>
        </PublicacionesProvider>
      </NotificacionesProvider>
    </ToastProvider>
  );
}
