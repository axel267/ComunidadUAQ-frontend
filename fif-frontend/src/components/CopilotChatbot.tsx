"use client";

import React from "react";
import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { getFacultades } from "../services/api";

// El widget no se muestra en las pantallas de autenticación: no forman parte del diseño de Stitch para ese flujo.
const AUTH_ROUTES = ["/login", "/activar-cuenta"];

function CopilotGlobalActions() {
  const router = useRouter();

  // Acción 1: Navegación inteligente a diferentes puntos de la aplicación
  useCopilotAction({
    name: "navegarA",
    description: "Redirige al usuario a una sección o pantalla específica dentro de la aplicación Comunidad UAQ",
    parameters: [
      {
        name: "ruta",
        type: "string",
        description: "Ruta de la aplicación. Opciones principales: '/' (Inicio), '/facultades' (Gestión de Facultades)",
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
      <div className="p-2 my-1 text-xs bg-indigo-950/70 border border-indigo-700/60 rounded-lg text-indigo-200 flex items-center gap-2">
        <span>🚀</span>
        <span>{status === "complete" ? `Redirigido a: ${args.ruta}` : `Navegando a ${args.ruta}...`}</span>
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
      <div className="p-2 my-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 flex items-center gap-2">
        <span>🔍</span>
        <span>
          {status === "inProgress"
            ? "Consultando base de datos de facultades..."
            : result?.estado === "exitoso"
            ? `Se verificaron ${result.total} facultades en el sistema.`
            : "Verificación de datos completada."}
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
      } catch (err: any) {
        return {
          estado: "error",
          mensaje: "No se pudo conectar con el backend de NestJS para consultar las facultades. Asegúrate de que el servidor esté activo.",
          detalle: err?.message || String(err),
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
      <CopilotPopup
        instructions={`Eres el asistente virtual oficial de 'Comunidad UAQ'.
Objetivo primordial: RESPONDER RÁPIDO, CONCISO Y DIRECTO.
1. Responde siempre de forma breve (máximo 2-3 oraciones o viñetas cortas).
2. Si la información ya está visible en la pantalla (como la lista de facultades), úsala DIRECTAMENTE sin llamar a herramientas adicionales.
3. Solo ejecuta 'navegarA' si el usuario pide explícitamente cambiar de sección o pantalla.
4. Solo ejecuta 'verificarFacultades' si el usuario pregunta por facultades y dicha lista NO aparece en tu contexto.
5. Habla siempre en español amable y universitario.`}
        labels={{
          title: "Asistente Comunidad UAQ",
          initial: "¡Hola! Soy el asistente de Comunidad UAQ 🎓. Puedo guiarte por la plataforma o verificar información de las facultades por ti. ¿En qué te ayudo?",
          placeholder: "Escribe tu consulta o pide que te lleve a una sección...",
        }}
        defaultOpen={false}
        clickOutsideToClose={true}
      />
      )}
    </CopilotKit>
  );
}
