import React, { useEffect, useRef } from 'react';
import { Target, Trophy, Flame, TrendingUp, Sparkles, PhoneCall, RefreshCw, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { CommercialGoals, Sale, SaleType } from '../types';
import { playGoalCelebrationSound, triggerFullscreenConfetti } from '../utils/celebration';

interface CommercialGoalsCardsProps {
  sales: Sale[];
  goals: CommercialGoals;
  onGoalAchievedToast?: (goalName: string) => void;
  titlePrefix?: string;
}

export const CommercialGoalsCards: React.FC<CommercialGoalsCardsProps> = ({
  sales,
  goals,
  onGoalAchievedToast,
  titlePrefix = 'Metas Comerciales del Periodo',
}) => {
  // Count current sales by type, respecting cantidad
  const counts = sales.reduce(
    (acc, sale) => {
      const qty = Math.max(1, sale.cantidad || 1);
      if (sale.saleType === 'Alta') acc.altas += qty;
      else if (sale.saleType === 'Portabilidad') acc.portabilidades += qty;
      else if (sale.saleType === 'Renovación') acc.renovaciones += qty;
      else if (sale.saleType === 'Prepago') acc.prepagos += qty;
      else if (sale.saleType === 'CyC') acc.cyc += qty;
      return acc;
    },
    { altas: 0, portabilidades: 0, renovaciones: 0, prepagos: 0, cyc: 0 }
  );

  // Track achieved goals to trigger celebration once per goal transition
  const previouslyAchievedRef = useRef<Record<string, boolean>>({});

  const goalItems = [
    {
      id: 'altas',
      label: 'Altas Nuevas',
      current: counts.altas,
      target: goals.altas,
      icon: Smartphone,
      unit: 'líneas',
    },
    {
      id: 'portabilidades',
      label: 'Portabilidades',
      current: counts.portabilidades,
      target: goals.portabilidades,
      icon: PhoneCall,
      unit: 'líneas',
    },
    {
      id: 'renovaciones',
      label: 'Renovaciones',
      current: counts.renovaciones,
      target: goals.renovaciones,
      icon: RefreshCw,
      unit: 'equipos',
    },
    {
      id: 'prepagos',
      label: 'Prepagos',
      current: counts.prepagos,
      target: goals.prepagos,
      icon: ShieldCheck,
      unit: 'chips',
    },
    {
      id: 'cyc',
      label: 'CyC (Cuotas y Cargo)',
      current: counts.cyc,
      target: goals.cyc,
      icon: CreditCard,
      unit: 'contratos',
    },
  ];

  useEffect(() => {
    goalItems.forEach((item) => {
      const isAchieved = item.current >= item.target;
      const wasAchieved = previouslyAchievedRef.current[item.id];

      // If it just transitioned to achieved (and wasn't before)
      if (isAchieved && !wasAchieved && previouslyAchievedRef.current[item.id] !== undefined) {
        playGoalCelebrationSound();
        triggerFullscreenConfetti();
        if (onGoalAchievedToast) {
          onGoalAchievedToast(`¡Meta de ${item.label} alcanzada con éxito! (${item.current}/${item.target}) 🏆🎉`);
        }
      }

      previouslyAchievedRef.current[item.id] = isAchieved;
    });
  }, [counts.altas, counts.portabilidades, counts.renovaciones, counts.prepagos, counts.cyc]);

  // Determine stage and color according to user specification:
  // 0% a 39%: 🔴 Rojo (Etapa inicial)
  // 40% a 69%: 🟠 Naranja (En avance)
  // 70% a 99%: 🔵 Azul (Cerca de la meta)
  // 100% o más: 🟢 Verde Esmeralda brillante con etiqueta "¡LOGRADO! 🏆"
  const getColorStyles = (percentage: number) => {
    if (percentage >= 100) {
      return {
        cardBg: 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50',
        progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-md shadow-emerald-500/50',
        textColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500 text-slate-950 font-black tracking-wide',
        statusLabel: '¡LOGRADO! 🏆',
        glow: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      };
    }
    if (percentage >= 70) {
      return {
        cardBg: 'bg-gradient-to-br from-blue-950/40 to-slate-900 border-blue-500/40 shadow-blue-500/10',
        progressBar: 'bg-gradient-to-r from-blue-600 to-cyan-400',
        textColor: 'text-blue-400',
        badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold',
        statusLabel: 'Cerca de la meta',
        glow: 'text-blue-400',
        iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      };
    }
    if (percentage >= 40) {
      return {
        cardBg: 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/40 shadow-amber-500/10',
        progressBar: 'bg-gradient-to-r from-amber-600 to-orange-400',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold',
        statusLabel: 'En avance',
        glow: 'text-amber-400',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      };
    }
    return {
      cardBg: 'bg-gradient-to-br from-red-950/40 to-slate-900 border-red-500/40 shadow-red-500/10',
      progressBar: 'bg-gradient-to-r from-red-600 to-rose-400',
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/20 text-red-300 border border-red-500/30 font-semibold',
      statusLabel: 'Etapa inicial',
      glow: 'text-red-400',
      iconBg: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {titlePrefix}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> 0-39%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 40-69%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> 70-99%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> 100%+
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {goalItems.map((item) => {
          const rawPercentage = Math.round((item.current / item.target) * 100);
          const displayPercentage = Math.min(rawPercentage, 100);
          const style = getColorStyles(rawPercentage);
          const isAchieved = rawPercentage >= 100;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`border rounded-2xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${style.cardBg}`}
            >
              {isAchieved && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div>
                {/* Header of card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-xl ${style.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${style.badgeBg}`}
                  >
                    {isAchieved && <Trophy className="w-3 h-3 text-amber-950 fill-amber-950" />}
                    {style.statusLabel}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {item.label}
                </h3>

                {/* Metric count */}
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black tracking-tight ${style.textColor}`}>
                    {item.current}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {item.target} {item.unit}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Progreso</span>
                  <span className={`text-xs font-bold ${style.textColor}`}>
                    {rawPercentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${style.progressBar}`}
                    style={{ width: `${displayPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
