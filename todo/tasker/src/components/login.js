import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, signInWithGoogle } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) {
            return;
        }
        if (user) navigate("/dashboard");
    }, [user, loading, navigate]);

    return (
        <div className="inFormBackground">
            <div className="inLoginForm f1">
                <form>
                    <div className="title"><h3>TASKER</h3></div>
                    <div className="inputGroup">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                            type="text"
                            className="login__textBox"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-mail Address"
                        />
                    </div>
                    <div className="inputGroup">
                        <label htmlFor="password">Password</label>
                        <input id="password"
                            type="password"
                            className="login__textBox"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>
                    <button
                        type="button"
                        className="submitForm"
                        onClick={() => logInWithEmailAndPassword(email, password)}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="submitForm"
                        onClick={signInWithGoogle}
                    >
                        Login with Google
                    </button>

                    <div className="text">
                        <Link to="/reset">Forgot Password</Link>
                    </div>
                    <div className="text">
                        Don't have an account? <Link to="/register">Register</Link> now.
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
