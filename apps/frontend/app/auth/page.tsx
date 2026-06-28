"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, PenLine, Users, Zap } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_URL } from '../../config';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = ({ size = 26 }: { size?: number }) => (
  <motion.svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <motion.circle cx="12" cy="16" r="9" stroke="var(--coral)" strokeWidth="1.8"
      fill="var(--coral)" fillOpacity="0.15"
      animate={{ cx: [12, 11.2, 12] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.circle cx="20" cy="16" r="9" stroke="var(--on-dark)" strokeWidth="1.8"
      fill="var(--on-dark)" fillOpacity="0.07"
      animate={{ cx: [20, 20.8, 20] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.ellipse cx="16" cy="16" rx="3.5" ry="6" fill="var(--coral)" fillOpacity="0.55"
      animate={{ fillOpacity: [0.45, 0.75, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
  </motion.svg>
);

const FEATURES = [
  { icon: PenLine, text: 'Draw and sketch in real time' },
  { icon: Users, text: 'Collaborate with your team instantly' },
  { icon: Zap, text: 'Rooms ready in seconds, no setup' },
];

function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validatePassword = (password: string): string => {
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password' && activeTab === 'signup') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (activeTab === 'signup' && passwordError) return;
    setLoading(true);
    try {
      const endpoint = activeTab === 'signup' ? `${BACKEND_URL}/signup` : `${BACKEND_URL}/signin`;
      const payload = activeTab === 'signup'
        ? { username: formData.email, password: formData.password, name: formData.username }
        : { username: formData.email, password: formData.password };

      const response = await axios.post(endpoint, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(activeTab === 'signup' ? 'Account created!' : 'Welcome back!');
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          setTimeout(() => router.push('/dashboard'), 500);
        } else if (activeTab === 'signup') {
          setActiveTab('login');
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Authentication failed';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  background: 'var(--surface-soft)', border: '1px solid var(--hairline)',
  borderRadius: 8, color: 'var(--ink)', fontSize: 14,
  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
  WebkitBoxShadow: '0 0 0px 1000px var(--surface-soft) inset',
  WebkitTextFillColor: 'var(--ink)',
};

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--ink)',
    fontFamily: 'var(--font-sans)', marginBottom: 6, display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sans)' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── LEFT PANEL (dark navy) ── */}
      <div className="hidden md:flex" style={{
        width: '45%', flexShrink: 0,
        background: 'var(--surface-dark)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ color: 'var(--on-dark)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.3px' }}>DrawSync</span>
        </Link>

        {/* Center content */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400,
            color: 'var(--on-dark)', letterSpacing: '-1px', lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Where ideas take<br />
            <span style={{ color: 'var(--coral)' }}>shape together.</span>
          </h1>
          <p style={{ color: 'var(--on-dark-soft)', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
            A real-time collaborative whiteboard for teams who think visually.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--surface-dark-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: 'var(--coral)' }} />
                </div>
                <span style={{ color: 'var(--on-dark-soft)', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p style={{ color: 'var(--on-dark-soft)', fontSize: 12 }}>
          © {new Date().getFullYear()} DrawSync. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT PANEL (cream) ── */}
      <div style={{
        flex: 1, background: 'var(--canvas)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px',
        position: 'relative',
      }}>

        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ position: 'absolute', top: 24, left: 24, alignItems: 'center', gap: 8 }}>
          <Logo size={24} />
          <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 15 }}>DrawSync</span>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400,
              color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 6,
            }}>
              {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p style={{ color: 'var(--muted-color)', fontSize: 14 }}>
              {activeTab === 'login'
                ? 'Sign in to access your workspaces.'
                : 'Get started with DrawSync for free.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--surface-soft)',
            borderRadius: 8, padding: 4, marginBottom: 28,
            border: '1px solid var(--hairline)',
          }}>
            {(['login', 'signup'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setFormError(''); setPasswordError(''); }}
                style={{
                  flex: 1, height: 34, borderRadius: 6, border: 'none',
                  background: activeTab === tab ? 'var(--canvas)' : 'transparent',
                  color: activeTab === tab ? 'var(--ink)' : 'var(--muted-color)',
                  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Username — signup only */}
            {activeTab === 'signup' && (
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  name="username" placeholder="johndoe"
                  value={formData.username} onChange={handleInputChange}
                  required style={inputStyle}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email" type="email" placeholder="you@example.com"
                value={formData.email} onChange={handleInputChange}
                required style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password} onChange={handleInputChange}
                  required style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--muted-color)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordError && (
                <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{passwordError}</p>
              )}
            </div>

            {formError && (
              <p style={{ color: 'var(--error)', fontSize: 12 }}>{formError}</p>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 42, borderRadius: 8,
                background: loading ? 'var(--surface-card)' : 'var(--coral)',
                color: loading ? 'var(--muted-color)' : '#fff',
                border: 'none', fontSize: 14, fontWeight: 500,
                fontFamily: 'var(--font-sans)', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> {activeTab === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : activeTab === 'login' ? 'Sign In' : 'Sign Up'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
            <span style={{ color: 'var(--muted-color)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
          </div>

          {/* Google */}
          <button
            type="button" onClick={handleGoogleLogin}
            style={{
              width: '100%', height: 42, borderRadius: 8,
              background: 'var(--canvas)', border: '1px solid var(--hairline)',
              color: 'var(--ink)', fontSize: 14, fontWeight: 500,
              fontFamily: 'var(--font-sans)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-soft)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--canvas)'}
          >
            <FcGoogle size={18} /> Continue with Google
          </button>

          {/* Switch tab hint */}
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted-color)', fontSize: 13 }}>
            {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setActiveTab(activeTab === 'login' ? 'signup' : 'login'); setFormError(''); }}
              style={{
                background: 'none', border: 'none', color: 'var(--coral)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              {activeTab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;