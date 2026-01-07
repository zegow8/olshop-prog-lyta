"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect berdasarkan role
      if (data.user.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/user";
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CSS Styles */}
      <style jsx global>{`
        :root {
          --maroon: #800000;
          --maroon-light: #a62626;
          --maroon-dark: #5a0000;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-50);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 11px 10px 22px -5px rgba(0,0,0,0.83);
-webkit-box-shadow: 11px 10px 22px -5px rgba(0,0,0,0.83);
-moz-box-shadow: 11px 10px 22px -5px rgba(0,0,0,0.83);
          border: 1px solid var(--gray-200);
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, var(--maroon), var(--maroon-light));
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--maroon), var(--maroon-dark));
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(128, 0, 0, 0.2);
        }

        .login-title {
          font-size: 32px;
          font-weight: 900;
          color: var(--gray-900);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 500;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease-out;
        }

        .login-error p {
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--gray-700);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          background: var(--gray-50);
          border: 2px solid var(--gray-200);
          border-radius: 10px;
          color: var(--gray-900);
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: var(--maroon);
          background: white;
          box-shadow: 0 0 0 4px rgba(128, 0, 0, 0.1);
        }

        .form-input::placeholder {
          color: var(--gray-400);
        }

        .login-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(to right, var(--maroon), var(--maroon-light));
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(128, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(128, 0, 0, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: var(--gray-400);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .login-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .login-button:hover::after {
          left: 100%;
        }

        .login-divider {
          margin: 32px 0;
          position: relative;
          text-align: center;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--gray-200);
        }

        .login-divider span {
          background: white;
          padding: 0 16px;
          color: var(--gray-500);
          font-size: 12px;
          font-weight: 600;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .register-cta {
          text-align: center;
        }

        .register-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 16px;
          border: 2px solid var(--maroon);
          color: var(--maroon);
          background: transparent;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .register-button:hover {
          background: var(--maroon);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(128, 0, 0, 0.15);
        }

        .login-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--gray-200);
          text-align: center;
        }

        .login-footer p {
          font-size: 12px;
          color: var(--gray-500);
          margin: 0;
        }

        .footer-link {
          color: var(--maroon);
          text-decoration: none;
          font-weight: 600;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* HTML Structure */}
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="login-title">LOGIN</h1>
            <p className="login-subtitle">login dulu yaaa</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span style={{ marginLeft: '8px' }}>AUTHENTICATING...</span>
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>New Here?</span>
          </div>

          {/* Register CTA */}
          <div className="register-cta">
            <Link href="/register" className="register-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              CREATE NEW ACCOUNT
            </Link>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>
              
              <a href="/terms" className="footer-link">By continuing, you agree to our Terms and </a>
              <a href="/privacy" className="footer-link">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}