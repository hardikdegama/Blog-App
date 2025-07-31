import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/send-otp", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", { email, otp });
      if (res.data.valid) {
        setMessage("OTP verified successfully.");
        setStep(3);
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Step 3: Reset password
  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password should be at least 6 characters.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp-reset", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="forgot-container">
      {/* Side image */}
      <div className="forgot-image">
        <img
          src="/public/forgotpassword.jpg"
          alt="Side Illustration"
          className="side-image"
        />
      </div>

      {/* Form section */}
      <div className="forgot-form">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword}>
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
