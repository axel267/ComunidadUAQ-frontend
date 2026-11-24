"use client";

import { useMemo } from "react";
import { generarMatrizQr } from "@/utils/qrGenerator";

interface CodigoQrRealProps {
  valor: string;
  className?: string;
  etiquetaAria?: string;
}

export function CodigoQrReal({
  valor,
  className,
  etiquetaAria = "Codigo QR de credencial universitaria",
}: CodigoQrRealProps) {
  const matriz = useMemo(() => generarMatrizQr(valor), [valor]);
  const margen = 2;
  const total = matriz.length + margen * 2;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={etiquetaAria}
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      {matriz.map((fila, y) =>
        fila.map((activo, x) =>
          activo ? (
            <rect
              key={`${y}-${x}`}
              x={x + margen}
              y={y + margen}
              width={1}
              height={1}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
}
