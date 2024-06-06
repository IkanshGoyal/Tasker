import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "./firebase";
import "./register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };

  useEffect(() => {
    if (loading) return;
    if (user) navigate("/dashboard");
  }, [user, loading]);

  return (
    <div className="inFormBackground">
      <div className="inLoginForm f2">

        <form>
          <div class="title"><h3>TASKER</h3></div>
          <div class="inputGroup">
            <label for="name">Full Name</label>
            <input id="email"
              type="text"
              className="register__textBox"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div class="inputGroup">
            <label for="email">Email</label>
            <input id="register"
              type="text"
              className="register__textBox"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail Address"
            />
          </div>
          <div class="inputGroup">
            <label for="password">Password</label>
            <input id="password"
              type="password"
              className="register__textBox"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <button className="submitForm" onClick={register}>
            Register
          </button>
          <button
            className="submitForm"
            onClick={signInWithGoogle}
          >
            Register with Google
          </button>

          <div class="text">
            Already have an account? <Link to="/">Login</Link> now.
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;