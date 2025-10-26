import { createContext, useContext, useReducer } from "react";
import axios from "axios";

axios.defaults.withCredentials = true; // include cookies automatically

// CREATE CONTEXT
const AuthContext = createContext();

// INITIAL STATE
const initialState = {
  user: null,
  isAuthenticated: false,
};

// REDUCER
const reducer = (state, action) => {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...state, user: null, isAuthenticated: false };
    default:
      throw new Error("Unknow action type: " + action.type);
  }
};

// PROVIDER
function AuthProvider({ children }) {
  // States
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );

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

  const value = { user, isAuthenticated, login, logout };

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
