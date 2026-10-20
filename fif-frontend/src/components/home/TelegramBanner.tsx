"use client";

import { MailWarning } from "lucide-react";

export function TelegramBanner({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
      <div className="flex items-center gap-space-sm">
        <MailWarning className="text-primary w-7 h-7" />
        <div className="flex flex-col">
          <span className="text-headline-sm">Canal Oficial Telegram</span>
          <span className="text-body-sm text-secondary">Recibe alertas urgentes al instante</span>
        </div>
      </div>
      <button
        onClick={onJoinClick}
        className="h-10 px-4 rounded-lg bg-primary text-on-primary text-label-md font-inter shadow-sm active:scale-95 transition-transform"
      >
        Unirse
      </button>
    </div>
  );
}
