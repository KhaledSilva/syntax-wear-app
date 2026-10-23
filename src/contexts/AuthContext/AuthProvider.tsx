import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextType, type RegisterInput, type User } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/profile", {
                method: "GET",
                credentials: "include",
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
      credentials: "include", 
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

  async function signUp(data: RegisterInput): Promise<void> {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Erro ao cadastrar usuário");
    }
      setUser(result.user);
      setIsAuthenticated(true);
  }

  async function logOut(): Promise<void> {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  async function signInWithGoogle(credential: string): Promise<void> {
    const response = await fetch ("http://localhost:3000/auth/google", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    const result = await response.json();

    console.log("result:", result)

    if (!response.ok || !result.user) {
      throw new Error(result.message || "Erro ao fazer login com Google");
    }

    setUser(result.user);
    setIsAuthenticated(true);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthenticated,
        login,
        signUp,
        logOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}