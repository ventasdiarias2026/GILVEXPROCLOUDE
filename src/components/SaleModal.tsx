import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, User, Phone, FileText, Smartphone, Shield, AlertCircle, Plus, Minus, Hash } from 'lucide-react';
import { OperatorCedente, Sale, SaleType, User as UserType, VALID_CARGOS_FIJOS } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Partial<Sale>) => Promise<void>;
  editingSale?: Sale | null;
  currentUser: UserType;
  teamAdvisors?: UserType[];
  prefilledData?: Partial<Sale> | null;
}

const SALE_TYPES: { type: SaleType; label: string; desc: string; unitPriceDesc: string }[] = [
  { type: 'Portabilidad', label: 'Portabilidad', desc: '10% de Cargo Fijo • Requiere Cedente', unitPriceDesc: '10% de cargo fijo' },
  { type: 'Alta', label: 'Alta Nueva', desc: 'S/ 0.00 • Requiere Cargo Fijo', unitPriceDesc: 'S/ 0.00' },
  { type: 'Renovación', label: 'Renovación', desc: 'S/ 0.00 • Requiere Cargo Fijo', unitPriceDesc: 'S/ 0.00' },
  { type: 'CyC', label: 'CyC (Cuotas y Cargo)', desc: 'S/ 30.00 comisión fija por unidad', unitPriceDesc: 'S/ 30.00 c/u' },
  { type: 'Mica', label: 'Mica', desc: 'S/ 5.00 comisión fija por unidad', unitPriceDesc: 'S/ 5.00 c/u' },
  { type: 'Accesorios', label: 'Accesorios', desc: 'S/ 10.00 comisión fija por unidad', unitPriceDesc: 'S/ 10.00 c/u' },
  { type: 'Prepago', label: 'Prepago', desc: 'S/ 1.00 comisión fija por chip', unitPriceDesc: 'S/ 1.00 c/u' },
];

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSale,
  currentUser,
  teamAdvisors = [],
  prefilledData,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [saleType, setSaleType] = useState<SaleType>('Portabilidad');
  const [cantidad, setCantidad] = useState<number>(1); // NUEVA OPCIÓN DE CANTIDAD
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [cargoFijo, setCargoFijo] = useState<number | ''>(49.9);
  const [cedente, setCedente] = useState<OperatorCedente>('Movistar');
  const [saleDate, setSaleDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>(currentUser.id);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opened or editing
  useEffect(() => {
    if (editingSale) {
      setSaleType(editingSale.saleType);
      setCantidad(editingSale.cantidad || 1);
      setClientName(editingSale.clientName);
      setClientDni(editingSale.clientDni);
      setClientPhone(editingSale.clientPhone);
      setCargoFijo(editingSale.cargoFijo ?? '');
      setCedente(editingSale.cedente || 'Movistar');
      setSaleDate(editingSale.saleDate || todayStr);
      setNotes(editingSale.notes || '');
      setSelectedAdvisorId(editingSale.advisorId || currentUser.id);
      setError(null);
    } else if (prefilledData) {
      setSaleType(prefilledData.saleType || 'Renovación');
      setCantidad(prefilledData.cantidad || 1);
      setClientName(prefilledData.clientName || '');
      setClientDni(prefilledData.clientDni || '');
      setClientPhone(prefilledData.clientPhone || '');
      setCargoFijo(prefilledData.cargoFijo ?? 49.9);
      setCedente(prefilledData.cedente || 'Movistar');
      setSaleDate(todayStr);
      setNotes(prefilledData.notes || 'Renovación generada desde Alerta de 6 Meses');
      setSelectedAdvisorId(currentUser.id);
      setError(null);
    } else {
      // Reset defaults
      setSaleType('Portabilidad');
      setCantidad(1);
      setClientName('');
      setClientDni('');
      setClientPhone('');
      setCargoFijo(49.9);
      setCedente('Movistar');
      setSaleDate(todayStr);
      setNotes('');
      setSelectedAdvisorId(currentUser.id);
      setError(null);
    }
  }, [editingSale, prefilledData, isOpen, currentUser.id, todayStr]);

  if (!isOpen) return null;

  // Real-time calculated commission per unit
  const getUnitCommission = (): number => {
    switch (saleType) {
      case 'Portabilidad':
        if (typeof cargoFijo === 'number' && cargoFijo > 0) {
          return Math.round((cargoFijo * 0.1) * 100) / 100;
        }
        return 0;
      case 'Alta':
      case 'Renovación':
        return 0;
      case 'CyC':
        return 30.0;
      case 'Mica':
        return 5.0;
      case 'Accesorios':
        return 10.0;
      case 'Prepago':
        return 1.0;
      default:
        return 0;
    }
  };

  const unitCommission = getUnitCommission();
  const totalCommission = (unitCommission * (Math.max(1, cantidad) || 1)).toFixed(2);

  const showCargoFijo = ['Portabilidad', 'Alta', 'Renovación'].includes(saleType);
  const showCedente = saleType === 'Portabilidad';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!clientName.trim()) {
      setError('El nombre completo del cliente es obligatorio.');
      return;
    }
    if (!clientDni.trim() || clientDni.trim().length < 8) {
      setError('El DNI debe tener al menos 8 dígitos.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 9) {
      setError('El teléfono o celular debe tener al menos 9 dígitos.');
      return;
    }
    if (!saleDate) {
      setError('La fecha de la venta es obligatoria.');
      return;
    }

    if (showCargoFijo && (cargoFijo === '' || isNaN(Number(cargoFijo)))) {
      setError(`Debe seleccionar un Cargo Fijo válido para ventas de tipo ${saleType}.`);
      return;
    }

    if (showCedente && !cedente) {
      setError('El operador cedente (Movistar, Entel o Bitel) es obligatorio en Portabilidad.');
      return;
    }

    const safeCantidad = Math.max(1, Number(cantidad) || 1);

    // Determine advisor details
    const selectedAdvisor = teamAdvisors.find((a) => a.id === selectedAdvisorId) || currentUser;

    setIsSubmitting(true);
    try {
      await onSave({
        saleType,
        cantidad: safeCantidad,
        clientName: clientName.trim(),
        clientDni: clientDni.trim(),
        clientPhone: clientPhone.trim(),
        cargoFijo: showCargoFijo ? Number(cargoFijo) : null,
        cedente: showCedente ? cedente : null,
        saleDate,
        notes: notes.trim(),
        advisorId: selectedAdvisor.id,
        advisorUsername: selectedAdvisor.username,
        advisorFullName: selectedAdvisor.fullName,
        renewedFromSaleId: prefilledData?.renewedFromSaleId,
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar venta';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-800">
        {/* Header matching pos.jpg style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf7f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                {editingSale ? 'Editar Venta Registrada' : 'Registrar Nueva Operación'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                GILVEXPRO CLOUD • Formulario comercial con opción de cantidad y comisiones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Selector de Asesor (si es CEO o Admin) */}
          {(currentUser.role === 'ceo' || currentUser.role === 'admin') && teamAdvisors.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Asesor Responsable
              </label>
              <select
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-medium"
              >
                <option value={currentUser.id}>
                  {currentUser.fullName} ({currentUser.role === 'ceo' ? 'CEO' : 'Administrador'} - Tú)
                </option>
                {teamAdvisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.fullName} (@{adv.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de Venta (7 opciones exactas) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Tipo de Operación Comercial <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SALE_TYPES.map((item) => {
                const isSelected = saleType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSaleType(item.type)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm ring-1 ring-rose-500'
                        : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold truncate flex items-center justify-between">
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CANTIDAD - NUEVA OPCIÓN SOLICITADA */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-rose-600" />
                  Cantidad de Operaciones / Unidades <span className="text-rose-600">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Indica cuántos chips, micas, contratos o equipos se vendieron en esta transacción.
                </p>
              </div>

              {/* Counter Input with - / + buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-rose-300 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-600 flex items-center justify-center font-bold transition-colors"
                  title="Disminuir cantidad"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center text-stone-900 font-extrabold text-base focus:outline-none bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setCantidad((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-600 flex items-center justify-center font-bold transition-colors"
                  title="Aumentar cantidad"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Fields: Cargo Fijo & Cedente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showCargoFijo ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Cargo Fijo Mensual (Tarifa) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={cargoFijo}
                  onChange={(e) => setCargoFijo(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                >
                  <option value="">Seleccione una tarifa oficial...</option>
                  {VALID_CARGOS_FIJOS.map((tarifa) => (
                    <option key={tarifa} value={tarifa}>
                      S/ {tarifa.toFixed(2)} mensual
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Tarifas oficiales homologadas para {saleType}.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 text-stone-400 text-xs">
                <span>🚫 Cargo Fijo: No aplica para {saleType} (Oculto).</span>
              </div>
            )}

            {showCedente ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Operador Cedente <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={cedente}
                  onChange={(e) => setCedente(e.target.value as OperatorCedente)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                >
                  <option value="Movistar">Movistar</option>
                  <option value="Entel">Entel</option>
                  <option value="Bitel">Bitel</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Operador de origen de la línea portada.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 text-stone-400 text-xs">
                <span>🚫 Operador Cedente: No aplica para {saleType} (Oculto).</span>
              </div>
            )}
          </div>

          {/* Live Calculated Commission Indicator (incorporating Cantidad) */}
          <div className="p-4 rounded-2xl bg-[#faf7f5] border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Comisión Total Calculada
                </span>
                <p className="text-[11px] text-stone-500 font-medium">
                  {cantidad > 1 ? (
                    <>
                      {cantidad} unidades × S/ {unitCommission.toFixed(2)} = Total S/ {totalCommission}
                    </>
                  ) : (
                    <>
                      {saleType === 'Portabilidad'
                        ? '10% del Cargo Fijo mensual contratado'
                        : saleType === 'CyC'
                        ? 'S/ 30.00 comisionado por cuotas y cargo'
                        : saleType === 'Mica'
                        ? 'S/ 5.00 comisión fija por mica'
                        : saleType === 'Accesorios'
                        ? 'S/ 10.00 comisión fija por accesorio'
                        : saleType === 'Prepago'
                        ? 'S/ 1.00 comisión fija por chip'
                        : 'Regla comercial estándar (S/ 0.00)'}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-700">
                S/ {totalCommission}
              </span>
            </div>
          </div>

          {/* Datos del Cliente: Nombre, DNI, Teléfono */}
          <div className="pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-rose-500" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre Completo del Cliente <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Juan Carlos Quispe Romero"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  DNI (8 dígitos) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={clientDni}
                  onChange={(e) => setClientDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 45892147"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Teléfono / Celular (9 dígitos) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 984521741"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Fecha de la Venta (Editable) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observaciones o Notas Comerciales (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Equipo financiado a 12 cuotas / Trámite presencial / Promoción especial"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Guardando...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingSale ? 'Actualizar Venta' : 'Registrar Venta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
