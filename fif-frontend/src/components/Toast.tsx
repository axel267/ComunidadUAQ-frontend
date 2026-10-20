"use client";

import { Info } from "lucide-react";

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full text-label-md font-inter shadow-lg z-50 flex items-center gap-2 transition-all duration-300 ${
        message ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"
      }`}
    >
      <Info className="w-4 h-4 text-tertiary-fixed" />
      <span>{message}</span>
    </div>
  );
}
