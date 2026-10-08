import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  MessageCircle,
  Calendar,
  Sparkles,
  User,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { Sale, SaleType, User as UserType } from '../types';
import { calculateRenewalStatus, generateWhatsAppRenewalUrl, isSaleAptoForRenewal } from '../utils/renewals';

interface SalesTableProps {
  sales: Sale[];
  currentUser: UserType;
  teamAdvisors: UserType[];
  onNewSale: () => void;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
  onOpenRenewalsTab?: () => void;
  selectedAdvisorFilter: string;
  onSelectAdvisorFilter: (advisorId: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  currentUser,
  teamAdvisors,
  onNewSale,
  onEditSale,
  onDeleteSale,
  selectedAdvisorFilter,
  onSelectAdvisorFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      // 1. Advisor filter
      if (selectedAdvisorFilter !== 'ALL') {
        if (s.advisorId !== selectedAdvisorFilter) return false;
      } else if (currentUser.role === 'advisor') {
        if (s.advisorId !== currentUser.id) return false;
      }

      // 2. Type filter
      if (selectedType !== 'ALL' && s.saleType !== selectedType) {
        return false;
      }

      // 3. Period filter
      if (selectedPeriod === 'today') {
        if (s.saleDate !== todayStr) return false;
      } else if (selectedPeriod === 'week') {
        if (s.saleDate < startOfWeekStr || s.saleDate > todayStr) return false;
      } else if (selectedPeriod === 'month') {
        if (!s.saleDate.startsWith(currentMonthPrefix)) return false;
      } else if (selectedPeriod === 'prev_month') {
        if (!s.saleDate.startsWith(prevMonthPrefix)) return false;
      }

      // 4. Search term (Client Name, DNI, Phone, Advisor)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = s.clientName.toLowerCase().includes(query);
        const matchDni = s.clientDni.includes(query);
        const matchPhone = s.clientPhone.includes(query);
        const matchAdvisor = s.advisorFullName.toLowerCase().includes(query);
        if (!matchName && !matchDni && !matchPhone && !matchAdvisor) {
          return false;
        }
      }

