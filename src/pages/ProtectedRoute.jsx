import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";

function ProtectedRoute({ children }) {
  // Hooks
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // useEffect runs after render -> need a condition here to prevent children rendered
  return isAuthenticated && children;
}

export default ProtectedRoute;
