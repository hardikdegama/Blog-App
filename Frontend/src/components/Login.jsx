import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);
      if (res.status === 200) {
        setMessage("Login successful!");
        // Optional: Redirect or save token here
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage("You are not a registered user or wrong credentials.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        <div className="login-extra-links">
          <p>
            Not registered? <Link to="/register">Register here</Link>
          </p>
          <p>
            Forgot password? <Link to="/forgot-password">Create A Password</Link>
          </p>
        </div>

        {message && <p className="message">{message}</p>}
      </div>

      <div className="login-image">
        <img src="/public/login.jpg" alt="Login visual" className="side-image" />
      </div>
    </div>
  );
};

export default Login;
