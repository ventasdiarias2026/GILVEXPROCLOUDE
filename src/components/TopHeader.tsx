import React from 'react';
import { Search, Plus, Bell, Lock, Shield, Sparkles } from 'lucide-react';
import { User } from '../types';

interface TopHeaderProps {
  currentUser: User;
  onOpenNewSale: () => void;
  onManualLock: () => void;
  inactivitySecondsRemaining: number;
  renewalAlertCount: number;
  onOpenAlerts: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onOpenNewSale,
  onManualLock,
  inactivitySecondsRemaining,
  renewalAlertCount,
  onOpenAlerts,
  searchTerm,
  setSearchTerm,
}) => {
  // Format today's date in Spanish like the image ("Jueves, 8 de octubre de 2026")
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  // Capitalize first letter
  const displayDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  return (
    <header className="h-20 bg-[#faf6f3] border-b border-stone-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Title and Date */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight">
          Dashboard
        </h1>
        <p className="text-xs text-stone-400 font-medium">
          {displayDate}
        </p>
      </div>

      {/* Middle Search Bar matching pos.jpg */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos, clientes, pedidos..."
            className="w-full bg-white border border-stone-200/90 rounded-full pl-11 pr-12 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 shadow-sm transition-all placeholder:text-stone-400"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-stone-100 text-stone-400 rounded-md font-mono border border-stone-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-3">
        {/* + Nueva venta button (Coral/Pink Pill matching pos.jpg) */}
        <button
          onClick={onOpenNewSale}
          className="px-4.5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full text-xs sm:text-sm font-extrabold shadow-md shadow-rose-500/25 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva venta</span>
        </button>

        {/* Lock Timer / Manual Lock */}
        <button
          onClick={onManualLock}
          className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full text-xs font-semibold text-stone-600 flex items-center gap-1.5 transition-colors shadow-sm"
          title="Auto-bloqueo activo: se bloqueará tras inactividad. Clic para bloquear ahora."
        >
          <Lock className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-mono text-stone-900 font-bold">{inactivitySecondsRemaining}s</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2.5 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full text-stone-600 transition-colors shadow-sm"
          title="Alertas de renovación (6+ meses)"
        >
          <Bell className="w-4 h-4" />
          {renewalAlertCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#e11d48] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* User profile pill */}
        <div className="hidden lg:flex items-center gap-2 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left text-xs leading-tight">
            <div className="font-bold text-stone-900 truncate max-w-[120px]">
              {currentUser.fullName}
            </div>
            <div className="text-[10px] text-stone-400 capitalize">
              {currentUser.role === 'ceo' ? 'Administrador' : currentUser.role === 'admin' ? 'Supervisor' : 'Asesor'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
