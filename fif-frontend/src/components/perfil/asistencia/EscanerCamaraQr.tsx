"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, CameraOff, ImageUp } from "lucide-react";

interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<{ rawValue?: string }[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

interface EscanerCamaraQrProps {
  onDetectado: (codigo: string) => void;
}

export function EscanerCamaraQr({ onDetectado }: EscanerCamaraQrProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ultimoCodigoRef = useRef<string>("");
  const [activa, setActiva] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActiva(false);
  }, []);

  useEffect(() => {
    return () => detenerCamara();
  }, [detenerCamara]);

  const iniciarCamara = async () => {
    setMensaje(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMensaje("El navegador no permite acceso directo a camara en HTTP. Usa imagen de QR o ingresa el expediente.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setActiva(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setMensaje("No se pudo abrir la camara. Puedes subir captura del QR o escanear/escribir el expediente.");
    }
  };

  useEffect(() => {
    if (!activa) return;
    const Detector = typeof window !== "undefined" ? window.BarcodeDetector : undefined;
    if (!Detector) {
      setMensaje("Camara activa. Si tu navegador no tiene BarcodeDetector nativo, sube imagen o ingresa el codigo.");
      return;
    }
    const detector = new Detector({ formats: ["qr_code"] });
    let cancelado = false;

    const escanearFrame = async () => {
      if (cancelado || !videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codigos = await detector.detect(videoRef.current);
        const valor = codigos[0]?.rawValue?.trim();
        if (valor && valor !== ultimoCodigoRef.current) {
          ultimoCodigoRef.current = valor;
          onDetectado(valor);
          setTimeout(() => {
            ultimoCodigoRef.current = "";
          }, 2500);
        }
      } catch {}
    };

    const timer = window.setInterval(escanearFrame, 450);
    return () => {
      cancelado = true;
      window.clearInterval(timer);
    };
  }, [activa, onDetectado]);

  const escanearImagen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMensaje(null);

    const Detector = typeof window !== "undefined" ? window.BarcodeDetector : undefined;
    if (!Detector) {
      setMensaje("Este navegador no soporta lectura de QR desde archivo. Pega el codigo QR o el expediente abajo.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new Detector({ formats: ["qr_code"] });
      const res = await detector.detect(bitmap);
      const valor = res[0]?.rawValue?.trim();
      if (valor) {
        onDetectado(valor);
      } else {
        setMensaje("No se detecto un codigo QR valido en la imagen seleccionada.");
      }
    } catch {
      setMensaje("Error al procesar la imagen del codigo QR.");
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-label-md text-on-surface font-semibold">Lector de Codigo QR</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={activa ? detenerCamara : iniciarCamara}
            className={`h-8 px-3 rounded-lg text-label-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activa
                ? "bg-error-container text-on-error-container"
                : "bg-primary text-on-primary"
            }`}
          >
            {activa ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{activa ? "Detener camara" : "Activar camara"}</span>
          </button>

          <label className="h-8 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-label-sm text-on-surface flex items-center gap-1.5 cursor-pointer hover:bg-surface-container">
            <ImageUp className="w-4 h-4 text-primary" />
            <span>Escanear imagen QR</span>
            <input type="file" accept="image/*" onChange={escanearImagen} className="hidden" />
          </label>
        </div>
      </div>

      {activa && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <div className="absolute inset-6 border-2 border-primary-fixed/80 rounded-xl pointer-events-none" />
        </div>
      )}

      {mensaje && <p className="text-body-sm text-secondary">{mensaje}</p>}
    </div>
  );
}
