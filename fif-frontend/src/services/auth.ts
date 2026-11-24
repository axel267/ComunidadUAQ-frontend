export const getApiBaseUrl = (): string => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const API_URL = {
  toString: () => getApiBaseUrl(),
  valueOf: () => getApiBaseUrl(),
} as unknown as string;

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  expediente?: number;
  rol: string;
  rolId?: number;
  area?: string;
  carrera?: string;
  semestre?: string;
  campus?: string;
  biografia?: string;
  telefono?: string;
  intereses?: string[];
  facultades?: { id: number; nombre: string; abreviatura: string }[];
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export const AUTH_CHANGE_EVENT = 'uaqnecta-auth-change';

function notifyAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

async function parseJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || fallbackError;
    throw new AuthApiError(message, res.status);
  }
  return res.json();
}

export const persistSession = (session: AuthSession): void => {
  if (typeof window === 'undefined' || !session.accessToken || !session.user) return;
  localStorage.setItem('auth_token', session.accessToken);
  localStorage.setItem('auth_user', JSON.stringify(session.user));
  notifyAuthChange();
};

export const login = async (credentials: {
  email: string;
  password: string;
  rememberDevice?: boolean;
}): Promise<AuthSession> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const session = await parseJsonResponse<AuthSession>(res, 'Credenciales inválidas o cuenta no activa.');

  if (session.accessToken && session.user) {
    persistSession(session);
  }

  return session;
};

export const getStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('auth_user');
  if (!token || !userJson) return null;
  if (isTokenExpired(token)) {
    logout();
    return null;
  }
  try {
    const user = JSON.parse(userJson) as AuthUser;
    if (!user || typeof user !== 'object') return null;
    return {
      accessToken: token,
      user,
    };
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  if (isTokenExpired(token)) {
    logout();
    return null;
  }
  return token;
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('fif_session');
  notifyAuthChange();
};

export interface ActivateAccountPayload {
  nombre?: string;
  expediente: string | number;
  carrera?: string;
  facultadId?: number;
  semestre?: string;
  campus?: string;
  biografia?: string;
  telefono?: string;
  intereses?: string[];
  email: string;
}

export interface ActivateAccountResponse {
  message: string;
  user: AuthUser;
}

export const activateAccount = async (
  payload: ActivateAccountPayload
): Promise<ActivateAccountResponse> => {
  const res = await fetch(`${API_URL}/auth/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<ActivateAccountResponse>(res, 'No se pudo activar la cuenta. Verifica tus datos.');
};

export const verifyActivationCode = async (
  email: string,
  code: string
): Promise<AuthSession> => {
  const res = await fetch(`${API_URL}/auth/activate/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  return parseJsonResponse(res, 'El código ingresado es incorrecto o ha expirado.');
};

export const resendActivationCode = async (email: string): Promise<void> => {
  const res = await fetch(`${API_URL}/auth/activate/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('No se pudo reenviar el código.');
};

export interface CambiarContrasenaPayload {
  userId: number;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export const cambiarContrasenaApi = async (
  payload: CambiarContrasenaPayload
): Promise<{ ok: boolean; message?: string }> => {
  const res = await fetch(`${API_URL}/auth/cambiar-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res, 'No se pudo cambiar la contrasena.');
};

export interface UpdateProfilePayload {
  userId: number;
  nombre?: string;
  carrera?: string;
  semestre?: string;
  campus?: string;
  biografia?: string;
  telefono?: string;
  intereses?: string[];
}

export const updateProfileApi = async (
  payload: UpdateProfilePayload
): Promise<{ message: string; user: AuthUser }> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/sessions/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res, 'No se pudo actualizar el perfil.');
};

export const getUserApi = async (userId: number): Promise<AuthUser> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/sessions/user/${userId}`, {
    method: 'GET',
    headers,
  });
  return parseJsonResponse(res, 'No se pudo obtener la informacion del usuario.');
};


