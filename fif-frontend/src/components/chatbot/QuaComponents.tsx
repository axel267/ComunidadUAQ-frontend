"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  Library,
  Link2,
  Megaphone,
  PlusCircle,
  RotateCcw,
  Send,
  Square,
  Store,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCopilotChat } from "@copilotkit/react-core";
import {
  Markdown,
  useChatContext,
  type AssistantMessageProps,
  type ErrorMessageProps,
  type ImageRendererProps,
  type InputProps,
  type MessagesProps,
  type UserMessageProps,
} from "@copilotkit/react-ui";
import {
  CHIPS_INPUT_QUA,
  ENLACES_RAPIDOS_GRID,
  EXPLORA_UAQNECTA,
  nombreProcedencia,
  type ChipRapido,
  type EnlaceRapido,
  type ExploraCard,
} from "@/data/qua";

const ICONO_EXPLORA: Record<ExploraCard["icono"], LucideIcon> = {
  anuncios: Megaphone,
  comunidad: Users,
  hub: Store,
  publicar: PlusCircle,
  perfil: BadgeCheck,
};

const ICONO_ENLACE: Record<EnlaceRapido["icono"], LucideIcon> = {
  calendario: CalendarDays,
  pago: CreditCard,
  rutas: Bus,
  biblioteca: Library,
};

const ICONO_CHIP: Record<ChipRapido["icono"], LucideIcon> = {
  help: HelpCircle,
  school: GraduationCap,
  calendar: CalendarDays,
  store: Store,
  badge: BadgeCheck,
};

type SendFn = (texto: string) => void;
const QuaSendBridgeContext = createContext<{
  registrarOnSend: (fn: SendFn | null) => void;
  enviarConsulta: (texto: string) => void;
} | null>(null);

export function QuaSendBridgeProvider({ children }: { children: ReactNode }) {
  const sendRef = useRef<SendFn | null>(null);
  const registrarOnSend = useCallback((fn: SendFn | null) => {
    sendRef.current = fn;
  }, []);
  const enviarConsulta = useCallback((texto: string) => {
    sendRef.current?.(texto);
  }, []);
  const valor = useMemo(() => ({ registrarOnSend, enviarConsulta }), [registrarOnSend, enviarConsulta]);
  return <QuaSendBridgeContext.Provider value={valor}>{children}</QuaSendBridgeContext.Provider>;
}

function getTextFromUserContent(content: NonNullable<UserMessageProps["message"]>["content"] | undefined): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content
    .map((part) => (part.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function QuaButton() {
  const { open, setOpen } = useChatContext();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar asistente Qua" : "Abrir asistente Qua"}
        aria-expanded={open}
        className={`copilotKitButton relative flex items-center justify-center rounded-full cursor-pointer ${
          open ? "open bg-primary text-on-primary" : "bg-primary text-on-primary"
        }`}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
            <img src="/qua-avatar.png" alt="Qua" className="w-full h-full rounded-full object-cover" />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-container-lowest shadow-xs"
            />
          </>
        )}
      </button>
    </div>
  );
}

export function QuaHeader() {
  const { setOpen } = useChatContext();
  const { reset } = useCopilotChat();

  return (
    <header className="shrink-0 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container z-20">
      <div className="h-16 px-space-md flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar asistente"
            className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-full text-on-surface hover:bg-secondary-fixed/40 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
            <img
              src="/qua-avatar.png"
              alt="Qua"
              className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
          </div>

          <div className="flex flex-col min-w-0 ml-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-headline-sm text-on-surface font-bold leading-tight">Qua</span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-inter font-bold uppercase tracking-wider shrink-0">
                Guía Oficial
              </span>
            </div>
            <p className="text-body-sm text-secondary leading-none truncate">Asistente de UAQnecta</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          title="Reiniciar conversación"
          className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary active:scale-95 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-label-md">Inicio</span>
        </button>
      </div>
    </header>
  );
}

