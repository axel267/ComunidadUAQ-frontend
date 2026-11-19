"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppBottomNav } from "@/components/AppBottomNav";
import {
  getGuiasTramites,
  getFacultades,
  createGuiaTramite,
  updateGuiaTramite,
  deleteGuiaTramite,
  type GuiaTramite,
  type Facultade,
} from "@/services/api";
import { getStoredSession } from "@/services/auth";
import { useAppToast } from "@/context/ToastContext";

interface PasoForm {
  tituloPaso: string;
  descripcionDetallada: string;
}

export default function TramitesPage() {
  const showToast = useAppToast();
  const session = getStoredSession();
  const esAdmin = session?.user?.rol === "Administrador" || session?.user?.rolId === 1;

  const [guias, setGuias] = useState<GuiaTramite[]>([]);
  const [facultades, setFacultades] = useState<Facultade[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [facultadFiltro, setFacultadFiltro] = useState<number | "todas">("todas");
  const [guiaExpandida, setGuiaExpandida] = useState<number | null>(null);

  // Estado para crear / editar guía (Admin)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guiaEnEdicion, setGuiaEnEdicion] = useState<GuiaTramite | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [facultadId, setFacultadId] = useState(1);
  const [pasos, setPasos] = useState<PasoForm[]>([
    { tituloPaso: "", descripcionDetallada: "" },
  ]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([getGuiasTramites(), getFacultades().catch(() => [])])
      .then(([datosGuias, datosFacultades]) => {
        setGuias(datosGuias);
        setFacultades(datosFacultades);
        if (datosGuias.length > 0) {
          setGuiaExpandida(datosGuias[0].id);
        }
      })
      .catch((err) => {
        console.error("Error al cargar datos de trámites:", err);
      })
      .finally(() => setCargando(false));
  }, []);

  const guiasFiltradas = guias.filter((g) => {
    const coincideFacultad =
      facultadFiltro === "todas" ||
      g.facultadId === facultadFiltro ||
      g.facultad?.id === facultadFiltro;

    const texto = `${g.titulo} ${g.descripcion} ${g.facultad?.nombre || ""} ${g.facultad?.abreviatura || ""}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    return coincideFacultad && coincideBusqueda;
  });

  const toggleGuia = (id: number) => {
    setGuiaExpandida((actual) => (actual === id ? null : id));
  };

  const abrirModalCrear = () => {
    setGuiaEnEdicion(null);
    setTitulo("");
    setDescripcion("");
    setFacultadId(facultades[0]?.id || 1);
    setPasos([{ tituloPaso: "", descripcionDetallada: "" }]);
    setModalAbierto(true);
  };

  const abrirModalEditar = (guia: GuiaTramite) => {
    setGuiaEnEdicion(guia);
    setTitulo(guia.titulo);
    setDescripcion(guia.descripcion || "");
    setFacultadId(guia.facultadId || 1);

    const pasosExistentes = (guia.pasos || [])
      .slice()
      .sort((a, b) => a.ordenPaso - b.ordenPaso)
      .map((p) => ({
        tituloPaso: p.tituloPaso || "",
        descripcionDetallada: p.descripcionDetallada || "",
      }));

    setPasos(
      pasosExistentes.length > 0
        ? pasosExistentes
        : [{ tituloPaso: "", descripcionDetallada: "" }]
    );
    setModalAbierto(true);
  };

  const handleEliminarGuia = async (id: number) => {
    try {
      await deleteGuiaTramite(id);
      setGuias((prev) => prev.filter((g) => g.id !== id));
      showToast("Guía de trámite eliminada con éxito", { tipo: "eliminado" });
    } catch {
      showToast("Error al eliminar la guía de trámite", { tipo: "error" });
    }
  };

  const agregarPaso = () => {
    setPasos((prev) => [...prev, { tituloPaso: "", descripcionDetallada: "" }]);
  };

  const quitarPaso = (index: number) => {
    setPasos((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarPaso = (index: number, campo: keyof PasoForm, valor: string) => {
    setPasos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p))
    );
  };

  const handleGuardarGuia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      showToast("El título del trámite es obligatorio", { tipo: "advertencia" });
      return;
    }

    setGuardando(true);
    try {
      const pasosValidos = pasos
        .filter((p) => p.tituloPaso.trim() || p.descripcionDetallada.trim())
        .map((p, idx) => ({
          ordenPaso: idx + 1,
          tituloPaso: p.tituloPaso.trim() || `Paso ${idx + 1}`,
          descripcionDetallada: p.descripcionDetallada.trim(),
        }));

      if (guiaEnEdicion) {
        const actualizada = await updateGuiaTramite(guiaEnEdicion.id, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          facultadId: Number(facultadId),
          pasos: pasosValidos,
        });

        setGuias((prev) =>
          prev.map((g) => (g.id === guiaEnEdicion.id ? actualizada : g))
        );
        showToast("Guía de trámite actualizada con éxito", { tipo: "exito" });
      } else {
        const nueva = await createGuiaTramite({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          facultadId: Number(facultadId),
          pasos: pasosValidos,
        });

        setGuias((prev) => [nueva, ...prev]);
        setGuiaExpandida(nueva.id);
        showToast("Guía de trámite creada exitosamente", { tipo: "exito" });
      }

      setModalAbierto(false);
      setGuiaEnEdicion(null);
      setTitulo("");
      setDescripcion("");
      setPasos([{ tituloPaso: "", descripcionDetallada: "" }]);
    } catch (err: any) {
      showToast(err?.message || "Error al guardar la guía", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-surface">
      <AppHeader subtitle="Trámites" />

      <main className="flex flex-col w-full max-w-4xl mx-auto pt-20 pb-28 px-screen-margin-mobile gap-space-md">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h1 className="text-headline-md font-bold text-on-surface">Guías de Trámites</h1>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Requisitos y paso a paso oficial de titulación, servicio social y trámites escolares.
            </p>
          </div>

          {esAdmin && (
            <button
              onClick={abrirModalCrear}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary/90 transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Guía (Admin)</span>
            </button>
          )}
        </header>

        {/* Buscador de trámites */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar trámite por nombre o facultad..."
            className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
          />
        </div>

        {/* Filtro por Facultad */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setFacultadFiltro("todas")}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-label-sm font-medium transition-all active:scale-95 ${
              facultadFiltro === "todas"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/60"
            }`}
          >
            Todas ({guias.length})
          </button>

          {facultades.map((f) => {
            const conteo = guias.filter(
              (g) => g.facultadId === f.id || g.facultad?.id === f.id
            ).length;
            const activo = facultadFiltro === f.id;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFacultadFiltro(f.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-label-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 ${
                  activo
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-outline-variant/60"
                }`}
              >
                <span>{f.abreviatura}</span>
                {conteo > 0 && (
                  <span
                    className={`text-label-xs px-1.5 py-0.2 rounded-full ${
                      activo
                        ? "bg-on-primary/20 text-on-primary"
                        : "bg-surface-container-highest text-secondary"
                    }`}
                  >
                    {conteo}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {cargando && (
          <div className="p-8 text-center text-slate-500 bg-surface-container-lowest rounded-xl border border-slate-200 animate-pulse">
            Cargando guías y procedimientos institucionales...
          </div>
        )}

        {!cargando && guiasFiltradas.length === 0 && (
          <div className="p-12 text-center text-secondary bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant flex flex-col items-center gap-2">
            <BookOpen className="w-10 h-10 text-outline" />
            <span className="text-body-md">
              No se encontraron guías para los filtros seleccionados.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!cargando &&
            guiasFiltradas.map((guia) => {
              const estaAbierta = guiaExpandida === guia.id;
              const pasosOrdenados = [...(guia.pasos || [])].sort((a, b) => a.ordenPaso - b.ordenPaso);

              return (
                <article
                  key={guia.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleGuia(guia.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {guia.facultad && (
                          <span className="px-2.5 py-0.5 rounded-full text-label-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                            {guia.facultad.abreviatura}
                          </span>
                        )}
                        <span className="text-label-xs text-secondary font-medium flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {pasosOrdenados.length} {pasosOrdenados.length === 1 ? "paso" : "pasos"}
                        </span>
                      </div>
                      <h2 className="text-title-lg font-bold text-on-surface leading-snug">
                        {guia.titulo}
                      </h2>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">
                        {guia.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      {esAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalEditar(guia);
                            }}
                            className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors"
                            title="Editar trámite (Admin)"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarGuia(guia.id);
                            }}
                            className="p-2 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors"
                            title="Eliminar trámite (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <div className="p-2 rounded-lg bg-surface-container text-secondary">
                        {estaAbierta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {estaAbierta && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-outline-variant/40 flex flex-col gap-4 bg-surface-container-low/20">
                      <div className="flex items-center gap-2 pt-2">
                        <FileCheck2 className="w-5 h-5 text-primary" />
                        <h3 className="text-label-lg font-bold text-on-surface">Paso a paso oficial:</h3>
                      </div>

                      <div className="flex flex-col gap-3">
                        {pasosOrdenados.map((paso) => (
                          <div
                            key={paso.id}
                            className="bg-surface rounded-xl p-4 border border-outline-variant/50 shadow-xs flex items-start gap-3.5"
                          >
                            <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {paso.ordenPaso}
                            </span>
                            <div className="flex flex-col gap-1 min-w-0">
                              <h4 className="text-body-md font-semibold text-on-surface">
                                {paso.tituloPaso}
                              </h4>
                              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                {paso.descripcionDetallada}
                              </p>
                              {paso.imagenIlustrativaUrl && (
                                <div className="mt-2 rounded-lg overflow-hidden max-h-48 border border-outline-variant/40">
                                  <img
                                    src={paso.imagenIlustrativaUrl}
                                    alt={paso.tituloPaso}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      </main>

      {/* Modal Crear / Editar Guía (Admin) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-outline-variant max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-title-lg font-bold text-on-surface">
                {guiaEnEdicion ? "Editar Guía de Trámite" : "Nueva Guía de Trámite"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarGuia} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Título del trámite *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Proceso de Titulación por Diplomado"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Descripción general
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles y requisitos previos..."
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface block mb-1">
                  Facultad
                </label>
                <select
                  value={facultadId}
                  onChange={(e) => setFacultadId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {facultades.length > 0 ? (
                    facultades.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre} ({f.abreviatura})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>Facultad de Informática (FIF)</option>
                      <option value={2}>Facultad de Ingeniería (FI)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-2 border-t border-outline-variant flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-md font-bold text-on-surface">Pasos del proceso</span>
                  <button
                    type="button"
                    onClick={agregarPaso}
                    className="text-label-sm font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar paso</span>
                  </button>
                </div>

                {pasos.map((paso, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col gap-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm font-bold text-primary">Paso {idx + 1}</span>
                      {pasos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarPaso(idx)}
                          className="text-error hover:opacity-80 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={paso.tituloPaso}
                      onChange={(e) => actualizarPaso(idx, "tituloPaso", e.target.value)}
                      placeholder="Título del paso (ej. Pago de arancel)"
                      className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant text-body-sm text-on-surface"
                    />
                    <textarea
                      rows={2}
                      value={paso.descripcionDetallada}
                      onChange={(e) => actualizarPaso(idx, "descripcionDetallada", e.target.value)}
                      placeholder="Instrucciones detalladas del paso..."
                      className="w-full px-3 py-1.5 bg-surface rounded-lg border border-outline-variant text-body-sm text-on-surface"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-secondary font-medium hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {guardando
                    ? "Guardando..."
                    : guiaEnEdicion
                    ? "Guardar cambios"
                    : "Guardar trámite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppBottomNav />
    </div>
  );
}
