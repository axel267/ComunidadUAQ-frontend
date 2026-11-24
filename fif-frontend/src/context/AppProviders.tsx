"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { PerfilProvider } from "@/context/PerfilContext";
import { NotificacionesProvider } from "@/context/NotificacionesContext";
import { PublicacionesProvider } from "@/context/PublicacionesContext";
import { GuardadosProvider } from "@/context/GuardadosContext";
import { RecompensasProvider } from "@/context/RecompensasContext";
import { ComunidadProvider } from "@/context/ComunidadContext";
import { DetalleProvider } from "@/context/DetalleContext";
import { ModalAlertaUrgente } from "@/components/alertas/ModalAlertaUrgente";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PerfilProvider>
        <NotificacionesProvider>
          <PublicacionesProvider>
            <GuardadosProvider>
              <RecompensasProvider>
                <ComunidadProvider>
                  <DetalleProvider>
                    {children}
                    <ModalAlertaUrgente />
                  </DetalleProvider>
                </ComunidadProvider>
              </RecompensasProvider>
            </GuardadosProvider>
          </PublicacionesProvider>
        </NotificacionesProvider>
      </PerfilProvider>
    </ToastProvider>
  );
}
