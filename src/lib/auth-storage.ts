const AUTH_TOKEN_KEY = "cinedash_auth_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

/** Gera um token fictício para sessão local (não é JWT real). */
export function createFakeToken(payload: { email: string }): string {
  const data = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
    iat: Date.now(),
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
}
