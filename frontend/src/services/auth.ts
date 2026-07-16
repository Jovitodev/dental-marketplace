import { api } from "./api";
import { tokenStorage } from "./tokenStorage";
import { AuthResponse, LoginPayload, PublicHostProfile, RegisterPayload, User } from "../types/user";

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
    tokenStorage.setToken(auth.token);
    localStorage.setItem(tokenStorage.USER_KEY, JSON.stringify(auth.user));
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(tokenStorage.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return tokenStorage.getToken();
  },

  logout() {
    tokenStorage.clear();
  },
};
