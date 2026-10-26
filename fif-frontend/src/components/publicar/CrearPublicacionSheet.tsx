"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChartColumn,
  ChevronDown,
  FileText,
  GraduationCap,
  Hash,
  ImageIcon,
  Link2,
  MapPin,
  PartyPopper,
  Play,
  Plus,
  Replace,
  Trash2,
  Upload,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AUTOR_MOCK,
  DURACIONES_ENCUESTA,
  FORMATOS_DOCUMENTO,
  HASHTAGS_SUGERIDOS,
  LIMITE_MB,
  MAX_CARACTERES,
  MAX_OPCIONES_ENCUESTA,
  MIN_OPCIONES_ENCUESTA,
  TEMAS,
  VISIBILIDADES,
  type AdjuntoPublicacion,
  type AutorPublicacion,
  type DuracionEncuesta,
  type NuevaPublicacion,
  type TemaPublicacion,
  type TipoAdjunto,
  type VisibilidadPublicacion,
} from "@/data/publicaciones";

interface CrearPublicacionSheetProps {
  autor?: AutorPublicacion;
  onClose: () => void;
  onSubmit: (publicacion: NuevaPublicacion) => void;
}

const TABS: { id: TipoAdjunto; label: string; icon: LucideIcon }[] = [
  { id: "imagen", label: "Imagen", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "documento", label: "Documento", icon: FileText },
  { id: "encuesta", label: "Encuesta", icon: ChartColumn },
  { id: "evento", label: "Evento", icon: CalendarDays },
];

function formatearTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function esUrlValida(valor: string) {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function useObjectUrl(archivo?: File) {
  const url = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}

const inputBase =
  "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  destacado,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  options: { id: string; label: string }[];
  destacado?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-label-md text-on-surface-variant mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-surface-container-lowest border rounded-xl pl-3 pr-8 py-2 text-label-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            destacado ? "border-primary-fixed text-primary font-bold" : "border-outline-variant text-on-surface-variant"
          }`}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
            destacado ? "text-primary" : "text-outline"
          }`}
        />
      </div>
    </div>
  );
}

