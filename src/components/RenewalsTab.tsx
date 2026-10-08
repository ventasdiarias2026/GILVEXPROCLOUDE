import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Calendar,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Sale } from '../types';
import {
  calculateRenewalStatus,
  generateWhatsAppRenewalUrl,
  isSaleAptoForRenewal,
} from '../utils/renewals';

interface RenewalsTabProps {
  sales: Sale[];
  onProcessRenewal: (sale: Sale) => void;
  onMarkRenewed: (saleId: string) => Promise<void>;
}

export const RenewalsTab: React.FC<RenewalsTabProps> = ({
  sales,
  onProcessRenewal,
  onMarkRenewed,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const aptosSales = sales.filter((sale) => {
    if (!isSaleAptoForRenewal(sale)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        sale.clientName.toLowerCase().includes(q) ||
        sale.clientDni.includes(q) ||
        sale.clientPhone.includes(q) ||
        sale.advisorFullName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickMarkRenewed = async (saleId: string) => {
    setProcessingId(saleId);
    try {
      await onMarkRenewed(saleId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card matching pos.jpg */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Módulo de Retención y Renovación Proactiva
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Aptos para Renovación (6+ Meses de Antigüedad)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1 max-w-2xl">
              Clientes que contrataron Portabilidad o Alta hace 180 días o más. Ya tienen disponible
              la renovación de equipo Smartphone con beneficios preferenciales.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center text-xl font-black shadow-md">
              {aptosSales.length}
            </div>
            <div>
              <span className="text-xs text-stone-400 block font-medium">Clientes Elegibles</span>
              <span className="text-sm font-extrabold text-stone-900">Listos para Contactar</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-5 relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar clientes aptos por Nombre, DNI o Celular..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Clients */}
      {aptosSales.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            No hay clientes pendientes de renovación por el momento
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            El sistema continuará evaluando continuamente la antigüedad de cada Portabilidad y Alta,
            notificándote de inmediato apenas un cliente cumpla los 180 días.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aptosSales.map((sale) => {
            const status = calculateRenewalStatus(sale.saleDate, sale.isRenewed);
            const waUrl = generateWhatsAppRenewalUrl(sale);

            return (
              <div
                key={sale.id}
                className="bg-white border border-stone-200/90 hover:border-rose-400 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
                      🎯 Apto ({status.formattedTime})
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono font-medium">
                      {status.totalDays} días
                    </span>
                  </div>

                  {/* Customer Info */}
                  <h3 className="text-base font-extrabold text-stone-900 group-hover:text-rose-600 transition-colors">
                    {sale.clientName}
                  </h3>

                  <div className="space-y-1.5 mt-2.5 text-xs text-stone-600">
                    <div className="flex items-center gap-2 text-stone-400 font-mono">
                      <span>DNI: {sale.clientDni}</span>
                      <span>•</span>
                      <span>Cel: {sale.clientPhone}</span>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between">
                      <span className="text-stone-500 text-xs font-medium">Plan Actual:</span>
                      <span className="font-extrabold text-stone-900">
                        {sale.cargoFijo ? `S/ ${sale.cargoFijo.toFixed(2)} mensual` : 'Sin plan fijo'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>Venta original: {sale.saleDate}</span>
                      <span>Asesor: {sale.advisorFullName}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-2">
                  {/* WhatsApp button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Contactar por WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-emerald-200" />
                  </a>

                  {/* Button Procesar Renovación (preloaded) */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onProcessRenewal(sale)}
                      className="flex-1 py-2 px-3 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Procesar Renovación (1 Clic)
                    </button>

                    <button
                      onClick={() => handleQuickMarkRenewed(sale.id)}
                      disabled={processingId === sale.id}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                      title="Marcar como ya atendido/renovado directamente"
                    >
                      <CheckCircle className="w-4 h-4 text-stone-400 hover:text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
