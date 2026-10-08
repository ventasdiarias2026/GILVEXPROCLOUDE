import React, { useState } from 'react';
import { Lock, Shield, KeyRound, AlertCircle, LogOut } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface LockScreenModalProps {
  user: User;
  onUnlock: () => void;
  onLogout: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  user,
  onUnlock,
  onLogout,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor ingrese su contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate credentials with API to ensure absolute security
      const res = await api.login(user.username, password);
      if (res && res.success) {
        onUnlock();
      } else {
        setError('Contraseña incorrecta.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Contraseña incorrecta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 mb-5">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Sesión Bloqueada
        </h2>
        <p className="text-sm text-slate-400 mt-1 mb-6">
          Por inactividad y seguridad de datos en tiempo real de GILVEXPRO CLOUD.
        </p>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 mb-6 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="capitalize">{user.role === 'ceo' ? 'CEO General' : user.role === 'admin' ? 'Administrador' : 'Asesor de Ventas'}</span>
              <span>• @{user.username}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                autoFocus
                placeholder="Ingrese su contraseña"
                className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
              />
            </div>
            {user.username.toLowerCase() === 'gilberto' && (
              <p className="text-[11px] text-cyan-400/80 mt-1 text-left">
                (Pista CEO: 0903)
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Desbloquear y Continuar'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Datos intactos en la nube
          </span>
          <button
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
