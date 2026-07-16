// Isolado em arquivo próprio para que tanto `api.ts` (que precisa ler o
// token em todo request) quanto `auth.ts` (que precisa escrevê-lo) possam
// importar sem criar uma dependência circular entre os dois.

const TOKEN_KEY = "dental_marketplace_token";
const USER_KEY = "dental_marketplace_user";

export const tokenStorage = {
  TOKEN_KEY,
  USER_KEY,
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
