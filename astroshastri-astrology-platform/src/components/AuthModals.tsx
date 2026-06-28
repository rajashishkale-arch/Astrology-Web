import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageSquare, AlertCircle, Phone, Lock, User, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuthModalsProps {
  isOpen: boolean;
  initialTab: 'login' | 'register';
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export default function AuthModals({
  isOpen,
  initialTab,
  onClose,
  onSuccess,
}: AuthModalsProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>(initialTab);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  // Registration States
  const [fullname, setFullname] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification Code OTP state
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login States
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Check secret URL doorways whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      const isHashAdmin = window.location.hash === '#admin';
      const isQueryAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
      if (isHashAdmin || isQueryAdmin) {
        setIsAdminLogin(true);
        setActiveTab('login');
      } else {
        setIsAdminLogin(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setSimulatedOtp('');
  };

  // Login execution API call
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMobile || !loginPassword) {
      setErrorMsg(isAdminLogin ? 'Username and password are required' : 'Mobile number and password are required');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const url = isAdminLogin ? '/api/admin/login' : '/api/auth/login';
      const body = isAdminLogin 
        ? JSON.stringify({ username: loginMobile, password: loginPassword })
        : JSON.stringify({ mobile: loginMobile, password: loginPassword });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();

      if (res.ok) {
        if (isAdminLogin) {
          // Admin response is { success: true, token, admin: { id, username, email, role: 'admin' } }
          onSuccess(data.token, data.admin);
        } else if (data.success) {
          onSuccess(data.token, data.user);
        }
        onClose();
      } else {
        setErrorMsg(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (e) {
      setErrorMsg('Network error. Failed to login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register step 1: Request OTP API call
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !mobile || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, mobile, email, password, confirmPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSimulatedOtp(data.simulatedOtp);
        setSuccessMsg(data.message);
        setActiveTab('otp'); // Switch to OTP typing view
      } else {
        setErrorMsg(data.error || 'Registration failed to initiate.');
      }
    } catch (err) {
      setErrorMsg('Network error initiating registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register step 2: Verify OTP API call
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the 6-digit verification code');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.token, data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Incorrect OTP code');
      }
    } catch (err) {
      setErrorMsg('Network error verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in" id="auth-modal">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-900 transition-colors"
          id="btn-auth-close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Brand Brand Title */}
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {activeTab === 'otp' ? 'Verify Mobile Number' : isAdminLogin ? 'Administrator Portal' : 'AstroShastri Kendra'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'login' && (isAdminLogin ? 'Sign in with administrator credentials' : 'Sign in to access secure appointments scheduling')}
            {activeTab === 'register' && 'Create your astrology profile with mobile number'}
            {activeTab === 'otp' && `Enter standard verification code sent to +91 ${mobile}`}
          </p>
        </div>

        {/* SMS simulator feedback panel */}
        {activeTab === 'otp' && simulatedOtp && (
          <div className="mb-6 rounded-2xl bg-slate-900 border border-amber-500/20 p-4 text-xs relative animate-bounce" id="sms-simulator-panel">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              <Phone className="h-3.5 w-3.5" />
              <span>SMS SIMULATOR (Incoming text message)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              "AstroShastri: Your OTP code for completing registration is <strong className="text-emerald-400 font-mono text-sm tracking-wider">{simulatedOtp}</strong>. Valid for 5 minutes."
            </p>
          </div>
        )}

        {/* Tabs switcher headers */}
        {activeTab !== 'otp' && !isAdminLogin && (
          <div className="flex border-b border-slate-900 mb-6" id="auth-tabs">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'border-b-2 border-amber-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-login"
            >
              Login Mode
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'border-b-2 border-amber-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-register"
            >
              Register Mode
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400" id="auth-error-banner">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Forms Form */}

        {/* LOGIN FORM VIEW */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="form-login">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isAdminLogin ? 'Admin Username' : 'Mobile Number'}
              </label>
              <div className="relative">
                {isAdminLogin ? (
                  <>
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="admin"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                      id="login-username-input"
                      required
                    />
                  </>
                ) : (
                  <>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))} // numbers only
                      maxLength={10}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-12 pr-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                      id="login-mobile-input"
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isAdminLogin ? 'Admin Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="login-password-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10 disabled:opacity-40"
              id="btn-login-submit"
            >
              {isLoading ? 'Signing in...' : isAdminLogin ? 'Sign In as Admin' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdminLogin(!isAdminLogin);
                  setLoginMobile('');
                  setLoginPassword('');
                  setErrorMsg('');
                }}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-4"
                id="btn-admin-login-toggle"
              >
                {isAdminLogin ? 'Are you a client? Switch to Customer Login' : 'Accessing Admin Portal? Switch to Admin Login'}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM VIEW */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterRequest} className="space-y-3.5" id="form-register">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Arjun Sharma"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="register-fullname-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-12 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="register-mobile-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="arjun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="register-email-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="register-password-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  id="register-confirm-password-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10 disabled:opacity-40"
              id="btn-register-submit"
            >
              {isLoading ? 'Sending code...' : 'Send OTP verification'}
            </button>
          </form>
        )}

        {/* OTP VERIFICATION VIEW */}
        {activeTab === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5" id="form-otp">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">6-Digit SMS Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-base text-center font-mono tracking-widest text-white focus:border-amber-400 focus:outline-none"
                id="otp-code-input"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-400 hover:text-white py-3 transition-colors"
              >
                Back to form
              </button>
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-40"
                id="btn-otp-verify-submit"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
