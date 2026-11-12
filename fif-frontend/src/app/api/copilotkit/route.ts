import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️ [CopilotKit] ADVERTENCIA: No se encontró GEMINI_API_KEY en las variables de entorno (.env.local). El chatbot no podrá responder hasta que se configure."
  );
}

const serviceAdapter = new GoogleGenerativeAIAdapter({
  apiKey: apiKey || "dummy-key-for-initialization",
  model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
