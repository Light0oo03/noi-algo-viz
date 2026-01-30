function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function ensureLeadingSlash(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.DEV ? '/api' : 'https://api.linhaoran.xyz');

export function apiUrl(path: string) {
  const base = trimTrailingSlash(API_BASE_URL);
  const p = ensureLeadingSlash(path);
  return base ? `${base}${p}` : p;
}

