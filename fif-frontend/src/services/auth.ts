const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  expediente?: number;
  rol: string;
  rolId?: number;
  area?: string;
  carrera?: string;
  facultades?: { id: number; nombre: string; abreviatura: string }[];
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

async function parseJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || fallbackError;
    throw new Error(message);
  }
  return res.json();
}

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

  if (typeof window !== 'undefined' && session.accessToken) {
    localStorage.setItem('auth_token', session.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(session.user));
  }

  return session;
};

export const getStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('auth_user');
  if (!token || !userJson) return null;
  try {
    return {
      accessToken: token,
      user: JSON.parse(userJson),
    };
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export interface ActivateAccountPayload {
  expediente: string;
  carrera: string;
  email: string;
  password: string;
}

export const activateAccount = async (
  payload: ActivateAccountPayload
): Promise<{ email: string }> => {
  const res = await fetch(`${API_URL}/auth/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res, 'No se pudo validar el expediente. Verifica tus datos.');
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
