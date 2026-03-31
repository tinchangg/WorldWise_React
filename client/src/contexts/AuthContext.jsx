import { createContext, useContext, useReducer } from "react";
import axios from "../api/axios";
import { useEffect } from "react";

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
    case "loginWithGoogle":
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
    case "register":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
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
    initialState,
  );

  // Effects -> Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/check");
        // console.log(res.data);
        dispatch({ type: "setUser", payload: res.data.user });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.log("User not logged in yet.");
          dispatch({ type: "checkedAuth" });
        } else {
          console.error(err);
          dispatch({ type: "checkedAuth" });
        }
      }
    };
    checkAuth();
  }, []);

  // Fns
  // Login
  const login = async (credentials) => {
    try {
      const res = await axios.post("/api/auth/login", credentials);
      dispatch({ type: "login", payload: res.data.user });
    } catch (err) {
      console.error(err);
      window.alert("Wrong email or password");
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      const res = await axios.get("/api/auth/google");
      dispatch({ type: "loginWithGoogle", payload: res.data.user });
    } catch (err) {
      console.error(err);
      window.alert("Error logging in with Google");
    }
  };

  // Logout
  const logout = async () => {
    await axios.get("/api/auth/logout");
    dispatch({ type: "logout" });
  };

  // Register
  const register = async (credentials) => {
    try {
      const res = await axios.post("/api/auth/register", credentials);
      dispatch({ type: "register", payload: res.data.user });
    } catch (err) {
      console.error(err);
      window.alert("Error creating new user");
    }
  };

  const value = {
    user,
    isAuthenticated,
    loadingAuth,
    login,
    loginWithGoogle,
    logout,
    register,
  };

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
