import { api } from "./api";
import { AuthResponse, LoginPayload, PublicHostProfile, RegisterPayload, User } from "../types/user";

const TOKEN_KEY = "dental_marketplace_token";
const USER_KEY = "dental_marketplace_user";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    authService.persistSession(data);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    authService.persistSession(data);
    return data;
  },

  async getPublicProfile(userId: string): Promise<PublicHostProfile> {
    const { data } = await api.get<PublicHostProfile>(`/users/${userId}`);
    return data;
  },

  persistSession(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
