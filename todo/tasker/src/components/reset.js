import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, sendPasswordReset } from "./firebase";
import "./reset.css";

function Reset() {
    const [email, setEmail] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/dashboard");
    }, [user, loading]);

    return (
        <div className="inFormBackground">
            <div className="inLoginForm f3">
                <form>
                    <div class="title"><h3>TASKER</h3></div>
                    <div class="inputGroup">
                        <label for="password">Email</label>
                        <input id="email"
                            type="text"
                            className="reset__textBox"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-mail Address"
                        />
                    </div>
                    <button
                        className="submitForm"
                        onClick={() => sendPasswordReset(email)}
                    >
                        Send password reset email
                    </button>
                    <div class="text">
                        Don't have an account? <Link to="/register">Register</Link> now.
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Reset;