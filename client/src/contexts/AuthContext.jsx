import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { useEffect } from "react";

// Include cookies automatically
axios.defaults.withCredentials = true;

// CREATE CONTEXT
const AuthContext = createContext();

// INITIAL STATE
const initialState = {
  user: null,
  isAuthenticated: false,
  loadingAuth: true, // perform initial auth check -> default true
};

// REDUCER
const reducer = (state, action) => {
  switch (action.type) {
    case "login":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loadingAuth: false,
      };
    case "logout":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loadingAuth: false,
      };
    case "setUser":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loadingAuth: false,
      };
    case "checkedAuth":
      return { ...state, loadingAuth: false };
    default:
      throw new Error("Unknow action type: " + action.type);
  }
};

// PROVIDER
function AuthProvider({ children }) {
  // States
  const [{ user, isAuthenticated, loadingAuth }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Effects -> Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/check");
        dispatch({ type: "setUser", payload: res.data.user });
      } catch (err) {
        console.error(err);
        dispatch({ type: "checkedAuth" });
      }
    };
    checkAuth();
  }, []);

  // Fns
  const login = async (credentials) => {
    try {
      const res = await axios.post("/api/auth/login", credentials);
      dispatch({ type: "login", payload: res.data.user });
    } catch (err) {
      console.error(err);
      window.alert("Wrong email or password");
    }
  };

  const logout = () => {
    dispatch({ type: "logout" });
  };

  const value = { user, isAuthenticated, loadingAuth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// CUSTOM HOOK -> USE CONTEXT
function useAuth() {
  const value = useContext(AuthContext);

  if (value === undefined)
    throw new Error("AuthContext was used outside AuthProvider");

  return value;
}

export { AuthProvider, useAuth };
