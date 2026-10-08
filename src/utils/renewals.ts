import { Sale } from '../types';

export interface RenewalStatus {
  isApto: boolean;
  totalDays: number;
  months: number;
  remainingDays: number;
  formattedTime: string;
}

export function calculateRenewalStatus(saleDateStr: string, isRenewed?: boolean): RenewalStatus {
  if (isRenewed) {
    return {
      isApto: false,
      totalDays: 0,
      months: 0,
      remainingDays: 0,
      formattedTime: 'Ya Renovado',
    };
  }

  const [year, month, day] = saleDateStr.split('-').map(Number);
  if (!year || !month || !day) {
    return {
      isApto: false,
      totalDays: 0,
      months: 0,
      remainingDays: 0,
      formattedTime: 'Fecha no válida',
    };
  }

  const saleDate = new Date(year, month - 1, day);
  const now = new Date();
  
  // Difference in milliseconds
  const diffTime = now.getTime() - saleDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays < 0) {
    return {
      isApto: false,
      totalDays,
      months: 0,
      remainingDays: 0,
      formattedTime: 'Fecha futura',
    };
  }

  const months = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  const formattedTime =
    months > 0
      ? `${months} mes${months > 1 ? 'es' : ''}${remainingDays > 0 ? ` y ${remainingDays} d` : ''}`
      : `${totalDays} días`;

  const isApto = totalDays >= 180; // 6 months or more

  return {
    isApto,
    totalDays,
    months,
    remainingDays,
    formattedTime,
  };
}

export function isSaleAptoForRenewal(sale: Sale): boolean {
  if (sale.isRenewed) return false;
  if (!['Portabilidad', 'Alta'].includes(sale.saleType)) return false;
  const status = calculateRenewalStatus(sale.saleDate, sale.isRenewed);
  return status.isApto;
}

export function generateWhatsAppRenewalUrl(sale: Sale): string {
  // Clean phone number
  const cleanPhone = sale.clientPhone.replace(/\D/g, '');
  const phone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
  
  const status = calculateRenewalStatus(sale.saleDate, sale.isRenewed);
  const planText = sale.cargoFijo ? `S/ ${sale.cargoFijo.toFixed(2)}` : 'su plan actual';

  const message = `Hola ${sale.clientName}, un cordial saludo de GILVEXPRO CLOUD. 🌟\n\nLe informamos que su línea ya cumplió ${status.months} meses desde su activación y cuenta con una súper promoción exclusiva para renovar su equipo Smartphone con beneficios preferenciales en ${planText}.\n\n¿Desea que le compartamos el catálogo de equipos disponibles hoy con cuota cero o descuento de renovación? 📲`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
