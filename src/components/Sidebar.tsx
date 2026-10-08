import React from 'react';
import {
  LayoutDashboard,
  Bell,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Users,
  Target,
  DollarSign,
  Database,
  Lock,
  LogOut,
  Radio,
  ChevronRight,
  Shield,
  Smartphone,
  Flame,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  activeView: 'dashboard' | 'operations' | 'renewals' | 'team' | 'goals';
  setActiveView: (view: 'dashboard' | 'operations' | 'renewals' | 'team' | 'goals') => void;
  onOpenNewSale: () => void;
  onOpenBackups: () => void;
  onManualLock: () => void;
  onLogout: () => void;
  renewalAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenNewSale,
  onOpenBackups,
  onManualLock,
  onLogout,
  renewalAlertCount,
}) => {
  const isCEO = currentUser.role === 'ceo' || currentUser.username.toLowerCase() === 'gilberto';
  const isAdmin = currentUser.role === 'admin';

  return (
    <aside className="w-64 bg-[#1f1513] text-stone-200 flex flex-col justify-between shrink-0 min-h-screen border-r border-[#2d201c] select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#2d201c]/80">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-black text-sm tracking-wider text-white flex items-center gap-1.5">
              <span>GILVEXPRO</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.2 rounded-md border border-rose-500/30">
                CLOUD
              </span>
            </div>
            <div className="text-[11px] text-stone-400 font-medium">
              Telecom Commercial POS
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* PRINCIPAL */}
          <div>
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
              Principal
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('renewals')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'renewals'
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Alertas (6m+)</span>
                </div>
                {renewalAlertCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-stone-950 font-black rounded-full">
                    {renewalAlertCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* VENTAS */}
          <div>
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
              Ventas
            </div>
            <div className="space-y-1">
              <button
                onClick={onOpenNewSale}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-rose-400" />
                  <span>Punto de Venta</span>
                </div>
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-md">
                  + Venta
                </span>
              </button>

              <button
                onClick={() => setActiveView('operations')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'operations'
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4" />
                  <span>Ventas & Tabla</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('renewals')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'renewals'
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4" />
                  <span>Renovaciones</span>
                </div>
                {renewalAlertCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              {(isCEO || isAdmin) && (
                <button
                  onClick={() => setActiveView('team')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'team'
                      ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Equipo Asesores</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* COMERCIAL & METAS */}
          <div>
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
              Comercial
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView('goals')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'goals'
                    ? 'bg-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4" />
                  <span>Metas Comerciales</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">🏆</span>
              </button>
            </div>
          </div>

          {/* SISTEMA & NUBE */}
          <div>
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
              Sistema Nube
            </div>
            <div className="space-y-1">
              <button
                onClick={onOpenBackups}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Respaldos Nube</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>

              <button
                onClick={onManualLock}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Bloquear Sesión</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section (Matching pos.jpg) */}
      <div className="p-4 border-t border-[#2d201c] bg-[#1a110f]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 font-black flex items-center justify-center shrink-0 shadow-md">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-stone-400 truncate flex items-center gap-1">
                <span className="capitalize">{currentUser.role === 'ceo' ? 'CEO General' : currentUser.role === 'admin' ? 'Administrador' : 'Asesor'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800/60 transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
