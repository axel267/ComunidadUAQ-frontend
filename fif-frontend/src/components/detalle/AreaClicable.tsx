"use client";

import type { KeyboardEvent, ReactNode } from "react";

interface AreaClicableProps {
  onActivar: () => void;
  etiqueta: string;
  className?: string;
  children: ReactNode;
}

export function AreaClicable({ onActivar, etiqueta, className = "", children }: AreaClicableProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivar();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      title={etiqueta}
      onClick={onActivar}
      onKeyDown={onKeyDown}
      className={`cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-primary ${className}`}
    >
      {children}
    </div>
  );
}
