"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, MessagesSquare, Plus } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Anuncios", icon: Megaphone },
  { href: "/comunidad", label: "Comunidad", icon: MessagesSquare },
] as const;

export function AppBottomNav({ onPublishClick }: { onPublishClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex justify-around items-center h-16 px-space-md max-w-lg mx-auto">
        <Link
          href={NAV_ITEMS[0].href}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-16 h-touch-target-min transition-all ${
            pathname === NAV_ITEMS[0].href ? "text-primary font-bold" : "text-secondary hover:text-primary"
          }`}
        >
          <Megaphone className="w-6 h-6" />
          <span className="text-label-sm font-inter">{NAV_ITEMS[0].label}</span>
        </Link>

        <button
          onClick={onPublishClick}
          className="flex flex-col items-center justify-center gap-0.5 min-w-16 h-touch-target-min text-secondary hover:text-primary transition-all active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-label-sm font-inter">Publicar</span>
        </button>

        <Link
          href={NAV_ITEMS[1].href}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-16 h-touch-target-min transition-all ${
            pathname === NAV_ITEMS[1].href ? "text-primary font-bold" : "text-secondary hover:text-primary"
          }`}
        >
          <MessagesSquare className="w-6 h-6" />
          <span className="text-label-sm font-inter">{NAV_ITEMS[1].label}</span>
        </Link>
      </div>
    </nav>
  );
}
