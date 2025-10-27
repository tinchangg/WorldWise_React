import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SpinnerFullPage from "../components/SpinnerFullPage";

function ProtectedRoute({ children }) {
  // Hooks
  const { isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    if (!isAuthenticated && !loadingAuth) navigate("/");
  }, [isAuthenticated, loadingAuth, navigate]);

  if (loadingAuth) return <SpinnerFullPage />;

  // useEffect runs after render -> need a condition here to prevent children rendered
  return isAuthenticated && children;
}

export default ProtectedRoute;
