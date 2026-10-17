"use client";

import { useEffect, useState } from 'react';
import { getFacultades, createFacultade, deleteFacultade, Facultade } from '../../services/api';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';

export default function FacultadesPage() {
  const [facultades, setFacultades] = useState<Facultade[]>([]);
  const [nombre, setNombre] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Proporciona a la IA la lista visible en pantalla en tiempo real
  useCopilotReadable({
    description: "Lista actual de facultades mostradas en la pantalla del usuario",
    value: facultades,
  });

  // Permite que la IA pueda registrar facultades si el usuario se lo pide
  useCopilotAction({
    name: "crearNuevaFacultad",
    description: "Crea y registra una nueva facultad en la plataforma Comunidad UAQ",
    parameters: [
      { name: "nombre", type: "string", description: "Nombre completo de la facultad", required: true },
      { name: "abreviatura", type: "string", description: "Siglas o abreviatura (ej. FIF, FI, FM)", required: true },
    ],
    render: ({ status, args }) => (
      <div className="p-2 my-1 text-xs bg-emerald-950/70 border border-emerald-700/60 rounded-lg text-emerald-200 flex items-center gap-2">
        <span>➕</span>
        <span>{status === "complete" ? `Facultad '${args.nombre}' creada con éxito.` : `Creando facultad '${args.nombre}'...`}</span>
      </div>
    ),
    handler: async ({ nombre, abreviatura }) => {
      try {
        await createFacultade({ nombre, abreviatura });
        await loadFacultades();
        return `Facultad '${nombre}' (${abreviatura}) creada exitosamente en la plataforma.`;
      } catch (err: any) {
        return `Error al crear la facultad: ${err?.message || err}`;
      }
    },
  });

  useEffect(() => {
    loadFacultades();
  }, []);

  const loadFacultades = async () => {
    try {
      setLoading(true);
      const data = await getFacultades();
      setFacultades(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar facultades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !abreviatura.trim()) return;
    
    try {
      await createFacultade({ nombre, abreviatura });
      setNombre('');
      setAbreviatura('');
      loadFacultades();
    } catch (err: any) {
      setError(err.message || 'Error al crear facultad');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFacultade(id);
      loadFacultades();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar facultad');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Gestión de Facultades
          </h1>
          <p className="text-slate-400">Administra las facultades disponibles en la plataforma.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-[350px_1fr] gap-8">
          
          {/* Formulario */}
          <div className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-xl self-start sticky top-8">
            <h2 className="text-xl font-semibold mb-6">Nueva Facultad</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nombre</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="Ej. Informática"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Abreviatura</label>
                <input 
                  type="text" 
                  value={abreviatura}
                  onChange={(e) => setAbreviatura(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="Ej. FIF"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
              >
                Crear Facultad
              </button>
            </form>
          </div>

          {/* Lista de Facultades */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              Facultades Registradas
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                {facultades.length}
              </span>
            </h2>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                ))}
              </div>
            ) : facultades.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-700/50 border-dashed">
                No hay facultades registradas aún.
              </div>
            ) : (
              <div className="grid gap-4">
                {facultades.map((fac) => (
                  <div 
                    key={fac.id} 
                    className="group p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-lg text-slate-200">{fac.nombre}</h3>
                      <p className="text-sm text-slate-400 mt-1">ID: {fac.id} • {fac.abreviatura}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(fac.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
