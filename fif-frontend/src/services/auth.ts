// Endpoints asumidos siguiendo el patrón REST de NestJS descrito en el documento de arquitectura (RF01).
// Ajustar las rutas en cuanto se comparta el contrato real (Swagger/Postman) del backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'docente' | 'coordinacion' | 'administrador';
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

async function parseJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || fallbackError);
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
    body: JSON.stringify(credentials),
  });
  return parseJsonResponse(res, 'Credenciales inválidas o cuenta no activa.');
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
