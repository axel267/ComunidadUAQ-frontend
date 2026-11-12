"use client";

import React from "react";
import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { CopilotPopup, type CopilotKitCSSProperties } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { Compass, GraduationCap, SearchCheck } from "lucide-react";
import { getFacultades } from "../services/api";
import {
  QuaAssistantMessage,
  QuaButton,
  QuaErrorMessage,
  QuaHeader,
  QuaInput,
  QuaMessages,
  QuaSendBridgeProvider,
  QuaUserMessage,
} from "./chatbot/QuaComponents";
import { QUA_INSTRUCCIONES } from "@/data/qua";

// El widget no se muestra en las pantallas de autenticación: no forman parte del diseño de Stitch para ese flujo.
const AUTH_ROUTES = ["/login", "/activar-cuenta"];

const QUA_THEME_VARS: CopilotKitCSSProperties = {
  "--copilot-kit-primary-color": "#004ac6",
  "--copilot-kit-contrast-color": "#ffffff",
  "--copilot-kit-background-color": "#f7f9fb",
  "--copilot-kit-input-background-color": "#ffffff",
  "--copilot-kit-secondary-color": "#f2f4f6",
  "--copilot-kit-secondary-contrast-color": "#191c1e",
  "--copilot-kit-separator-color": "#eceef0",
  "--copilot-kit-muted-color": "#565e74",
};

function CopilotGlobalActions() {
  const router = useRouter();

  // Acción 1: Navegación inteligente a diferentes puntos de la aplicación
  useCopilotAction({
    name: "navegarA",
    description: "Redirige al usuario a una sección o pantalla específica dentro de la aplicación Comunidad UAQ / UAQnecta",
    parameters: [
      {
        name: "ruta",
        type: "string",
        description:
          "Ruta de la aplicación. Opciones: '/' (Anuncios), '/comunidad' (Comunidad y Hub), '/perfil' (Perfil y Credencial QR), '/perfil/recompensas' (Recompensas), '/perfil/ajustes' (Ajustes), '/facultades' (Facultades)",
        required: true,
      },
      {
        name: "motivo",
        type: "string",
        description: "Breve explicación de a dónde se está llevando al usuario",
        required: false,
      },
    ],
    render: ({ status, args }) => (
      <div className="p-2.5 my-1 text-xs bg-surface-container-low border border-primary/20 rounded-xl text-on-surface flex items-center gap-2">
        <Compass className="w-4 h-4 text-primary shrink-0" />
        <span className="font-medium">
          {status === "complete" ? `Redirigido a ${args.ruta}` : `Abriendo ${args.ruta}...`}
        </span>
      </div>
    ),
    handler: async ({ ruta, motivo }) => {
      router.push(ruta);
      return `Navegación completada con éxito a ${ruta}. ${motivo ? `(${motivo})` : ""}`;
    },
  });

  // Acción 2: Verificación de información en tiempo real desde el backend NestJS
  useCopilotAction({
    name: "verificarFacultades",
    description: "Consulta y verifica en tiempo real la lista de facultades registradas en la base de datos de la plataforma",
    parameters: [],
    render: ({ status, result }) => (
      <div className="p-2.5 my-1 text-xs bg-surface-container-low border border-outline-variant/40 rounded-xl text-on-surface flex items-center gap-2">
        {status === "inProgress" ? (
          <GraduationCap className="w-4 h-4 text-primary shrink-0 animate-pulse" />
        ) : (
          <SearchCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        )}
        <span className="font-medium">
          {status === "inProgress"
            ? "Consultando facultades registradas..."
            : result?.estado === "exitoso"
              ? `Se verificaron ${result.total} facultades en el sistema.`
              : "Consulta de facultades completada."}
        </span>
      </div>
    ),
    handler: async () => {
      try {
        const facultades = await getFacultades();
        if (!facultades || facultades.length === 0) {
          return {
            estado: "sin_datos",
            mensaje: "No hay facultades registradas actualmente en el sistema.",
            total: 0,
            facultades: [],
          };
        }
        return {
          estado: "exitoso",
          total: facultades.length,
          facultades: facultades.map((f) => ({
            id: f.id,
            nombre: f.nombre,
            abreviatura: f.abreviatura,
          })),
        };
      } catch (err: unknown) {
        return {
          estado: "error",
          mensaje: "No se pudo conectar con el backend de NestJS para consultar las facultades. Asegúrate de que el servidor esté activo.",
          detalle: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  return null;
}

export function CopilotChatbot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideWidget = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotGlobalActions />
      {children}
      {!hideWidget && (
        <QuaSendBridgeProvider>
          <div style={QUA_THEME_VARS}>
            <CopilotPopup
              instructions={QUA_INSTRUCCIONES}
              labels={{
                title: "Qua",
                placeholder: "Toca un tema o busca un enlace directo...",
              }}
              Button={QuaButton}
              Header={QuaHeader}
              Messages={QuaMessages}
              UserMessage={QuaUserMessage}
              AssistantMessage={QuaAssistantMessage}
              ErrorMessage={QuaErrorMessage}
              Input={QuaInput}
              defaultOpen={false}
              clickOutsideToClose={true}
            />
          </div>
        </QuaSendBridgeProvider>
      )}
    </CopilotKit>
  );
}
