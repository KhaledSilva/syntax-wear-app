import { useEffect, useState, type ReactNode } from "react";
import { login as authenticate } from "../../services/authService";
import { AuthContext, type AuthContextType, type RegisterInput, type User } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/profile", {
                method: "GET",
                credentials: "include", // faz com que o cookies sejam enviados junto com a requisição
            });

            if (!response.ok) {
                throw new Error("Erro ao buscar perfil do usuário");
            }

            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);

            console.log(data.user)

        } catch (error) {
            console.error("Erro ao buscar perfil do usuário", error);
        }
    };
    fetchUserProfile();
  }, [])

  async function login(
    credentials: Parameters<AuthContextType["login"]>[0],
  ): Promise<void> {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      credentials: "include", // faz com que os coookies sejam enviados junto com a requisição
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Falha ao fazer login.");
    }

    setUser(data.user);
    setIsAuthenticated(true);
  }

  async function register(data: RegisterInput): Promise<void> {
    
  }

  function logout(): void {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthenticated,
        // token,
        // loading,
        // error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}