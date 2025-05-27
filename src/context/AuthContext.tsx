// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router"; // This is the standard Next.js Pages Router hook

interface AuthContextType {
  token: string | null;
  user: { id: string; email: string; role: string } | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To check initial auth state
  const router = useRouter();

  // Helper function to safely decode JWT tokens
  const decodeToken = (jwtToken: string) => {
    // Ensure this function only runs in a browser environment
    if (typeof window === "undefined") {
      return null;
    }
    try {
      if (!jwtToken) {
        console.warn("Attempted to decode an empty or null token.");
        return null;
      }
      const parts = jwtToken.split(".");
      if (parts.length !== 3) {
        console.warn("Invalid JWT format (expected 3 parts):", jwtToken);
        return null;
      }
      // Decode the payload part (second part of the JWT)
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (e) {
      console.error("Error decoding JWT token:", e, "Token:", jwtToken);
      return null;
    }
  };

  useEffect(() => {
    // IMPORTANT: Only access localStorage if code is running in the browser (client-side)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser) {
          setToken(storedToken);
          setUser({
            id: decodedUser.id,
            email: decodedUser.email,
            role: decodedUser.role,
          });
        } else {
          // If stored token is invalid or unreadable, clear it
          console.warn(
            "Invalid or unreadable token found in localStorage. Clearing it."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    setIsLoading(false); // Once initial check is done, set loading to false
  }, []); // Empty dependency array means this runs only once on component mount (client-side)

  const login = (newToken: string) => {
    setToken(newToken);
    // IMPORTANT: Only use localStorage if code is running in the browser
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }

    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser({ id: decoded.id, email: decoded.email, role: decoded.role });
      // IMPORTANT: Only use localStorage if code is running in the browser
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          })
        );
      }
    } else {
      console.error(
        "Login received an invalid token, clearing authentication state."
      );
      setToken(null);
      setUser(null);
      // IMPORTANT: Only use localStorage if code is running in the browser
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      // You might want to redirect to login page here if an invalid token is received during login
      // router.push("/login");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // IMPORTANT: Only use localStorage if code is running in the browser
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login"); // Redirect to login page on logout
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
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
