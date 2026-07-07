import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await api.post("/users/forget-password", { email });
      setInfo(response.data?.message || "OTP sent successfully. Please check your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/users/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      navigate("/login", {
        state: { message: response.data?.message || "Password updated successfully. Please login." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>ShopMATE</h1>
        <h2 style={styles.title}>Reset your password</h2>
        <p style={styles.subtitle}>
          {step === 1
            ? "Enter your email to receive a password reset OTP"
            : "Enter the OTP and your new password"}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {info && <div style={styles.info}>{info}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>OTP (One-Time Password)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="123456"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          Remember your password?{" "}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  brand: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  error: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    marginBottom: "16px",
    textAlign: "left",
  },
  info: {
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#059669",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    marginBottom: "16px",
    textAlign: "left",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#f9fafb",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  footer: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#111827",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default ForgetPassword;
