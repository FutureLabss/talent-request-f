// components/ProtectedRoute.tsx
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Optional: for role-based access
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Authenticated but not authorized, redirect (e.g., to an unauthorized page or login)
        alert("You do not have permission to access this page."); // Or show a nicer message
        router.push("/login"); // Redirect to login or home if not authorized
      }
    }
  }, [token, user, isLoading, router, allowedRoles]);

  if (
    isLoading ||
    !token ||
    (allowedRoles && user && !allowedRoles.includes(user.role))
  ) {
    // Show a loading spinner or null while checking auth status
    // Or if unauthorized but still loading
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
