"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  getFechasClave,
  createFechaClave,
  updateFechaClave,
  deleteFechaClave,
  type FechaClaveBackend,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { useAppToast } from "@/context/ToastContext";

const MESES_ES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

function formatearFecha(fechaStr: string) {
  const partes = fechaStr.split("T")[0].split("-");
  if (partes.length >= 3) {
    const anio = partes[0];
    const mesIdx = Math.max(0, Math.min(11, parseInt(partes[1], 10) - 1));
    const dia = partes[2].padStart(2, "0");
    return { mes: MESES_ES[mesIdx], dia, anio };
  }
  const d = new Date(fechaStr);
  return {
    mes: MESES_ES[d.getUTCMonth()] || "CAL",
    dia: String(d.getUTCDate()).padStart(2, "0"),
    anio: String(d.getUTCFullYear()),
  };
}

function obtenerEstilosEtiqueta(etiqueta: string) {
  const norm = (etiqueta || "").toLowerCase();
  if (norm.includes("docente")) {
    return {
      casilla: "bg-primary-fixed text-primary",
      etiqueta: "bg-error-container text-on-error-container",
    };
  }
  if (norm.includes("auditorio") || norm.includes("evento")) {
    return {
      casilla: "bg-secondary-container text-secondary",
      etiqueta: "bg-tertiary-fixed text-on-tertiary-fixed",
    };
  }
  if (norm.includes("asueto") || norm.includes("inhábil")) {
    return {
      casilla: "bg-surface-container-high text-on-surface-variant",
      etiqueta: "bg-surface-container-high text-secondary",
    };
  }
  if (norm.includes("trámite") || norm.includes("titulación")) {
    return {
      casilla: "bg-emerald-100 text-emerald-800",
      etiqueta: "bg-emerald-50 text-emerald-700",
    };
  }
  return {
    casilla: "bg-primary-container text-on-primary-container",
    etiqueta: "bg-secondary-container text-secondary",
  };
}

