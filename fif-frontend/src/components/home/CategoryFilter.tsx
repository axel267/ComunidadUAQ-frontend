"use client";

import { CATEGORIAS_FILTRO, type CategoriaAviso } from "@/data/avisos";

interface CategoryFilterProps {
  active: "all" | CategoriaAviso;
  onChange: (categoria: "all" | CategoriaAviso) => void;
  total: number;
}

export function CategoryFilter({ active, onChange, total }: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="text-label-md font-inter text-secondary uppercase tracking-wider">Filtrar Avisos</span>
        <span className="text-label-sm font-inter text-primary">{total} Comunicados</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-screen-margin-mobile px-screen-margin-mobile">
        {CATEGORIAS_FILTRO.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`shrink-0 px-space-md h-8 rounded-full text-label-md font-inter transition-all flex items-center gap-1 ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-secondary hover:text-on-surface"
              }`}
            >
              {cat.id === "urgente" && <span className="w-2 h-2 rounded-full bg-error" />}
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
