import React from 'react';
import { Bell, ArrowRight, Sparkles, Smartphone, ShieldAlert } from 'lucide-react';
import { Sale } from '../types';
import { isSaleAptoForRenewal } from '../utils/renewals';

interface RenewalAlertBannerProps {
  sales: Sale[];
  onOpenRenewalsTab: () => void;
}

export const RenewalAlertBanner: React.FC<RenewalAlertBannerProps> = ({
  sales,
  onOpenRenewalsTab,
}) => {
  const aptosCount = sales.filter(isSaleAptoForRenewal).length;

  if (aptosCount === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-indigo-950/80 border border-cyan-500/40 p-4 sm:p-4.5 shadow-xl shadow-cyan-950/30 backdrop-blur-xl">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-8 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950">
              {aptosCount}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Alerta Inteligente de Renovación Comercial (6+ Meses)
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              Tienes <span className="text-cyan-300 font-extrabold underline decoration-cyan-400 underline-offset-4">{aptosCount} cliente{aptosCount > 1 ? 's' : ''}</span> que {aptosCount > 1 ? 'han' : 'ha'} cumplido 180 días o más desde su Portabilidad o Alta.
            </p>
            <p className="text-xs text-slate-400 hidden sm:block">
              ¡Momento óptimo para renovar equipos con cuota preferencial y sumar comisiones al instante!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRenewalsTab}
          className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
        >
          <Smartphone className="w-4 h-4 text-cyan-200" />
          <span>Ver Clientes Aptos y Contactar</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
