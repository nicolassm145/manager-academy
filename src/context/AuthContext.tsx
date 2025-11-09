import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getMembers } from "../services/memberService";

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
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Buscar por email nos members
    const members = getMembers();
    const foundMember = members.find(
      (m) => m.email === email && m.status === "ativo"
    );

    if (!foundMember || foundMember.password !== password) {
      throw new Error("Email ou senha inválidos");
    }

    const userWithoutPassword = {
      id: foundMember.id,
      nome: foundMember.nome,
      email: foundMember.email,
      role: foundMember.role,
      equipe: foundMember.equipe,
    };

    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