export function UpcomingDates({ onVerTodoClick }: { onVerTodoClick: () => void }) {
  const showToast = useAppToast();
  const [esAdmin, setEsAdmin] = useState(false);

  const [fechas, setFechas] = useState<FechaClaveBackend[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal para agregar / editar fecha (Admin)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaEnEdicion, setFechaEnEdicion] = useState<FechaClaveBackend | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInput, setFechaInput] = useState("");
  const [etiqueta, setEtiqueta] = useState("General");
  const [guardando, setGuardando] = useState(false);

  const cargarFechas = () => {
    getFechasClave()
      .then((data) => setFechas(data))
      .catch((err) => {
        console.error("Error al cargar fechas clave:", err);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    const session = getStoredSession();
    if (session?.user?.rol === "Administrador" || session?.user?.rolId === 1) {
      setEsAdmin(true);
    }
    cargarFechas();
  }, []);

  const abrirModalAgregar = () => {
    setFechaEnEdicion(null);
    setTitulo("");
    setDescripcion("");
    setFechaInput("");
    setEtiqueta("General");
    setModalAbierto(true);
  };

  const abrirModalEditar = (item: FechaClaveBackend) => {
    setFechaEnEdicion(item);
    setTitulo(item.titulo);
    setDescripcion(item.descripcion || "");
    setFechaInput(item.fecha.split("T")[0]);
    setEtiqueta(item.etiqueta || "General");
    setModalAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteFechaClave(id);
      setFechas((prev) => prev.filter((f) => f.id !== id));
      showToast("Fecha clave eliminada", { tipo: "eliminado" });
    } catch {
      showToast("Error al eliminar la fecha clave", { tipo: "error" });
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInput) {
      showToast("El título y la fecha son obligatorios", { tipo: "advertencia" });
      return;
    }

    setGuardando(true);
    try {
      if (fechaEnEdicion) {
        const actualizada = await updateFechaClave(fechaEnEdicion.id, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: fechaInput,
          etiqueta: etiqueta.trim() || "General",
        });

        setFechas((prev) =>
          prev
            .map((f) => (f.id === fechaEnEdicion.id ? actualizada : f))
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
        );
        showToast("Fecha clave actualizada con éxito", { tipo: "exito" });
      } else {
        const nueva = await createFechaClave({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: fechaInput,
          etiqueta: etiqueta.trim() || "General",
        });

        setFechas((prev) =>
          [...prev, nueva].sort((a, b) => a.fecha.localeCompare(b.fecha))
        );
        showToast("Fecha clave agregada al calendario oficial", { tipo: "exito" });
      }

      setModalAbierto(false);
      setFechaEnEdicion(null);
      setTitulo("");
      setDescripcion("");
      setFechaInput("");
      setEtiqueta("General");
    } catch (err: any) {
      showToast(err?.message || "Error al guardar fecha", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="flex flex-col gap-space-sm mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-primary w-[22px] h-[22px]" />
          <h2 className="text-headline-md text-on-surface">Próximas Fechas Clave</h2>
        </div>
        <div className="flex items-center gap-3">
          {esAdmin && (
            <button
              onClick={abrirModalAgregar}
              className="flex items-center gap-1 text-label-sm font-semibold text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar (Admin)</span>
            </button>
          )}
          <button
            onClick={onVerTodoClick}
            className="text-label-md font-inter text-primary hover:underline"
          >
            Ver todo
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
        {cargando && (
          <div className="p-4 text-center text-body-sm text-secondary animate-pulse">
            Cargando fechas del calendario institucional...
          </div>
        )}

        {!cargando && fechas.length === 0 && (
          <div className="p-4 text-center text-body-sm text-secondary">
            No hay fechas programadas en el calendario oficial por ahora.
          </div>
        )}

        {!cargando &&
          fechas.map((item, index) => {
            const fechaFmt = formatearFecha(item.fecha);
            const estilos = obtenerEstilosEtiqueta(item.etiqueta);

            return (
              <div key={item.id} className="contents">
                <div className="flex items-center gap-space-md">
                  <div
                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg shrink-0 ${estilos.casilla}`}
                  >
                    <span className="text-label-sm font-inter font-bold uppercase leading-none">
                      {fechaFmt.mes}
                    </span>
                    <span className="text-headline-lg leading-tight">{fechaFmt.dia}</span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-headline-sm truncate">{item.titulo}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-label-sm font-inter px-2 py-0.5 rounded-full ${estilos.etiqueta}`}
                        >
                          {item.etiqueta}
                        </span>
                        {esAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => abrirModalEditar(item)}
                              className="p-1 rounded text-secondary hover:text-primary transition-colors"
                              title="Editar fecha (Admin)"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminar(item.id)}
                              className="p-1 rounded text-secondary hover:text-error transition-colors"
                              title="Eliminar fecha (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.descripcion && (
                      <p className="text-body-sm text-secondary truncate">{item.descripcion}</p>
                    )}
                  </div>
                </div>
                {index < fechas.length - 1 && (
                  <div className="w-full h-px bg-surface-variant" />
                )}
              </div>
            );
          })}
      </div>

      {/* Modal Agregar / Editar Fecha Clave (Admin) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-title-md font-bold text-on-surface">
                {fechaEnEdicion ? "Editar Fecha Clave" : "Agregar Fecha Clave Oficial"}
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-5 flex flex-col gap-3.5">
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Título del evento o fecha *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Fin de periodo de reinscripciones"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={fechaInput}
                  onChange={(e) => setFechaInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Etiqueta / Categoría
                </label>
                <select
                  value={etiqueta}
                  onChange={(e) => setEtiqueta(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Docentes">Docentes</option>
                  <option value="Académico">Académico</option>
                  <option value="Auditorio">Auditorio / Eventos</option>
                  <option value="Asueto">Asueto / Inhábil</option>
                  <option value="Trámites">Trámites / Titulación</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  Descripción o detalle
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Instrucciones, requisitos o lugar..."
                  className="w-full px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-secondary text-label-md font-medium hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : fechaEnEdicion
                    ? "Guardar cambios"
                    : "Guardar fecha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