      return true;
    });
  }, [
    sales,
    selectedAdvisorFilter,
    currentUser.role,
    currentUser.id,
    selectedType,
    selectedPeriod,
    searchTerm,
    todayStr,
    startOfWeekStr,
    currentMonthPrefix,
    prevMonthPrefix,
  ]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (filteredSales.length === 0) return;

    const headers = [
      'ID Venta',
      'Fecha',
      'Asesor',
      'Tipo de Venta',
      'Cantidad',
      'Cliente',
      'DNI',
      'Teléfono',
      'Cargo Fijo (S/)',
      'Operador Cedente',
      'Comisión Total (S/)',
      'Estado Renovación',
      'Notas',
    ];

    const rows = filteredSales.map((s) => {
      const renewal = calculateRenewalStatus(s.saleDate, s.isRenewed);
      const renewalText = s.isRenewed
        ? 'Renovado'
        : renewal.isApto
        ? `Apto (${renewal.formattedTime})`
        : 'Vigente';

      return [
        s.id,
        s.saleDate,
        `"${s.advisorFullName}"`,
        s.saleType,
        s.cantidad || 1,
        `"${s.clientName}"`,
        `'${s.clientDni}`,
        `'${s.clientPhone}`,
        s.cargoFijo ? s.cargoFijo.toFixed(2) : '-',
        s.cedente || '-',
        s.commission.toFixed(2),
        renewalText,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GILVEXPRO_Ventas_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCommissions = filteredSales.reduce((sum, s) => sum + (s.commission || 0), 0);
  const totalItemsCount = filteredSales.reduce((sum, s) => sum + (s.cantidad || 1), 0);

  return (
    <div className="space-y-4">
      {/* Control bar: search, filters, actions matching pos.jpg */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nombre, DNI, Teléfono o Asesor..."
            className="w-full bg-stone-50/70 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Middle: Selectors (Tipo, Periodo, Asesor) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo de venta */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="Portabilidad">Portabilidad</option>
            <option value="Alta">Alta</option>
            <option value="Renovación">Renovación</option>
            <option value="CyC">CyC (Cuotas y Cargo)</option>
            <option value="Mica">Mica</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Prepago">Prepago</option>
          </select>

          {/* Periodo */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-medium"
          >
            <option value="month">Este Mes</option>
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="prev_month">Mes Anterior</option>
            <option value="all">Todo el Historial</option>
          </select>

          {/* Asesor selector (only CEO or Admin) */}
          {(currentUser.role === 'ceo' || currentUser.role === 'admin') && (
            <select
              value={selectedAdvisorFilter}
              onChange={(e) => onSelectAdvisorFilter(e.target.value)}
              className="bg-stone-50 border border-rose-200 text-rose-800 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-bold"
            >
              <option value="ALL">
                {currentUser.role === 'ceo' ? '🌐 Vista Global (Todos)' : '👥 Mi Equipo'}
              </option>
              {currentUser.role === 'ceo' && (
                <option value={currentUser.id}>Solo Gilberto (CEO)</option>
              )}
              {teamAdvisors.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.fullName} (@{adv.username})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredSales.length === 0}
            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 disabled:opacity-40 text-stone-700 text-xs sm:text-sm font-bold rounded-xl border border-stone-200 transition-all flex items-center gap-1.5 shadow-sm"
            title="Descargar reporte en formato Excel / CSV con UTF-8"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>

          <button
            onClick={onNewSale}
            className="px-4.5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Operaciones:</span>
          <span className="text-base font-black text-stone-900">{filteredSales.length} tickets</span>
        </div>
        <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Unidades Totales:</span>
          <span className="text-base font-black text-rose-600">{totalItemsCount} un.</span>
        </div>
        <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Comisiones:</span>
          <span className="text-base font-black text-emerald-600">S/ {totalCommissions.toFixed(2)}</span>
        </div>
        <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Aptos a Renovación:</span>
          <span className="text-base font-black text-amber-600">
            {filteredSales.filter(isSaleAptoForRenewal).length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#faf6f3] border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Asesor</th>
                <th className="py-3.5 px-4">Operación</th>
                <th className="py-3.5 px-3 text-center">Cant.</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Plan / Tarifa</th>
                <th className="py-3.5 px-4">Cedente</th>
                <th className="py-3.5 px-4 text-right">Comisión</th>
                <th className="py-3.5 px-4 text-center">Alerta Renovación</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    <p className="text-base font-bold text-stone-700 mb-1">
                      No se encontraron operaciones registradas
                    </p>
                    <p className="text-xs">
                      Ajusta los filtros o haz clic en "+ Nueva Venta" para comenzar.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const renewal = calculateRenewalStatus(sale.saleDate, sale.isRenewed);
                  const isApto = isSaleAptoForRenewal(sale);
                  const waUrl = generateWhatsAppRenewalUrl(sale);

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Fecha */}
                      <td className="py-3.5 px-4 font-mono text-stone-700 whitespace-nowrap font-medium">
                        {sale.saleDate}
                      </td>

                      {/* Asesor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold flex items-center justify-center text-xs">
                            {sale.advisorFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 truncate max-w-[130px]">
                              {sale.advisorFullName}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              @{sale.advisorUsername}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tipo de Operación */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold ${
                            sale.saleType === 'Portabilidad'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : sale.saleType === 'Alta'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : sale.saleType === 'Renovación'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : sale.saleType === 'CyC'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : sale.saleType === 'Mica'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : sale.saleType === 'Accesorios'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {sale.saleType}
                        </span>
                      </td>

                      {/* Cantidad - NUEVA COLUMNA */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black bg-stone-100 text-stone-800">
                          {sale.cantidad || 1} un.
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{sale.clientName}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>DNI: {sale.clientDni}</span>
                          <span>•</span>
                          <span>Cel: {sale.clientPhone}</span>
                        </div>
                      </td>

                      {/* Cargo Fijo */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-stone-700">
                        {sale.cargoFijo ? (
                          <span className="font-extrabold text-stone-900">
                            S/ {sale.cargoFijo.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs italic">-</span>
                        )}
                      </td>

                      {/* Cedente */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {sale.cedente ? (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                              sale.cedente === 'Movistar'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : sale.cedente === 'Entel'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}
                          >
                            {sale.cedente}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs italic">-</span>
                        )}
                      </td>

                      {/* Comisión */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-black text-emerald-700 text-sm">
                        S/ {sale.commission.toFixed(2)}
                      </td>

                      {/* Insignia Alerta Renovación (6 meses) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {sale.isRenewed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Renovado
                          </span>
                        ) : isApto ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 shadow-sm animate-pulse"
                            title="Cumplió 6 meses o más (180 días) desde su contratación"
                          >
                            🎯 Apto ({renewal.formattedTime})
                          </span>
                        ) : ['Portabilidad', 'Alta'].includes(sale.saleType) ? (
                          <span className="text-[11px] text-stone-400 font-medium">
                            {renewal.formattedTime} (Vigente)
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Acciones: Editar, Eliminar */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isApto && !sale.isRenewed && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Contactar por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => onEditSale(sale)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors"
                            title="Editar venta (✏️)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(sale.id)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                            title="Eliminar venta (🗑️)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 mb-2">
              ¿Eliminar esta venta?
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Esta acción no se puede deshacer. Se actualizarán las metas y comisiones asociadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteSale(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl text-xs font-black shadow-md shadow-rose-500/30"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
