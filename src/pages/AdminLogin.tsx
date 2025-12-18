import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../assets/cropped-nouveau_logo.png';
import { authApi } from '../services/api';

/**
 * BACKEND INTEGRATION: Now uses API for authentication
 * 
 * API Endpoint: POST /api/auth/login
 * - Requires: email, password
 * - Returns: { success, token, admin }
 * 
 * Token is automatically stored and included in subsequent requests.
 * 
 * Note: 2FA is currently client-side simulated. If backend implements
 * 2FA endpoints, update this component accordingly.
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

  // REMOVED: Unused ADMIN_EMAIL and ADMIN_PW variables
  // Now using API authentication instead
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

  const requestVerification = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus(null);

    if (!email.trim() || !password) {
      setStatus('Veuillez saisir l\'email et le mot de passe');
      return;
    }

    try {
      setStatus('Connexion en cours...');
      const response = await authApi.login(email.trim(), password);

      if (response.success && response.token) {
        // Login successful - token is automatically stored by authApi.login()
        // Store authentication flag for compatibility
        try { localStorage.setItem('imadel_admin_authenticated', '1'); } catch {}
        setPhase('done');
        setStatus('Connexion réussie ! Redirection...');
        
        // Redirect to admin panel
        setTimeout(() => {
          navigate('/admin/panel');
        }, 500);
      } else {
        setStatus('Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Erreur de connexion:', error);
      }
      // Translate Firebase Auth error messages
      let errorMessage = 'Échec de la connexion. Veuillez réessayer.';
      if (error.message) {
        if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Adresse email invalide.';
        } else if (error.message.includes('user-disabled')) {
          errorMessage = 'Ce compte a été désactivé.';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        } else if (error.message.includes('not authorized')) {
          errorMessage = 'Vous n\'êtes pas autorisé à accéder au panneau d\'administration.';
        } else if (error.message.includes('no email')) {
          errorMessage = 'Ce compte n\'a pas d\'email associé.';
        } else {
          errorMessage = error.message;
        }
      }
      setStatus(errorMessage);
    }
  };

  const resendCode = () => {
    if (cooldown > 0) return;
    const c = read2fa();
    if (!c) { setStatus('Aucune demande active — veuillez ressaisir vos identifiants.'); setPhase('login'); return; }
    const newCode = genCode();
    save2fa(newCode, 300);
    setCooldown(60);
    setAttemptsLeft(5);
    setStatus('Un nouveau code de vérification a été envoyé.');
    if (DEV_SHOW) { console.info('[DEV] Code de vérification admin (renvoi):', newCode); }
  };

  const verifyAndEnter = (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus(null);
    const p = read2fa();
    if (!p) { setStatus('Aucune vérification en cours. Veuillez demander un code.'); setPhase('login'); return; }
    if (Date.now() > p.exp) { setStatus('Code de vérification expiré. Veuillez demander un nouveau code.'); setPhase('login'); return; }
    if (p.attemptsLeft <= 0) { setStatus('Trop de tentatives échouées. Demandez un nouveau code.'); setPhase('login'); return; }

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
      setStatus(`Code invalide. ${p.attemptsLeft} tentative${p.attemptsLeft > 1 ? 's' : ''} restante${p.attemptsLeft > 1 ? 's' : ''}.`);
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
          <form onSubmit={requestVerification} className="login-form" aria-label="Formulaire de connexion administrateur">
            <div className="form-group">
              <label htmlFor="email">Email administrateur</label>
              <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="admin@example.org" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            <div className="actions">
              <button type="submit" className="login-btn">Se connecter</button>
            </div>
            <div aria-live="polite" style={{marginTop:8,color:'#555'}}>{status}</div>
          </form>
        )}

        {phase === 'verify' && (
          <form onSubmit={verifyAndEnter} className="login-form" aria-label="Saisir le code de vérification">
            <div className="form-group">
              <label htmlFor="code">Code de vérification</label>
              <input id="code" ref={codeInputRef} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="123456" value={code} onChange={e=>setCode(e.target.value)} required />
            </div>

            <div className="actions">
              <button type="submit" className="login-btn">Vérifier et entrer</button>
              <button type="button" className="back-btn" onClick={()=>{ setPhase('login'); setCode(''); setStatus(null); }}>Retour</button>
              <button type="button" className="back-btn" onClick={resendCode} disabled={cooldown>0}>{cooldown>0?`Renvoyer (${cooldown}s)`:'Renvoyer le code'}</button>
            </div>

            <div aria-live="polite" className="status">{status}</div>
            {attemptsLeft != null && <div className="attempts">Tentatives restantes : {attemptsLeft}</div>}
            {DEV_SHOW && <div className="dev-note">Mode dev : les codes sont enregistrés dans la console.</div>}
          </form>
        )}

        {phase === 'done' && (
          <div><p>Redirection…</p></div>
        )}
      </div>
    </div>
  );
}