import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Login.module.css";
import PageNav from "../components/PageNav";
import Button from "../components/Button";

export default function Login() {
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hooks
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handles
  const handleLogin = (event) => {
    event.preventDefault();
    if (email && password) {
      login({ email, password });
    } else {
      window.alert("Please enter both email and password.");
    }
  };

  const handleGoogleLogin = () => {};

  // Effect -> listening isAuthenticated
  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className={styles.login}>
      <PageNav />
      <div className={styles.container}>
        <form onSubmit={handleLogin}>
          <div className={styles.row}>
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className={styles.row}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          <div className={styles.button}>
            <Link to={"/register"} className={styles.link}>
              Sign Up!
            </Link>
            <Button type="primary">Login</Button>
          </div>
        </form>

        <p>Or login in with</p>

        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          <img src="/sign_in_with_google.png" alt="Sign in with Google" />
        </button>
      </div>
    </main>
  );
}