function Dropzone({
  icon: Icon,
  titulo,
  ayuda,
  accept,
  onPick,
}: {
  icon: LucideIcon;
  titulo: string;
  ayuda: string;
  accept: string;
  onPick: (archivo: File) => void;
}) {
  return (
    <label className="flex flex-col items-center justify-center gap-1 w-full py-6 px-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low text-center cursor-pointer hover:border-primary hover:bg-primary-fixed/40 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <span className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-label-lg text-on-surface">{titulo}</span>
      <span className="text-body-sm text-secondary">{ayuda}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) onPick(archivo);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function PanelHeader({
  icon: Icon,
  titulo,
  accion,
}: {
  icon: LucideIcon;
  titulo: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-label-md text-on-surface-variant flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-primary" />
        {titulo}
      </span>
      {accion}
    </div>
  );
}

function ReemplazarBoton({ accept, onPick, texto }: { accept: string; onPick: (f: File) => void; texto: string }) {
  return (
    <label className="text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer focus-within:underline">
      <Replace className="w-3.5 h-3.5" />
      {texto}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) onPick(archivo);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function PanelImagen({ archivo, onPick, onQuitar }: { archivo?: File; onPick: (f: File) => void; onQuitar: () => void }) {
  const url = useObjectUrl(archivo);

  if (!archivo || !url) {
    return (
      <Dropzone
        icon={ImageIcon}
        titulo="Subir una imagen"
        ayuda={`JPG, PNG o WEBP (máx. ${LIMITE_MB.imagen} MB)`}
        accept="image/*"
        onPick={onPick}
      />
    );
  }

  return (
    <div className="space-y-2">
      <PanelHeader
        icon={ImageIcon}
        titulo="Imagen seleccionada"
        accion={<ReemplazarBoton accept="image/*" onPick={onPick} texto="Reemplazar" />}
      />
      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant">
        {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), no aplica optimización */}
        <img src={url} alt="Vista previa de la imagen adjunta" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/50 via-transparent to-transparent" />
        <button
          type="button"
          aria-label="Eliminar imagen"
          onClick={onQuitar}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-on-surface/70 hover:bg-on-surface text-white flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate bg-surface-container-lowest/95 px-2.5 py-1 rounded-full text-on-surface text-label-md">
          {archivo.name} · {formatearTamano(archivo.size)}
        </span>
      </div>
    </div>
  );
}

function PanelVideo({
  archivo,
  enlace,
  onPick,
  onEnlace,
  onQuitar,
}: {
  archivo?: File;
  enlace: string;
  onPick: (f: File) => void;
  onEnlace: (v: string) => void;
  onQuitar: () => void;
}) {
  const url = useObjectUrl(archivo);
  const enlaceInvalido = enlace.trim() !== "" && !esUrlValida(enlace.trim());

  return (
    <div className="space-y-2">
      <PanelHeader
        icon={Video}
        titulo="Video multimedia"
        accion={archivo ? <ReemplazarBoton accept="video/*" onPick={onPick} texto="Cambiar video" /> : undefined}
      />
      {archivo && url ? (
        <div className="relative w-full rounded-2xl overflow-hidden bg-inverse-surface">
          <video src={url} controls className="w-full max-h-48 bg-black" aria-label="Vista previa del video" />
          <button
            type="button"
            aria-label="Eliminar video"
            onClick={onQuitar}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-inverse-on-surface">
            <span className="flex items-center gap-1.5 min-w-0 text-label-md">
              <Play className="w-3.5 h-3.5 shrink-0 text-inverse-primary" />
              <span className="truncate">{archivo.name}</span>
            </span>
            <span className="text-label-sm shrink-0 opacity-70">{formatearTamano(archivo.size)}</span>
          </div>
        </div>
      ) : (
        <Dropzone
          icon={Video}
          titulo="Subir un video"
          ayuda={`MP4 o MOV (máx. ${LIMITE_MB.video} MB)`}
          accept="video/*"
          onPick={onPick}
        />
      )}
      {!archivo && (
        <div>
          <label htmlFor="video-enlace" className="flex items-center gap-1 text-label-md text-on-surface-variant mb-1">
            <Link2 className="w-3.5 h-3.5 text-outline" /> O pega un enlace de YouTube / Teams
          </label>
          <input
            id="video-enlace"
            type="url"
            inputMode="url"
            value={enlace}
            onChange={(e) => onEnlace(e.target.value)}
            placeholder="https://..."
            aria-invalid={enlaceInvalido}
            className={inputBase}
          />
          {enlaceInvalido && <p className="mt-1 text-body-sm text-error">Ingresa un enlace válido (https://...).</p>}
        </div>
      )}
    </div>
  );
}

function PanelDocumento({ archivo, onPick, onQuitar }: { archivo?: File; onPick: (f: File) => void; onQuitar: () => void }) {
  if (!archivo) {
    return (
      <Dropzone
        icon={FileText}
        titulo="Subir un documento"
        ayuda={`PDF, DOCX o PPTX (máx. ${LIMITE_MB.documento} MB)`}
        accept={FORMATOS_DOCUMENTO}
        onPick={onPick}
      />
    );
  }
  const extension = archivo.name.split(".").pop()?.toUpperCase() ?? "DOC";

  return (
    <div className="space-y-2">
      <PanelHeader
        icon={FileText}
        titulo="Documento adjunto"
        accion={<ReemplazarBoton accept={FORMATOS_DOCUMENTO} onPick={onPick} texto="Subir otro" />}
      />
      <div className="flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex flex-col items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
            <span className="text-[8px] font-extrabold leading-none mt-0.5">{extension}</span>
          </div>
          <div className="min-w-0">
            <p className="text-label-lg text-on-surface truncate">{archivo.name}</p>
            <p className="text-body-sm text-secondary">{formatearTamano(archivo.size)}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Eliminar documento"
          onClick={onQuitar}
          className="w-8 h-8 rounded-full text-outline hover:text-error hover:bg-error-container/60 flex items-center justify-center transition-colors shrink-0"
        >
          <Trash2 className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}

function PanelEncuesta({
  pregunta,
  opciones,
  duracion,
  onPregunta,
  onOpciones,
  onDuracion,
  onQuitar,
}: {
  pregunta: string;
  opciones: string[];
  duracion: DuracionEncuesta;
  onPregunta: (v: string) => void;
  onOpciones: (v: string[]) => void;
  onDuracion: (v: DuracionEncuesta) => void;
  onQuitar: () => void;
}) {
  return (
    <div className="space-y-2">
      <PanelHeader
        icon={ChartColumn}
        titulo="Creador de encuesta"
        accion={
          <button type="button" onClick={onQuitar} className="text-label-md text-outline hover:text-error">
            Quitar encuesta
          </button>
        }
      />
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-3.5 space-y-3">
        <div>
          <label htmlFor="encuesta-pregunta" className="block text-label-md text-on-surface-variant mb-1">
            Pregunta de la encuesta
          </label>
          <input
            id="encuesta-pregunta"
            type="text"
            value={pregunta}
            maxLength={120}
            onChange={(e) => onPregunta(e.target.value)}
            placeholder="Ej: ¿Asistirás a la asesoría de Matemáticas?"
            className={inputBase}
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="block text-label-md text-on-surface-variant mb-1">Opciones de votación</legend>
          {opciones.map((opcion, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center shrink-0 text-label-sm text-secondary">
                {i + 1}
              </span>
              <input
                type="text"
                aria-label={`Opción ${i + 1}`}
                value={opcion}
                maxLength={60}
                onChange={(e) => onOpciones(opciones.map((o, j) => (j === i ? e.target.value : o)))}
                placeholder={`Opción ${i + 1}`}
                className={inputBase}
              />
              {opciones.length > MIN_OPCIONES_ENCUESTA && (
                <button
                  type="button"
                  aria-label={`Quitar opción ${i + 1}`}
                  onClick={() => onOpciones(opciones.filter((_, j) => j !== i))}
                  className="w-7 h-7 shrink-0 rounded-full text-outline hover:text-error hover:bg-error-container/60 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {opciones.length < MAX_OPCIONES_ENCUESTA && (
            <button
              type="button"
              onClick={() => onOpciones([...opciones, ""])}
              className="w-full py-1.5 border border-dashed border-primary/40 rounded-xl text-primary text-label-md hover:bg-primary-fixed/40 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar opción
            </button>
          )}
        </fieldset>
        <div className="pt-2 border-t border-surface-container flex items-center justify-between gap-2">
          <label htmlFor="encuesta-duracion" className="text-label-md text-on-surface-variant">
            Duración de la votación:
          </label>
          <select
            id="encuesta-duracion"
            value={duracion}
            onChange={(e) => onDuracion(e.target.value as DuracionEncuesta)}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1 text-label-md text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {DURACIONES_ENCUESTA.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function PanelEvento({
  titulo,
  fechaHora,
  lugar,
  onTitulo,
  onFechaHora,
  onLugar,
  onQuitar,
}: {
  titulo: string;
  fechaHora: string;
  lugar: string;
  onTitulo: (v: string) => void;
  onFechaHora: (v: string) => void;
  onLugar: (v: string) => void;
  onQuitar: () => void;
}) {
  return (
    <div className="space-y-2">
      <PanelHeader
        icon={CalendarDays}
        titulo="Tarjeta de evento"
        accion={
          <button type="button" onClick={onQuitar} className="text-label-md text-outline hover:text-error">
            Quitar evento
          </button>
        }
      />
      <div className="bg-surface-container-lowest border border-primary-fixed rounded-2xl p-3.5 space-y-3">
        <div>
          <label htmlFor="evento-titulo" className="block text-label-md text-on-surface-variant mb-1">
            Nombre del evento
          </label>
          <div className="relative">
            <PartyPopper className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary" />
            <input
              id="evento-titulo"
              type="text"
              value={titulo}
              maxLength={80}
              onChange={(e) => onTitulo(e.target.value)}
              placeholder="Nombre de la actividad o ponencia"
              className={`${inputBase} pl-9`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="evento-fecha" className="block text-label-md text-on-surface-variant mb-1">
            Fecha y hora
          </label>
          <input
            id="evento-fecha"
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => onFechaHora(e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="evento-lugar" className="block text-label-md text-on-surface-variant mb-1">
            Lugar / ubicación en campus
          </label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary" />
            <input
              id="evento-lugar"
              type="text"
              value={lugar}
              maxLength={100}
              onChange={(e) => onLugar(e.target.value)}
              placeholder="Ej: Auditorio de Informática, Campus Juriquilla"
              className={`${inputBase} pl-9`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrearPublicacionSheet({ autor = AUTOR_MOCK, onClose, onSubmit }: CrearPublicacionSheetProps) {
  const tituloId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [texto, setTexto] = useState("");
  const [tema, setTema] = useState<TemaPublicacion>("hub");
  const [visibilidad, setVisibilidad] = useState<VisibilidadPublicacion>("facultad");
  const [tab, setTab] = useState<TipoAdjunto | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  const [imagen, setImagen] = useState<File>();
  const [video, setVideo] = useState<File>();
  const [enlaceVideo, setEnlaceVideo] = useState("");
  const [documento, setDocumento] = useState<File>();
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState<string[]>(["", ""]);
  const [duracion, setDuracion] = useState<DuracionEncuesta>("3d");
  const [tituloEvento, setTituloEvento] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [lugarEvento, setLugarEvento] = useState("");

  // Cerrar con Escape, bloquear el scroll del fondo y enfocar el texto al abrir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    textareaRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  const aceptarArchivo = (tipo: keyof typeof LIMITE_MB, archivo: File, guardar: (f: File) => void) => {
    if (archivo.size > LIMITE_MB[tipo] * 1024 * 1024) {
      setErrorArchivo(`"${archivo.name}" supera el límite de ${LIMITE_MB[tipo]} MB.`);
      return;
    }
    setErrorArchivo(null);
    guardar(archivo);
  };

  const opcionesLlenas = opciones.map((o) => o.trim()).filter(Boolean);
  const enlaceVideoLimpio = enlaceVideo.trim();

  const adjuntoValido = (() => {
    switch (tab) {
      case null:
        return true;
      case "imagen":
        return !!imagen;
      case "video":
        return !!video || (enlaceVideoLimpio !== "" && esUrlValida(enlaceVideoLimpio));
      case "documento":
        return !!documento;
      case "encuesta":
        return pregunta.trim() !== "" && opcionesLlenas.length >= MIN_OPCIONES_ENCUESTA;
      case "evento":
        return tituloEvento.trim() !== "" && fechaEvento !== "" && lugarEvento.trim() !== "";
    }
  })();

  const puedePublicar = texto.trim().length > 0 && adjuntoValido;

  const construirAdjunto = (): AdjuntoPublicacion | undefined => {
    switch (tab) {
      case "imagen":
        return imagen ? { tipo: "imagen", archivo: imagen } : undefined;
      case "video":
        return { tipo: "video", archivo: video, enlace: video ? undefined : enlaceVideoLimpio };
      case "documento":
        return documento ? { tipo: "documento", archivo: documento } : undefined;
      case "encuesta":
        return { tipo: "encuesta", pregunta: pregunta.trim(), opciones: opcionesLlenas, duracion };
      case "evento":
        return { tipo: "evento", titulo: tituloEvento.trim(), fechaHora: fechaEvento, lugar: lugarEvento.trim() };
      default:
        return undefined;
    }
  };

  const publicar = () => {
    if (!puedePublicar) return;
    onSubmit({ texto: texto.trim(), tema, visibilidad, adjunto: construirAdjunto() });
  };

  const insertarHashtag = (tag: string) => {
    setTexto((actual) => {
      if (actual.includes(tag)) return actual;
      const base = actual.trim();
      return `${base ? `${base} ` : ""}${tag} `.slice(0, MAX_CARACTERES);
    });
    textareaRef.current?.focus();
  };

  const cambiarTab = (id: TipoAdjunto) => {
    setErrorArchivo(null);
    setTab((actual) => (actual === id ? null : id));
  };

  const cerca = texto.length > MAX_CARACTERES * 0.9;

  return (
    <div data-sheet-open className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 bg-on-surface/60 backdrop-blur-[4px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="sheet-panel relative w-full max-w-xl h-[94dvh] bg-surface-container-lowest rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="w-full pt-3 pb-2 flex justify-center">
          <div className="w-11 h-1.5 rounded-full bg-outline-variant" />
        </div>

        <header className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-surface-container">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low active:scale-95 transition-all"
          >
            <X className="w-[22px] h-[22px]" />
          </button>
          <div className="text-center">
            <h1 id={tituloId} className="text-headline-sm text-on-surface leading-none">
              Nueva Publicación
            </h1>
            <p className="text-label-md text-secondary mt-1">Comunidad UAQ • Comunidad Universitaria</p>
          </div>
          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-container to-tertiary-container text-on-primary flex items-center justify-center text-label-lg shrink-0 ring-2 ring-primary-fixed">
              {autor.siglas}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-label-lg text-on-surface truncate">{autor.nombre}</span>
                <span className="bg-primary-fixed text-on-primary-fixed text-label-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {autor.etiqueta}
                </span>
              </div>
              <span className="text-body-sm text-secondary truncate">{autor.facultad}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              id="publicacion-tema"
              label="Tema"
              value={tema}
              onChange={(v) => setTema(v as TemaPublicacion)}
              options={TEMAS}
              destacado
            />
            <SelectField
              id="publicacion-visibilidad"
              label="Visibilidad"
              value={visibilidad}
              onChange={(v) => setVisibilidad(v as VisibilidadPublicacion)}
              options={VISIBILIDADES}
            />
          </div>

          <div className="bg-surface-container-low/70 border border-outline-variant rounded-2xl p-3.5 focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <label htmlFor="publicacion-texto" className="sr-only">
              Contenido de la publicación
            </label>
            <textarea
              ref={textareaRef}
              id="publicacion-texto"
              value={texto}
              maxLength={MAX_CARACTERES}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Qué quieres preguntar o compartir hoy en UAQ...? (Ej. ¿Alguien tiene apuntes del Lab de Redes?)"
              className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none resize-none min-h-[96px]"
            />
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60 mt-2 text-label-md">
              <span className="text-outline flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Temas con #hashtag
              </span>
              <span aria-live="polite" className={cerca ? "text-error" : "text-outline"}>
                {texto.length} / {MAX_CARACTERES}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label-lg text-on-surface">Adjuntar contenido</span>
              <span className="text-label-md text-outline font-normal">(opcional)</span>
            </div>
            <div role="group" aria-label="Tipo de adjunto" className="grid grid-cols-5 gap-2">
              {TABS.map(({ id, label, icon: Icon }) => {
                const activo = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => cambiarTab(id)}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl transition-all active:scale-95 ${
                      activo
                        ? "bg-primary-fixed/70 border-2 border-primary text-primary shadow-sm"
                        : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-label-sm normal-case tracking-normal">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {tab && (
            <section aria-label="Contenido adjunto" className="space-y-2">
              {tab === "imagen" && (
                <PanelImagen
                  archivo={imagen}
                  onPick={(f) => aceptarArchivo("imagen", f, setImagen)}
                  onQuitar={() => setImagen(undefined)}
                />
              )}
              {tab === "video" && (
                <PanelVideo
                  archivo={video}
                  enlace={enlaceVideo}
                  onPick={(f) => aceptarArchivo("video", f, setVideo)}
                  onEnlace={setEnlaceVideo}
                  onQuitar={() => setVideo(undefined)}
                />
              )}
              {tab === "documento" && (
                <PanelDocumento
                  archivo={documento}
                  onPick={(f) => aceptarArchivo("documento", f, setDocumento)}
                  onQuitar={() => setDocumento(undefined)}
                />
              )}
              {tab === "encuesta" && (
                <PanelEncuesta
                  pregunta={pregunta}
                  opciones={opciones}
                  duracion={duracion}
                  onPregunta={setPregunta}
                  onOpciones={setOpciones}
                  onDuracion={setDuracion}
                  onQuitar={() => setTab(null)}
                />
              )}
              {tab === "evento" && (
                <PanelEvento
                  titulo={tituloEvento}
                  fechaHora={fechaEvento}
                  lugar={lugarEvento}
                  onTitulo={setTituloEvento}
                  onFechaHora={setFechaEvento}
                  onLugar={setLugarEvento}
                  onQuitar={() => setTab(null)}
                />
              )}
              {errorArchivo && (
                <p role="alert" className="flex items-center gap-1.5 text-body-sm text-on-error-container bg-error-container rounded-xl px-3 py-2">
                  <Upload className="w-4 h-4 shrink-0" />
                  {errorArchivo}
                </p>
              )}
            </section>
          )}

          <div className="space-y-1.5">
            <span className="text-label-md text-on-surface-variant px-1">Temas sugeridos:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {HASHTAGS_SUGERIDOS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertarHashtag(tag)}
                  className="shrink-0 bg-surface-container-low hover:bg-primary-fixed hover:text-primary text-on-surface-variant text-label-lg px-2.5 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="px-5 pt-3 pb-4 space-y-1 border-t border-surface-container bg-surface-container-lowest">
          <button
            type="button"
            onClick={publicar}
            disabled={!puedePublicar}
            className="w-full py-3 bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-body-lg font-bold rounded-xl shadow active:scale-[0.99] transition-all disabled:bg-surface-container-high disabled:text-outline disabled:shadow-none disabled:cursor-not-allowed"
          >
            Publicar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-secondary hover:text-on-surface text-label-lg transition-colors"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
}
