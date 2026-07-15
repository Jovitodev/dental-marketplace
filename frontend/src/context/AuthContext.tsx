import { createContext, ReactNode, useContext, useState } from "react";
import { authService } from "../services/auth";
import { LoginPayload, RegisterPayload, User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());

  async function login(payload: LoginPayload) {
    const { user: loggedUser } = await authService.login(payload);
    setUser(loggedUser);
  }

  async function register(payload: RegisterPayload) {
    const { user: newUser } = await authService.register(payload);
    setUser(newUser);
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>.");
  }
  return context;
}
