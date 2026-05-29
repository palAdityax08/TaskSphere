import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to TaskFlow 🎉');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Account created! Welcome to TaskFlow 🎉');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        toast('Sign-in cancelled', { icon: '👋' });
      } else if (err.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/operation-not-allowed') {
        toast.error('Google Sign-In is not enabled. Enable it in Firebase Console.');
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob blob-1" />
        <div className="auth-blob blob-2" />
        <div className="auth-blob blob-3" />
      </div>

      <div className="auth-container">
        <div className="auth-logo">
          <Zap size={28} strokeWidth={2.5} />
          <span>TaskFlow</span>
        </div>

        <div className="auth-card glass-card">
          <div className="auth-header">
            <h1>Create account</h1>
            <p>Join TaskFlow and start organizing your work</p>
          </div>

          <button
            id="google-register-btn"
            className="btn-google"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            type="button"
          >
            {googleLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <GoogleIcon />}
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or register with email</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form" id="register-form">
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="input-password-wrap">
                <input
                  id="register-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                name="confirm"
                type="password"
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary"
              disabled={loading || googleLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</>
                : <><UserPlus size={16} /> Create account</>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" id="go-to-login">Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          top: -150px; left: -150px;
          animation: float 8s ease-in-out infinite;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #3b82f6, transparent);
          bottom: -100px; right: -100px;
          animation: float 10s ease-in-out infinite reverse;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #10b981, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: float 12s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--accent-light);
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .auth-logo svg { color: var(--accent); }
        .auth-card {
          width: 100%;
          padding: 36px 32px;
          box-shadow: var(--shadow-lg), var(--shadow-accent);
          animation: slideUp 0.4s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-header { margin-bottom: 24px; }
        .auth-header h1 {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .auth-header p { font-size: 14px; color: var(--text-secondary); }
        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition);
        }
        .btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-divider {
          position: relative;
          text-align: center;
          margin: 18px 0;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0; right: 0;
          height: 1px;
          background: var(--border);
        }
        .auth-divider span {
          position: relative;
          background: #111118;
          padding: 0 12px;
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.03em;
        }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .input-password-wrap { position: relative; }
        .input-password-wrap .form-input { padding-right: 42px; }
        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color var(--transition);
        }
        .pass-toggle:hover { color: var(--text-secondary); }
        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 20px;
        }
        .auth-switch a {
          color: var(--accent-light);
          font-weight: 600;
          transition: color var(--transition);
        }
        .auth-switch a:hover { color: var(--accent); }
        @media (max-width: 480px) {
          .auth-card { padding: 28px 20px; }
        }
      `}</style>
    </div>
  );
}
