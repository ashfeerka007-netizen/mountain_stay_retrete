import { useState } from 'react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('msr_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Default: admin / admin123');
      }
    } catch {
      // Fallback check if server offline
      if (username === 'admin' && (password === 'admin' || password === 'admin123')) {
        sessionStorage.setItem('msr_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg('Invalid username or password. Try username: admin, password: admin123');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-2xl text-blue-400">
              🔒
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Staff Admin Login</h3>
              <p className="text-xs text-slate-400">Restricted access portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (e.g. admin)"
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-500 pt-2">
            Demo Credentials — Username: <span className="text-slate-300 font-mono">admin</span> | Password: <span className="text-slate-300 font-mono">admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
