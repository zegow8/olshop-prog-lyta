"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CSS Styles - Sama dengan login dengan sedikit modifikasi */}
      <style jsx global>{`
        :root {
          --maroon: #800000;
          --maroon-light: #a62626;
          --maroon-dark: #5a0000;
          --success-green: #10b981;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
        }

        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-50);
          padding: 20px;
        }

        .register-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 11px 10px 22px -5px rgba(0,0,0,0.83);
          border: 1px solid var(--gray-200);
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.5s ease-out;
        }

        .register-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, var(--maroon), var(--maroon-light));
        }

        .register-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .register-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--maroon), var(--maroon-dark));
          border-radius: 18px;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(128, 0, 0, 0.2);
        }

        .register-title {
          font-size: 36px;
          font-weight: 900;
          color: var(--gray-900);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .register-subtitle {
          color: var(--gray-700);
          font-size: 15px;
          font-weight: 500;
        }

        .register-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-left: 4px solid var(--success-green);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease-out;
        }

        .register-success p {
          color: #047857;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .register-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          animation: slideDown 0.3s ease-out;
        }

        .register-error p {
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          padding: 15px;
          font-size: 15px;
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

        .password-hint {
          font-size: 11px;
          color: var(--gray-500);
          margin-top: 6px;
          font-style: italic;
        }

        .register-button {
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
          margin-top: 10px;
        }

        .register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(128, 0, 0, 0.3);
        }

        .register-button:active {
          transform: translateY(0);
        }

        .register-button:disabled {
          background: var(--gray-400);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .register-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .register-button:hover::after {
          left: 100%;
        }

        .login-link-container {
          margin: 30px 0;
          position: relative;
          text-align: center;
        }

        .login-link-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--gray-200);
        }

        .login-link-container span {
          background: white;
          padding: 0 16px;
          color: var(--gray-500);
          font-size: 12px;
          font-weight: 600;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .login-button {
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

        .login-button:hover {
          background: var(--maroon);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(128, 0, 0, 0.15);
        }

        .register-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--gray-200);
          text-align: center;
        }

        .register-footer p {
          font-size: 12px;
          color: var(--gray-500);
          margin: 0;
          line-height: 1.5;
        }

        .footer-link {
          color: var(--maroon);
          text-decoration: none;
          font-weight: 600;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .input-icon {
          position: relative;
        }

        .input-icon input {
          padding-left: 45px;
        }

        .input-icon::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background-size: contain;
          background-repeat: no-repeat;
          z-index: 2;
          opacity: 0.5;
        }

        .name-icon::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'%3E%3C/path%3E%3C/svg%3E");
        }

        .email-icon::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E");
        }

        .password-icon::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'%3E%3C/path%3E%3C/svg%3E");
        }
      `}</style>

      {/* HTML Structure */}
      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="register-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="register-title">REGISTER</h1>
            <p className="register-subtitle">register dulu yaa kalau belum punya akun</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="register-success">
              <p>{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="register-error">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon name-icon">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  placeholder="enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon email-icon">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  placeholder="enter your email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon password-icon">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="password-hint">Use at least 6 characters with letters and numbers</div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="register-button"
            >
              {loading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span style={{ marginLeft: '8px' }}>CREATING ACCOUNT...</span>
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link-container">
            <span>Already Registered?</span>
          </div>

          {/* Login Button */}
          <div className="register-cta">
            <Link href="/login" className="login-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              SIGN IN TO EXISTING ACCOUNT
            </Link>
          </div>

          {/* Footer */}
          <div className="register-footer">
            <p>
              <a href="/terms" className="footer-link">By creating an account, you agree to our Terms of Service and Privacy Policy. We'll occasionally send you account-related emails.</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}