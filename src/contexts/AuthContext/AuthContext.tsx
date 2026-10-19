import { createContext, useContext } from "react";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
}

export type Credentials = {
  email: string;
  password: string;
}

export type RegisterInput = Credentials & {
  firstName: string;
  lastName: string;
  phone: string;
  cpf: string;
  birthDate: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // token: string | null;
  // loading: boolean;
  // error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}