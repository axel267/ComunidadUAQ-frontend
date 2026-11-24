"use client";

import { useCallback, useEffect, useState } from "react";
import { getComunicadoOficialActivo, type ComunicadoOficial } from "@/services/comunicadoOficial";

export function useComunicadoOficial(habilitado: boolean) {
  const [comunicado, setComunicado] = useState<ComunicadoOficial | null>(null);

  const recargar = useCallback(
    () =>
      getComunicadoOficialActivo()
        .then(setComunicado)
        .catch(() => setComunicado(null)),
    []
  );

  useEffect(() => {
    if (!habilitado) return;
    getComunicadoOficialActivo()
      .then(setComunicado)
      .catch(() => setComunicado(null));
  }, [habilitado]);

  return { comunicado, recargar };
}
