import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../assets/cropped-nouveau_logo.png';

/**
 * BACKEND INTEGRATION NOTES:
 * 
 * SECURITY WARNING: This login system is for DEVELOPMENT ONLY!
 * 
 * Current Hardcoded Credentials (REMOVE IN PRODUCTION):
 * - Username: admin
 * - Password: admin123
 * - 2FA Code: Randomly generated 6-digit code (stored in sessionStorage)
 * 
 * TODO for Production:
 * 1. Replace with real authentication API (POST /api/auth/login)
 * 2. Implement server-side 2FA (TOTP/email/SMS)
 * 3. Use JWT tokens stored in httpOnly cookies (NOT localStorage)
 * 4. Add password reset functionality
 * 5. Implement rate limiting and account lockout
 * 6. Add CAPTCHA for brute force protection
 * 
 * See BACKEND_INTEGRATION.md for detailed authentication flow.
 */

// Lightweight client-side 2FA simulation. Replace with a server-side flow for
// production (send real emails, verify server-side, issue secure session/JWT).

const STORAGE_KEY = 'imadel_admin_2fa';

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function save2fa(code: string, ttlSeconds = 300) {
  const payload = { code, exp: Date.now() + ttlSeconds * 1000, attemptsLeft: 5 };
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
}

function read2fa() {
  try { const raw = sessionStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'login'|'verify'|'done'>('login');
  const [status, setStatus] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const ADMIN_EMAIL = (import.meta.env && (import.meta.env as any).VITE_ADMIN_EMAIL) || 'admin@imadel.org';
  const ADMIN_PW = (import.meta.env && (import.meta.env as any).VITE_ADMIN_PASSWORD) || 'admin';
  const DEV_SHOW = true; // Always show code in development

  useEffect(()=>{
    let t: number | undefined;
    if (cooldown > 0) {
      t = window.setTimeout(()=> setCooldown(c => Math.max(0, c - 1)), 1000);
    }
    return () => { if (t) clearTimeout(t); };
  }, [cooldown]);

  useEffect(()=>{
    const p = read2fa();
    if (p && p.attemptsLeft != null) setAttemptsLeft(p.attemptsLeft);
  }, []);

  const requestVerification = (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus(null);
    // Basic local check -- in production this should be handled server-side.
    if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PW) {
      setStatus('Invalid email or password');
      return;
    }

    const newCode = genCode();
    save2fa(newCode, 300); // 5 minutes
    setPhase('verify');
    setCooldown(60); // 60s resend cooldown
    setAttemptsLeft(5);
    setStatus('A verification code was sent to the admin email.');

    // For development convenience we optionally display the code in the UI or log it.
    if (DEV_SHOW) {
      console.info('[DEV] Admin verification code:', newCode);
      setStatus(s => (s ? s + ' (dev mode: code logged to console)' : null));
    }

    // focus code input on next render
    setTimeout(()=> codeInputRef.current?.focus(), 50);
  };

  const resendCode = () => {
    if (cooldown > 0) return;
    const c = read2fa();
    if (!c) { setStatus('No active request — please re-enter credentials.'); setPhase('login'); return; }
    const newCode = genCode();
    save2fa(newCode, 300);
    setCooldown(60);
    setAttemptsLeft(5);
    setStatus('A new verification code has been sent.');
    if (DEV_SHOW) { console.info('[DEV] Admin verification code (resend):', newCode); }
  };

  const verifyAndEnter = (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus(null);
    const p = read2fa();
    if (!p) { setStatus('No verification in progress. Please request a code.'); setPhase('login'); return; }
    if (Date.now() > p.exp) { setStatus('Verification code expired. Please request a new code.'); setPhase('login'); return; }
    if (p.attemptsLeft <= 0) { setStatus('Too many failed attempts. Request a new code.'); setPhase('login'); return; }

    if (code.trim() === p.code) {
      try { localStorage.setItem('imadel_admin_authenticated', '1'); } catch {}
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      setPhase('done');
      navigate('/admin/panel');
    } else {
      // decrement attempts
      p.attemptsLeft = (p.attemptsLeft || 1) - 1;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
      setAttemptsLeft(p.attemptsLeft);
      setStatus(`Invalid code. ${p.attemptsLeft} attempts remaining.`);
      if (p.attemptsLeft <= 0) setPhase('login');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container" role="main" aria-labelledby="admin-login-title">
        <div className="brand">
          <img src={logo} alt="IMADEL Logo" className="admin-logo" width="56" height="56" />
          <h1 id="admin-login-title">IMADEL Admin</h1>
        </div>

        {phase === 'login' && (
          <form onSubmit={requestVerification} className="login-form" aria-label="Admin login form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="admin@example.org" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            <div className="actions">
              <button type="submit" className="login-btn">Request code</button>
            </div>
            <div aria-live="polite" style={{marginTop:8,color:'#555'}}>{status}</div>
            <div className="note">This demo uses a client-side simulated 2FA; replace with a server-side email sender for production.</div>
          </form>
        )}

        {phase === 'verify' && (
          <form onSubmit={verifyAndEnter} className="login-form" aria-label="Enter verification code">
            <div className="form-group">
              <label htmlFor="code">Verification code</label>
              <input id="code" ref={codeInputRef} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required />
            </div>

            <div className="actions">
              <button type="submit" className="login-btn">Verify & enter</button>
              <button type="button" className="back-btn" onClick={()=>{ setPhase('login'); setCode(''); setStatus(null); }}>Back</button>
              <button type="button" className="back-btn" onClick={resendCode} disabled={cooldown>0}>{cooldown>0?`Resend (${cooldown}s)`:'Resend code'}</button>
            </div>

            <div aria-live="polite" className="status">{status}</div>
            {attemptsLeft != null && <div className="attempts">Attempts left: {attemptsLeft}</div>}
            {DEV_SHOW && <div className="dev-note">Dev mode: codes are logged to console.</div>}
          </form>
        )}

        {phase === 'done' && (
          <div><p>Redirecting…</p></div>
        )}
      </div>
    </div>
  );
}
