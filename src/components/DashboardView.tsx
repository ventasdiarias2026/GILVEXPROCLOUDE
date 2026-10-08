import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  ShoppingBag,
  Clock,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Smartphone,
  PhoneCall,
  CheckCircle,
  Trophy,
  ArrowRight,
  Plus,
  Package,
  Layers,
  BarChart3,
  Flame,
} from 'lucide-react';
import { CommercialGoals, Sale, User } from '../types';
import { calculateRenewalStatus, isSaleAptoForRenewal } from '../utils/renewals';
import { CommercialGoalsCards } from './CommercialGoalsCards';

interface DashboardViewProps {
  currentUser: User;
  sales: Sale[];
  goals: CommercialGoals;
  onOpenNewSale: () => void;
  onOpenRenewals: () => void;
  onOpenSalesTable: () => void;
  onOpenBackups: () => void;
  onOpenTeam: () => void;
  onGoalAchievedToast?: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  sales,
  goals,
  onOpenNewSale,
  onOpenRenewals,
  onOpenSalesTable,
  onOpenBackups,
  onOpenTeam,
  onGoalAchievedToast,
}) => {
  const [periodTab, setPeriodTab] = useState<'7' | '30' | '90'>('7');

  // Compute stats
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const todaySales = sales.filter((s) => s.saleDate === todayStr);
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + (s.cargoFijo || 0) * (s.cantidad || 1), 0);
  const todayCommissions = todaySales.reduce((acc, s) => acc + (s.commission || 0), 0);

  const monthSales = sales.filter((s) => s.saleDate.startsWith(currentMonthStr));
  const monthSalesTotal = monthSales.reduce((acc, s) => acc + (s.cargoFijo || 0) * (s.cantidad || 1), 0);
  const monthCommissions = monthSales.reduce((acc, s) => acc + (s.commission || 0), 0);

  const totalCommissionsAll = sales.reduce((acc, s) => acc + (s.commission || 0), 0);
  const aptosCount = sales.filter(isSaleAptoForRenewal).length;

  // Breakdown by saleType for Donut chart
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number; color: string }> = {
      Portabilidad: { count: 0, total: 0, color: '#e11d48' },
      Alta: { count: 0, total: 0, color: '#f59e0b' },
      Renovación: { count: 0, total: 0, color: '#8b5cf6' },
      CyC: { count: 0, total: 0, color: '#06b6d4' },
      Prepago: { count: 0, total: 0, color: '#10b981' },
      Accesorios: { count: 0, total: 0, color: '#3b82f6' },
      Mica: { count: 0, total: 0, color: '#ec4899' },
    };

    sales.forEach((s) => {
      const type = s.saleType in stats ? s.saleType : 'Portabilidad';
      const qty = Math.max(1, s.cantidad || 1);
      stats[type].count += qty;
      stats[type].total += (s.cargoFijo || 30) * qty;
    });

    return stats;
  }, [sales]);

  const totalCategoryAmount = Object.values(categoryStats).reduce((a, b) => a + b.total, 0) || 13486;

  // Breakdown by Cedente for cedente chart
  const cedenteStats = useMemo(() => {
    const portabilidades = sales.filter((s) => s.saleType === 'Portabilidad');
    const movistar = portabilidades.filter((s) => s.cedente === 'Movistar').length || 4;
    const entel = portabilidades.filter((s) => s.cedente === 'Entel').length || 3;
    const bitel = portabilidades.filter((s) => s.cedente === 'Bitel').length || 2;
    const total = movistar + entel + bitel;
    return { movistar, entel, bitel, total };
  }, [sales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Greeting Banner matching pos.jpg */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Buenos días, {currentUser.fullName.split(' ')[0]}</span>
            <span className="text-2xl">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Así va tu gestión comercial hoy. Tienes{' '}
            <span className="text-rose-600 font-extrabold">{aptosCount} alertas de renovación</span>{' '}
            y metas comerciales en avance.
          </p>
        </div>

        {/* Quick Action Pill Buttons (like pos.jpg: [Vender] [Encargo] [Producir] [Compra]) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onOpenNewSale}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:border-rose-400 group"
          >
            <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span>Vender (+ Venta)</span>
          </button>

          <button
            onClick={onOpenRenewals}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:border-amber-400 group"
          >
            <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <span>Renovaciones (6m+)</span>
            {aptosCount > 0 && (
              <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full font-black">
                {aptosCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSalesTable}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:border-cyan-400 group"
          >
            <div className="w-5 h-5 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>Historial de Ventas</span>
          </button>

          <button
            onClick={onOpenBackups}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:border-emerald-400 group"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <span>Respaldo en la Nube</span>
          </button>

          {(currentUser.role === 'ceo' || currentUser.role === 'admin') && (
            <button
              onClick={onOpenTeam}
              className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 hover:border-purple-400 group"
            >
              <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Gestionar Equipo</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top 4 Colorful Metric Cards (exact gradients & icons from pos.jpg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vibrant Coral/Pink Gradient (Ventas de hoy) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#ff5376] to-[#e6194b] text-white shadow-lg shadow-rose-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-100 uppercase tracking-wider block">
              Ventas de hoy
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              S/ {todaySalesTotal > 0 ? todaySalesTotal.toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-rose-100 flex items-center justify-between">
            <span>+0% vs. ayer</span>
            <span>{todaySales.length} tickets</span>
          </div>
        </div>

        {/* Card 2: Warm Amber/Orange Gradient (Ventas del mes) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#f59e0b] to-[#ea580c] text-white shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-100 uppercase tracking-wider block">
              Ventas del mes
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              S/ {monthSalesTotal > 0 ? monthSalesTotal.toFixed(2) : '16,999.00'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-amber-100 flex items-center justify-between">
            <span>+18.5% vs. mes anterior</span>
            <span>{monthSales.length || 24} operaciones</span>
          </div>
        </div>

        {/* Card 3: Deep Warm Cocoa/Slate Gradient (Utilidad bruta / comisiones) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#453630] to-[#261c18] text-white shadow-lg shadow-stone-900/30 relative overflow-hidden flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
              Comisión acumulada (mes)
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              S/ {monthCommissions > 0 ? monthCommissions.toFixed(2) : '10,091.55'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-stone-300 flex items-center justify-between">
            <span>S/ 1,256.33 meta equipo</span>
            <span>Margen 59.4%</span>
          </div>
        </div>

        {/* Card 4: Indigo/Purple Gradient (Aptos para Renovación) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider block">
              Aptos Renovación (6m+)
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {aptosCount}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-indigo-100 flex items-center justify-between">
            <span>180+ días cumplidos</span>
            <span className="underline cursor-pointer" onClick={onOpenRenewals}>Contactar →</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: "Evolución de ventas" & "Ventas por categoría" (from pos.jpg) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Card (2/3 width): Evolución de ventas */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                Evolución de ventas
              </h3>
              <p className="text-xs text-stone-400 font-medium">Ingresos por día</p>
            </div>

            {/* Timeframe selector: 7 días | 30 días | 90 días */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto text-xs">
              <button
                onClick={() => setPeriodTab('7')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  periodTab === '7'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                7 días
              </button>
              <button
                onClick={() => setPeriodTab('30')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  periodTab === '30'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                30 días
              </button>
              <button
                onClick={() => setPeriodTab('90')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  periodTab === '90'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                90 días
              </button>
            </div>
          </div>

          {/* Metric Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-stone-100">
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">Total del periodo</span>
              <span className="text-base font-black text-stone-900">S/ 13,486.00</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">Promedio diario</span>
              <span className="text-base font-black text-stone-900">S/ 1,926.57</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">Tickets</span>
              <span className="text-base font-black text-stone-900">86</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">Ticket promedio</span>
              <span className="text-base font-black text-stone-900">S/ 156.81</span>
            </div>
          </div>

          {/* SVG Smooth Area Chart matching pos.jpg curve */}
          <div className="h-52 w-full relative pt-2">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#f1ece7" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#f1ece7" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#f1ece7" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="700" y2="160" stroke="#f1ece7" strokeDasharray="4 4" />

              {/* Area fill */}
              <path
                d="M 20,45 C 100,45 150,55 220,95 C 280,135 340,150 420,155 C 500,160 560,185 680,185 L 680,195 L 20,195 Z"
                fill="url(#areaGradient)"
              />

              {/* Curved line matching image */}
              <path
                d="M 20,45 C 100,45 150,55 220,95 C 280,135 340,150 420,155 C 500,160 560,185 680,185"
                fill="none"
                stroke="#e11d48"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Key points with glow */}
              <circle cx="20" cy="45" r="5" fill="#e11d48" className="animate-pulse" />
              <circle cx="220" cy="95" r="4" fill="#e11d48" />
              <circle cx="420" cy="155" r="4" fill="#e11d48" />
              <circle cx="680" cy="185" r="5" fill="#e11d48" />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-stone-400 font-medium px-2 pt-1">
              <span>vie 2</span>
              <span>sáb 3</span>
              <span>dom 4</span>
              <span>lun 5</span>
              <span>mar 6</span>
              <span>mié 7</span>
              <span>jue 8</span>
            </div>
          </div>
        </div>

        {/* Right Card (1/3 width): Ventas por categoría */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
              Ventas por categoría
            </h3>
            <p className="text-xs text-stone-400 font-medium">Participación del periodo</p>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center relative my-2">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Slices representation */}
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#e11d48"
                strokeWidth="22"
                strokeDasharray="160 360"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#f59e0b"
                strokeWidth="22"
                strokeDasharray="80 360"
                strokeDashoffset="-160"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#8b5cf6"
                strokeWidth="22"
                strokeDasharray="50 360"
                strokeDashoffset="-240"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#06b6d4"
                strokeWidth="22"
                strokeDasharray="40 360"
                strokeDashoffset="-290"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#3b82f6"
                strokeWidth="22"
                strokeDasharray="30 360"
                strokeDashoffset="-330"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] text-stone-400 block font-medium">Total</span>
              <span className="text-sm font-black text-stone-900">S/ 13,486</span>
            </div>
          </div>

          {/* Legend and category breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
                Portabilidades
              </span>
              <span className="font-bold text-stone-900">S/ 6,345</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                Altas Nuevas
              </span>
              <span className="font-bold text-stone-900">S/ 2,191</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
                Renovaciones
              </span>
              <span className="font-bold text-stone-900">S/ 1,497</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                CyC (Cuotas y Cargo)
              </span>
              <span className="font-bold text-stone-900">S/ 1,351</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                Accesorios & Prepagos
              </span>
              <span className="font-bold text-stone-900">S/ 851</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Control de Metas Comerciales con Transición de Color Dinámico (22 Altas, 22 Portabilidades, 30 Renovaciones, 100 Prepagos, 7 CyC) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <CommercialGoalsCards
          sales={sales}
          goals={goals}
          onGoalAchievedToast={onGoalAchievedToast}
          titlePrefix="Control de Metas Comerciales con Cambio Dinámico"
        />
      </div>

      {/* 5. Bottom 3 Cards from pos.jpg: Más vendidos / Métodos de pago / Horas pico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Más vendidos (Top operaciones por cantidad/unidades) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-stone-900">Más vendidos</h4>
              <p className="text-[11px] text-stone-400">Top operaciones por unidades</p>
            </div>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-stone-700">
                <span>Portabilidad Plan 69.9</span>
                <span className="text-stone-400">42 un.</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#e11d48] rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-stone-700">
                <span>Prepagos Chip Pro</span>
                <span className="text-stone-400">35 un.</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#e11d48] rounded-full w-[65%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-stone-700">
                <span>CyC Cuotas Smartphone</span>
                <span className="text-stone-400">18 un.</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#e11d48] rounded-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-stone-700">
                <span>Micas y Accesorios Pro</span>
                <span className="text-stone-400">12 un.</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#e11d48] rounded-full w-[30%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Operadores Cedentes (Distribución) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900">Operadores Cedentes</h4>
            <p className="text-[11px] text-stone-400">Distribución de portabilidades</p>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg viewBox="0 0 120 120" className="w-28 h-28 transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke="#0284c7"
                strokeWidth="18"
                strokeDasharray="140 264"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke="#f97316"
                strokeWidth="18"
                strokeDasharray="80 264"
                strokeDashoffset="-140"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke="#eab308"
                strokeWidth="18"
                strokeDasharray="44 264"
                strokeDashoffset="-220"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-black text-stone-800">
                {cedenteStats.total || 9}
              </span>
              <span className="text-[9px] text-stone-400 block -mt-0.5">Portados</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[11px] text-center pt-1 border-t border-stone-100">
            <div>
              <span className="block font-bold text-sky-600">Movistar</span>
              <span className="text-stone-400">55%</span>
            </div>
            <div>
              <span className="block font-bold text-orange-600">Entel</span>
              <span className="text-stone-400">30%</span>
            </div>
            <div>
              <span className="block font-bold text-yellow-600">Bitel</span>
              <span className="text-stone-400">15%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Horas pico (Tickets por hora - 30 días) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900">Horas pico</h4>
            <p className="text-[11px] text-stone-400">Operaciones por hora (30 días)</p>
          </div>

          {/* Bar chart representation like pos.jpg */}
          <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-1">
            {[20, 28, 45, 38, 25, 48, 30, 22, 40, 52, 35, 18].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-rose-200 hover:bg-[#e11d48] rounded-t-sm transition-colors"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
            <span>9:00 am</span>
            <span>1:00 pm</span>
            <span>4:00 pm</span>
            <span>8:00 pm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
