type D1Database = any;

type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_DAYS?: string;
  ALLOWED_ORIGINS?: string;
};

function json(value: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isEmailLike(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  const b64 = btoa(s);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(s: string) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSign(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlEncode(sig);
}

async function jwtSign(env: Env, payload: Record<string, unknown>) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresInDays = Number(env.JWT_EXPIRES_IN_DAYS ?? '7');
  const exp = nowSec + Math.max(1, Math.floor(expiresInDays * 86400));
  const body = { ...payload, iat: nowSec, exp };
  const headB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const bodyB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(body)));
  const msg = `${headB64}.${bodyB64}`;
  const sig = await hmacSign(env.JWT_SECRET, msg);
  return `${msg}.${sig}`;
}

async function jwtVerify(env: Env, token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headB64, bodyB64, sig] = parts;
  const msg = `${headB64}.${bodyB64}`;
  const expect = await hmacSign(env.JWT_SECRET, msg);
  if (sig !== expect) return null;
  const bodyText = new TextDecoder().decode(base64UrlDecodeToBytes(bodyB64));
  const payload = JSON.parse(bodyText) as any;
  const exp = Number(payload?.exp ?? 0);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(exp) || exp <= nowSec) return null;
  return payload;
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string) {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]*$/.test(clean) || clean.length % 2 !== 0) return null;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function pbkdf2Hash(password: string, salt: Uint8Array, iterations: number) {
  const saltArrayBuffer = new Uint8Array(salt).buffer;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltArrayBuffer, iterations },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 150_000;
  const hashHex = await pbkdf2Hash(password, salt, iterations);
  return { saltHex: bytesToHex(salt), iterations, hashHex };
}

async function verifyPassword(password: string, saltHex: string, iterations: number, hashHex: string) {
  const salt = hexToBytes(saltHex);
  if (!salt) return false;
  const got = await pbkdf2Hash(password, salt, iterations);
  if (got.length !== hashHex.length) return false;
  let ok = 0;
  for (let i = 0; i < got.length; i++) ok |= got.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return ok === 0;
}

function parseAllowedOrigins(env: Env) {
  const raw = env.ALLOWED_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [
    'https://algo.linhaoran.xyz',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
}

function corsHeaders(origin: string | null, allowed: string[]) {
  if (!origin) return {} as Record<string, string>;
  if (!allowed.includes(origin)) return {} as Record<string, string>;
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-max-age': '86400',
    'vary': 'origin',
  } as Record<string, string>;
}

