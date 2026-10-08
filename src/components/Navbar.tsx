import React from 'react';
import {
  Radio,
  Lock,
  LogOut,
  Users,
  Database,
  Smartphone,
  ShieldCheck,
  Bell,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  activeView: 'operations' | 'renewals' | 'team';
  setActiveView: (view: 'operations' | 'renewals' | 'team') => void;
  onOpenBackups: () => void;
  onOpenTeamModal?: () => void;
  onManualLock: () => void;
  onLogout: () => void;
  renewalAlertCount: number;
  inactivitySecondsRemaining: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenBackups,
  onManualLock,
  onLogout,
  renewalAlertCount,
  inactivitySecondsRemaining,
}) => {
  const isCEO = currentUser.role === 'ceo' || currentUser.username.toLowerCase() === 'gilberto';
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-300 to-teal-300 bg-clip-text text-transparent">
                  GILVEXPRO
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  CLOUD
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-medium">Sincronizado en la Nube</span>
              </div>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveView('operations')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'operations'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Ventas & Metas
            </button>

            <button
              onClick={() => setActiveView('renewals')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 relative ${
                activeView === 'renewals'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯 Renovaciones (6m+)</span>
              {renewalAlertCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 font-black rounded-full animate-bounce">
                  {renewalAlertCount}
                </span>
              )}
            </button>

            {(isCEO || isAdmin) && (
              <button
                onClick={() => setActiveView('team')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'team'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Equipo</span>
              </button>
            )}
          </nav>

          {/* Right: Status, Auto-lock timer, User, Backups */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto-lock countdown indicator & manual lock button */}
            <button
              onClick={onManualLock}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition-all"
              title="Haz clic para bloquear pantalla ahora. Se bloquea automáticamente por inactividad tras 60s."
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-slate-400">Bloqueo:</span>
              <span className="font-mono font-bold text-cyan-300">
                {inactivitySecondsRemaining}s
              </span>
            </button>

            {/* Backups Button */}
            <button
              onClick={onOpenBackups}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-emerald-400 transition-colors"
              title="Sistema de Respaldos Automáticos en la Nube"
            >
              <Database className="w-4 h-4 text-emerald-400" />
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider flex items-center justify-end gap-1">
                  {isCEO && <span>👑 CEO</span>}
                  {isAdmin && <span>🛡️ ADMIN</span>}
                  {!isCEO && !isAdmin && <span>💼 ASESOR</span>}
                  <span>• @{currentUser.username}</span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="p-2 bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveView('operations')}
            className={`py-1.5 px-3 rounded-lg font-semibold ${
              activeView === 'operations' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            📊 Ventas & Metas
          </button>
          <button
            onClick={() => setActiveView('renewals')}
            className={`py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1 ${
              activeView === 'renewals' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span>🎯 Renovaciones</span>
            {renewalAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
          {(isCEO || isAdmin) && (
            <button
              onClick={() => setActiveView('team')}
              className={`py-1.5 px-3 rounded-lg font-semibold ${
                activeView === 'team' ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              👥 Equipo
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
