import { useAuth } from "../context/AuthContext";

/**
 * Wraps any screen that requires authentication.
 * Pass `onNavigate` so it can redirect to "login" if the user is not authenticated.
 *
 * Usage:
 *   <ProtectedRoute onNavigate={navigate}>
 *     <DashboardScreen onNavigate={navigate} />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, onNavigate }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    onNavigate("login");
    return null;
  }

  return children;
}