function getBearerToken(req: Request) {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isGraph(value: unknown): value is { nodes: { id: number; x: number; y: number }[]; edges: { u: number; v: number; w: number }[] } {
  if (!value || typeof value !== 'object') return false;
  const g = value as any;
  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return false;
  for (const n of g.nodes) {
    if (!n || typeof n !== 'object') return false;
    if (!isFiniteNumber(n.id) || !isFiniteNumber(n.x) || !isFiniteNumber(n.y)) return false;
  }
  for (const e of g.edges) {
    if (!e || typeof e !== 'object') return false;
    if (!isFiniteNumber(e.u) || !isFiniteNumber(e.v) || !isFiniteNumber(e.w)) return false;
  }
  return true;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    const allowed = parseAllowedOrigins(env);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true }, { headers: cors });
    }

    if (url.pathname === '/auth/register' && request.method === 'POST') {
      const body = await request.json().catch(() => null) as any;
      const emailRaw = body?.email;
      const password = body?.password;
      if (!isString(emailRaw) || !isString(password)) {
        return json({ message: 'invalid_payload' }, { status: 400, headers: cors });
      }
      const email = normalizeEmail(emailRaw);
      if (!isEmailLike(email)) {
        return json({ message: 'invalid_email' }, { status: 400, headers: cors });
      }
      if (password.length < 8) {
        return json({ message: 'password_too_short' }, { status: 400, headers: cors });
      }

      const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first();
      if ((exists as any)?.id) {
        return json({ message: 'email_already_registered' }, { status: 400, headers: cors });
      }

      const { saltHex, iterations, hashHex } = await hashPassword(password);
      const userId = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, password_salt, password_iter, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(userId, email, hashHex, saltHex, iterations, now, now)
        .run();
      return json({ ok: true, user: { id: userId, email, createdAt: now, updatedAt: now } }, { headers: cors });
    }

    if (url.pathname === '/auth/login' && request.method === 'POST') {
      const body = await request.json().catch(() => null) as any;
      const emailRaw = body?.email;
      const password = body?.password;
      if (!isString(emailRaw) || !isString(password)) {
        return json({ message: 'invalid_payload' }, { status: 400, headers: cors });
      }
      const email = normalizeEmail(emailRaw);
      if (!isEmailLike(email)) {
        return json({ message: 'invalid_credentials' }, { status: 401, headers: cors });
      }

      const row = await env.DB.prepare(
        'SELECT id, email, password_hash, password_salt, password_iter, created_at, updated_at FROM users WHERE email = ?'
      )
        .bind(email)
        .first();
      if (!(row as any)?.id) {
        return json({ message: 'invalid_credentials' }, { status: 401, headers: cors });
      }

      const ok = await verifyPassword(
        password,
        String((row as any).password_salt),
        Number((row as any).password_iter),
        String((row as any).password_hash)
      );
      if (!ok) {
        return json({ message: 'invalid_credentials' }, { status: 401, headers: cors });
      }

      const token = await jwtSign(env, { sub: String((row as any).id) });
      return json(
        {
          token,
          user: {
            id: String((row as any).id),
            email: String((row as any).email),
            createdAt: String((row as any).created_at),
            updatedAt: String((row as any).updated_at),
          },
        },
        { headers: cors }
      );
    }

    if (url.pathname === '/auth/me' && request.method === 'GET') {
      const token = getBearerToken(request);
      if (!token) {
        return json({ message: 'missing_authorization' }, { status: 401, headers: cors });
      }
      const payload = await jwtVerify(env, token);
      if (!payload?.sub) {
        return json({ message: 'invalid_token' }, { status: 401, headers: cors });
      }
      const userId = String(payload.sub);
      const row = await env.DB.prepare('SELECT id, email, created_at, updated_at FROM users WHERE id = ?')
        .bind(userId)
        .first();
      return json(
        {
          ok: true,
          user: row
            ? {
              id: (row as any).id,
              email: (row as any).email,
              createdAt: (row as any).created_at,
              updatedAt: (row as any).updated_at,
            }
            : null,
        },
        { headers: cors }
      );
    }

    if (url.pathname === '/graph' && request.method === 'GET') {
      const token = getBearerToken(request);
      if (!token) {
        return json({ message: 'missing_authorization' }, { status: 401, headers: cors });
      }
      const payload = await jwtVerify(env, token);
      if (!payload?.sub) {
        return json({ message: 'invalid_token' }, { status: 401, headers: cors });
      }
      const userId = String(payload.sub);
      const row = await env.DB.prepare('SELECT graph_json FROM user_graphs WHERE user_id = ?')
        .bind(userId)
        .first();
      const graph = (row as any)?.graph_json ? JSON.parse(String((row as any).graph_json)) : null;
      return json({ graph }, { headers: cors });
    }

    if (url.pathname === '/graph' && request.method === 'POST') {
      const token = getBearerToken(request);
      if (!token) {
        return json({ message: 'missing_authorization' }, { status: 401, headers: cors });
      }
      const payload = await jwtVerify(env, token);
      if (!payload?.sub) {
        return json({ message: 'invalid_token' }, { status: 401, headers: cors });
      }
      const userId = String(payload.sub);
      const body = await request.json().catch(() => null) as any;
      const graph = body?.graph;
      if (!isGraph(graph)) {
        return json({ ok: false, reason: 'invalid_graph' }, { status: 400, headers: cors });
      }
      const graphJson = JSON.stringify(graph);
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO user_graphs (user_id, graph_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET graph_json = excluded.graph_json, updated_at = excluded.updated_at'
      )
        .bind(userId, graphJson, now)
        .run();
      return json({ ok: true }, { headers: cors });
    }

    return json({ message: 'not_found' }, { status: 404, headers: cors });
  },
};
