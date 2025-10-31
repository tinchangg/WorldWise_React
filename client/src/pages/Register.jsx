import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageNav from "../components/PageNav";
import styles from "./Register.module.css";
import Button from "../components/Button";

function Register() {
  // States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //Hooks
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handles
  const handleRegister = (event) => {
    event.preventDefault();
    if (email && password && name) {
      register({ name, email, password });
    } else {
      window.alert("Please enter both email and password.");
    }
  };

  // Effect -> listening isAuthenticated
  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className={styles.register}>
      <PageNav />
      <form className={styles.form} onSubmit={handleRegister}>
        <div className={styles.row}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

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
          <Button type="primary">Sign Up</Button>
        </div>
      </form>
    </main>
  );
}

export default Register;
