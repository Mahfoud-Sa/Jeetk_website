import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserRole } from "../types";
import { login as apiLogin, logout as apiLogout, LoginRequest, LoginResponse } from "../services/authService";
import { useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const initializeAuth = useCallback(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("jeetk_user_role") as UserRole;

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setRole(savedRole || "customer");
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await apiLogin(credentials);
      
      const userRolesStrings = response.roles.map((r: any) => 
        (typeof r === "string" ? r : r?.name || r?.role || "").toLowerCase()
      );
      
      let finalRole: UserRole = "customer";
      if (userRolesStrings.includes("admin")) finalRole = "admin";
      else if (userRolesStrings.includes("delivery")) finalRole = "delivery";
      
      const authUser: AuthUser = {
        id: response.id,
        name: response.name,
        email: response.email,
        username: response.username,
        roles: userRolesStrings,
      };

      if (response.token) {
        localStorage.setItem("token", response.token);
        setToken(response.token);
      }
      
      localStorage.setItem("user", JSON.stringify(authUser));
      localStorage.setItem("jeetk_user_role", finalRole);
      localStorage.setItem("jeetk_admin_auth", "true"); // For legacy compat if needed
      
      setUser(authUser);
      setRole(finalRole);
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    apiLogout();
    localStorage.removeItem("user");
    localStorage.removeItem("jeetk_user_role");
    localStorage.removeItem("jeetk_admin_auth");
    setToken(null);
    setUser(null);
    setRole("customer");
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