export function QuaUserMessage({ message, ImageRenderer }: UserMessageProps) {
  const textContent = getTextFromUserContent(message?.content);

  if (message && "image" in message && Boolean(message.image)) {
    const legacyImage = (message as { image?: ImageRendererProps["image"] }).image;
    return (
      <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] mb-3">
        <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm shadow-sm">
          <ImageRenderer image={legacyImage} content={textContent} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] mb-3">
      <div className="bg-primary text-on-primary px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
        <p className="text-body-md leading-relaxed whitespace-pre-wrap break-words">{textContent}</p>
      </div>
      <span className="text-label-sm font-inter text-secondary pr-1">Tú</span>
    </div>
  );
}

export function QuaAssistantMessage({
  message,
  isLoading,
  isCurrentMessage,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  feedback,
  markdownTagRenderers,
  subComponent: subComponentProp,
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const content = message?.content || "";
  const subComponent = message?.generativeUI?.() ?? subComponentProp;
  const subComponentPosition = message?.generativeUIPosition ?? "after";

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // portapapeles no disponible
    }
  };

  if (!content && !subComponent && !isLoading) return null;

  return (
    <div className="flex items-start gap-2.5 max-w-[95%] mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
      <img
        src="/qua-avatar.png"
        alt="Qua"
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 shadow-sm ring-1 ring-primary/20"
      />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {subComponent && subComponentPosition === "before" && <div>{subComponent}</div>}

        {content && (
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-on-surface border border-outline-variant/30 text-body-md leading-relaxed">
            <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline">
              <Markdown content={content} components={markdownTagRenderers} />
            </div>

            {!isLoading && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-surface-container text-secondary">
                <span className="text-label-sm font-inter">Qua • Guía Oficial</span>
                <div className="flex items-center gap-1">
                  {onRegenerate && isCurrentMessage && (
                    <button
                      type="button"
                      onClick={onRegenerate}
                      aria-label="Regenerar respuesta"
                      title="Regenerar respuesta"
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container hover:text-primary transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copiar respuesta"
                    title="Copiar respuesta"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container hover:text-primary transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {onThumbsUp && message && (
                    <button
                      type="button"
                      onClick={() => onThumbsUp(message, feedback !== "thumbsUp")}
                      aria-label="Me sirvió"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        feedback === "thumbsUp" ? "bg-primary text-on-primary" : "hover:bg-surface-container hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onThumbsDown && message && (
                    <button
                      type="button"
                      onClick={() => onThumbsDown(message, feedback !== "thumbsDown")}
                      aria-label="No me sirvió"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        feedback === "thumbsDown" ? "bg-error text-on-error" : "hover:bg-surface-container hover:text-error"
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {subComponent && subComponentPosition !== "before" && <div>{subComponent}</div>}

        {isLoading && !content && (
          <div className="bg-surface-container-lowest px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/30 inline-flex items-center gap-1.5 w-max">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function QuaErrorMessage({ onRegenerate }: ErrorMessageProps) {
  const router = useRouter();
  const { setOpen } = useChatContext();
  const { reset } = useCopilotChat();

  const accesos = [
    { label: "Tablón de Anuncios", href: "/" },
    { label: "Comunidad", href: "/comunidad" },
    { label: "Mi Perfil y QR", href: "/perfil" },
    { label: "Recompensas", href: "/perfil/recompensas" },
    { label: "Ajustes", href: "/perfil/ajustes" },
  ];

  return (
    <div className="flex items-start gap-2.5 max-w-[95%] mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
      <img
        src="/qua-avatar.png"
        alt="Qua"
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 shadow-sm ring-1 ring-primary/20"
      />
      <div className="bg-surface-container-lowest p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/40 flex flex-col gap-2.5 flex-1">
        <p className="text-body-md text-on-surface">
          No pude consultar el servicio de IA en este momento, pero aquí tienes acceso directo en un toque:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {accesos.map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => {
                router.push(a.href);
                setOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-primary-fixed/60 text-on-primary-fixed text-label-md hover:bg-primary-fixed transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => (onRegenerate ? onRegenerate() : reset())}
          className="self-start text-label-md text-primary hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {onRegenerate ? "Reintentar consulta" : "Volver a la guía de Qua"}
        </button>
      </div>
    </div>
  );
}

function QuaGuiaBloques({
  onEnviarPrompt,
  onIrRuta,
}: {
  onEnviarPrompt: (texto: string) => void;
  onIrRuta: (ruta: string) => void;
}) {
  return (
    <>
      {/* Tarjeta Hero de Qua */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex items-start gap-3.5">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
          <img
            src="/qua-avatar.png"
            alt="Qua Avatar"
            className="w-14 h-14 rounded-2xl object-cover shadow-md shadow-primary/10"
          />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface-container-lowest flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-surface-container-lowest rounded-full animate-ping opacity-75" />
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-headline-sm font-bold text-on-surface">¡Hola! Soy Qua 👋</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-inter font-semibold uppercase">
              Sin rodeos
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            No soy una IA compleja, ¡pero te digo exactamente qué puedes hacer en <strong>UAQnecta</strong> y te
            llevo al enlace oficial que buscas en un solo toque!
          </p>
        </div>
      </div>

      {/* Bloque 1: ¿Qué puedes hacer en UAQnecta? */}
      <section aria-label="Explorar UAQnecta" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-headline-sm font-bold text-on-surface flex items-center gap-1.5">
            <LayoutGrid className="w-5 h-5 text-primary" />
            ¿Qué puedes hacer en UAQnecta?
          </span>
          <span className="text-label-sm font-inter text-secondary">Toca para explorar</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {EXPLORA_UAQNECTA.map((card) => {
            const Icono = ICONO_EXPLORA[card.icono];
            return (
              <div
                key={card.id}
                className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-3 hover:border-primary/40 transition-all"
              >
                <button
                  type="button"
                  onClick={() => onEnviarPrompt(card.prompt)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left active:scale-[0.99] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.fondoIcono}`}>
                    <Icono className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[15px] font-semibold text-on-surface leading-tight truncate">
                      {card.titulo}
                    </span>
                    <p className="text-body-sm text-secondary truncate">{card.descripcion}</p>
                  </div>
                </button>

                {card.rutaDirecta ? (
                  <button
                    type="button"
                    onClick={() => onIrRuta(card.rutaDirecta!)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-label-sm font-inter transition-colors ${
                      card.etiquetaDestacada
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                        : "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                    }`}
                  >
                    {card.etiqueta}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onEnviarPrompt(card.prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 text-label-sm font-inter font-semibold"
                  >
                    {card.etiqueta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bloque 2: Enlaces Rápidos Oficiales */}
      <section aria-label="Enlaces Rápidos Oficiales" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-headline-sm font-bold text-on-surface flex items-center gap-1.5">
            <Link2 className="w-5 h-5 text-primary" />
            Enlaces Rápidos Oficiales
          </span>
          <span className="text-label-sm font-inter text-primary">Acceso directo</span>
        </div>

        <a
          href="https://comunidad.uaq.mx"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center justify-between gap-3 hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-on-surface truncate">Portal de Alumnos</span>
              <span className="text-xs text-secondary truncate">Kárdex, calificaciones y trámites</span>
            </div>
          </div>
          <span className="shrink-0 h-8 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            Abrir Portal
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          {ENLACES_RAPIDOS_GRID.map((enlace) => {
            const Icono = ICONO_ENLACE[enlace.icono];
            return (
              <button
                key={enlace.id}
                type="button"
                onClick={() => onEnviarPrompt(enlace.prompt)}
                className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col items-start text-left hover:border-primary/50 active:scale-[0.98] transition-all"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${enlace.fondoIcono}`}>
                  <Icono className="w-[18px] h-[18px]" />
                </div>
                <span className="text-xs font-bold text-on-surface leading-tight">{enlace.titulo}</span>
                <span className="text-[11px] text-secondary mt-0.5">{enlace.subtitulo}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function QuaMessages({
  messages,
  inProgress,
  children,
  RenderMessage,
  AssistantMessage,
  UserMessage,
  ErrorMessage,
  ImageRenderer,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  messageFeedback,
  markdownTagRenderers,
  chatError,
}: MessagesProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen } = useChatContext();
  const bridge = useContext(QuaSendBridgeContext);
  const [guiaAbiertaEnChat, setGuiaAbiertaEnChat] = useState(false);

  const finRef = useRef<HTMLDivElement>(null);
  const hayConversacion = messages.length > 0;

  useEffect(() => {
    if (hayConversacion || inProgress) {
      finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, inProgress, hayConversacion]);

  const enviarPrompt = (texto: string) => {
    if (inProgress) return;
    bridge?.enviarConsulta(texto);
  };

  const irARuta = (ruta: string) => {
    router.push(ruta);
    setOpen(false);
  };

  return (
    <div className="copilotKitMessages flex-1 overflow-y-auto bg-surface px-space-md py-3">
      <div className="flex flex-col gap-3">
        {/* Banner sutil de procedencia */}
        <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-xl text-secondary">
          <div className="flex items-center gap-1.5 min-w-0">
            <Megaphone className="w-4 h-4 text-primary shrink-0" />
            <span className="text-body-sm text-secondary truncate">
              Acceso directo desde{" "}
              <strong className="text-label-md text-on-surface">{nombreProcedencia(pathname)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest/70 hover:bg-surface-container-highest text-on-surface text-label-sm font-inter transition-colors active:scale-95 shrink-0"
          >
            Volver
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Estado inicial: muestra la guía completa de Stitch + ejemplo de respuesta directa */}
        {!hayConversacion ? (
          <>
            <QuaGuiaBloques onEnviarPrompt={enviarPrompt} onIrRuta={irARuta} />

            {/* Diálogo Breve de Ejemplo con Qua */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-outline-variant/40" />
                <span className="text-label-sm font-inter text-secondary uppercase tracking-wider">
                  Ejemplo de respuesta directa
                </span>
                <span className="h-px flex-1 bg-outline-variant/40" />
              </div>

              <div className="flex flex-col items-end gap-1 max-w-[85%] self-end">
                <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm shadow-sm">
                  <p className="text-body-md leading-relaxed">¿A dónde voy para vender unos libros?</p>
                </div>
                <span className="text-label-sm font-inter text-secondary pr-1">Ejemplo</span>
              </div>

              <div className="flex items-start gap-2.5 max-w-[96%]">
                {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
                <img
                  src="/qua-avatar.png"
                  alt="Qua"
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 shadow-sm ring-1 ring-primary/20"
                />
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="bg-surface-container-lowest p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-on-surface border border-outline-variant/30">
                    <p className="text-body-md leading-relaxed">
                      Ve a la pestaña <strong>Comunidad</strong> y usa la categoría{" "}
                      <strong>Hub Universitario</strong> para publicar o buscar libros, materiales y servicios. ¡O toca
                      aquí abajo para ir directo!
                    </p>
                    <div className="mt-3 bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-semibold text-on-surface truncate">Hub Universitario UAQ</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => irARuta("/comunidad")}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-inter font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-sm shrink-0"
                      >
                        Ir al Hub
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-label-sm font-inter text-secondary pl-1">Qua • Guía Oficial</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* En conversación activa: acordeón compacto para no perder las guías rápidas */}
            <button
              type="button"
              onClick={() => setGuiaAbiertaEnChat((v) => !v)}
              className="flex items-center justify-between bg-surface-container-lowest px-3.5 py-2 rounded-xl border border-outline-variant/40 text-label-md text-primary shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Explorar secciones y enlaces rápidos UAQ
              </span>
              {guiaAbiertaEnChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {guiaAbiertaEnChat && <QuaGuiaBloques onEnviarPrompt={enviarPrompt} onIrRuta={irARuta} />}

            <div className="flex items-center gap-2 pt-1">
              <span className="h-px flex-1 bg-outline-variant/40" />
              <span className="text-label-sm font-inter text-secondary uppercase tracking-wider">
                Conversación con Qua
              </span>
              <span className="h-px flex-1 bg-outline-variant/40" />
            </div>

            <div>
              {messages.map((message, index) => (
                <RenderMessage
                  key={message.id || index}
                  message={message}
                  messages={messages}
                  inProgress={inProgress}
                  index={index}
                  isCurrentMessage={index === messages.length - 1}
                  AssistantMessage={AssistantMessage}
                  UserMessage={UserMessage}
                  ImageRenderer={ImageRenderer}
                  onRegenerate={onRegenerate}
                  onCopy={onCopy}
                  onThumbsUp={onThumbsUp}
                  onThumbsDown={onThumbsDown}
                  messageFeedback={messageFeedback}
                  markdownTagRenderers={markdownTagRenderers}
                />
              ))}

              {inProgress &&
                (messages[messages.length - 1]?.role === "user" || messages[messages.length - 1]?.role === "tool") && (
                  <div className="flex items-start gap-2.5 max-w-[90%] mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- avatar local de Qua */}
                    <img
                      src="/qua-avatar.png"
                      alt="Qua"
                      className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-primary/20"
                    />
                    <div className="bg-surface-container-lowest px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-outline-variant/30 inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}

              {chatError && ErrorMessage && <ErrorMessage error={chatError} isCurrentMessage />}
            </div>
          </>
        )}

        <footer className="copilotKitMessagesFooter p-0 mt-1">{children}</footer>
        <div ref={finRef} />
      </div>
    </div>
  );
}

export function QuaInput({ inProgress, onSend, onStop, hideStopButton = false }: InputProps) {
  const [texto, setTexto] = useState("");
  const [composing, setComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bridge = useContext(QuaSendBridgeContext);

  useEffect(() => {
    bridge?.registrarOnSend((t: string) => {
      void onSend(t);
    });
    return () => bridge?.registrarOnSend(null);
  }, [bridge, onSend]);

  const enviar = (contenido = texto) => {
    const limpio = contenido.trim();
    if (!limpio || inProgress) return;
    void onSend(limpio);
    if (contenido === texto) setTexto("");
    textareaRef.current?.focus();
  };

  return (
    <div className="shrink-0 bg-surface/95 backdrop-blur-xl px-space-md pt-2 pb-3 border-t border-outline-variant/25 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      {/* Chips rápidos superiores */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {CHIPS_INPUT_QUA.map((chip) => {
          const Icono = ICONO_CHIP[chip.icono];
          return (
            <button
              key={chip.id}
              type="button"
              disabled={inProgress}
              onClick={() => enviar(chip.prompt)}
              className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-label-md border border-outline-variant/40 active:scale-95 transition-all disabled:opacity-50"
            >
              <Icono className="w-3.5 h-3.5 text-primary" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input y botón enviar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-full px-4 py-2 flex items-center shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !composing) {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder="Toca un tema o busca un enlace directo..."
            aria-label="Escribe tu consulta para Qua"
            className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none resize-none max-h-24 leading-6"
          />
        </div>

        {inProgress && !hideStopButton ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Detener respuesta"
            className="w-11 h-11 rounded-full bg-error text-on-error flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!texto.trim()}
            onClick={() => enviar()}
            aria-label="Enviar consulta a Qua"
            className="w-11 h-11 rounded-full bg-primary hover:bg-primary-container disabled:opacity-45 text-on-primary flex items-center justify-center shadow-md shadow-primary/25 active:scale-95 transition-all shrink-0"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
