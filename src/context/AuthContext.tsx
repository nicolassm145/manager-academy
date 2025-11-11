import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { API_BASE_URL } from "../config/api";
import type { LoginResponse } from "../types/api";
import { apiUserToMember } from "../types/mappers";
import { mapTipoAcessoToRole } from "../types/mappers";

export type UserRole = "admin" | "lider" | "professor" | "diretor" | "membro";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  equipe?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Erro ao verificar autenticação:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Faz requisição para o endpoint de login da API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        // A API retorna "detail" nas mensagens de erro
        throw new Error(error.detail || "Email ou senha inválidos");
      }

      // A API retorna { access_token, token_type, user }
      const responseData: LoginResponse = await response.json();

      // 🔍 CONSOLE LOG: Mostra o que a API está retornando
      console.log("📥 Resposta da API /auth/login:", responseData);
      console.log("📥 Dados do usuário:", responseData.user);

      const { access_token, user: apiUser } = responseData;

      // Salva o token JWT no localStorage
      localStorage.setItem("token", access_token);

      // Converte ApiUser para User do frontend
      const userData: User = {
        id: apiUser.id.toString(),
        nome: apiUser.nomeCompleto,
        email: apiUser.email,
        role: mapTipoAcessoToRole(apiUser.tipoAcesso),
        equipe: apiUser.equipeId?.toString(),
      };

      console.log("✅ Usuário autenticado:", userData);

      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
