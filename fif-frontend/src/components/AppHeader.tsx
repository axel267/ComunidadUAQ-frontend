"use client";

import { Bell, GraduationCap, User } from "lucide-react";

interface AppHeaderProps {
  subtitle: string;
  onNotificationsClick?: () => void;
}

export function AppHeader({ subtitle, onNotificationsClick }: AppHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-md flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-headline-sm text-primary leading-none">Comunidad UAQ</span>
            <span className="text-label-sm font-inter text-secondary leading-tight mt-0.5">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            aria-label="Notificaciones"
            onClick={onNotificationsClick}
            className="w-touch-target-min h-touch-target-min flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full"
          >
            <Bell className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant">
            <User className="w-[18px] h-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}
