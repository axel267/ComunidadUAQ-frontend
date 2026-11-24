"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  getStoredSession,
  logout as clearStoredSession,
  type AuthSession,
  type AuthUser,
} from "@/services/auth";

const PUBLIC_ROUTES = ["/login", "/activar-cuenta"];
const AUTH_LOADING_SENTINEL = "__AUTH_LOADING__";

function subscribeToAuth(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function getClientAuthSnapshot(): string | null {
  const session = getStoredSession();
  return session ? JSON.stringify(session) : null;
}

function getServerAuthSnapshot(): string {
  return AUTH_LOADING_SENTINEL;
}

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getClientAuthSnapshot,
    getServerAuthSnapshot
  );

  const isLoadingAuth = rawSnapshot === AUTH_LOADING_SENTINEL;

  const session = useMemo<AuthSession | null>(() => {
    if (isLoadingAuth || !rawSnapshot) return null;
    try {
      return JSON.parse(rawSnapshot) as AuthSession;
    } catch {
      return null;
    }
  }, [isLoadingAuth, rawSnapshot]);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!session && !isPublicRoute) {
      router.replace("/login");
    } else if (session && pathname === "/login") {
      router.replace("/");
    }
  }, [isLoadingAuth, isPublicRoute, pathname, router, session]);

  const cerrarSesion = useCallback(() => {
    clearStoredSession();
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoadingAuth,
      isAuthenticated: Boolean(session?.accessToken && session?.user),
      cerrarSesion,
    }),
    [session, isLoadingAuth, cerrarSesion]
  );

  const shouldBlockProtectedRoute = !isPublicRoute && (isLoadingAuth || !session);

  return (
    <AuthContext.Provider value={value}>
      {shouldBlockProtectedRoute ? (
        <main className="min-h-screen bg-surface" aria-label="Verificando sesión" />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AppProviders>.");
  return ctx;
}
