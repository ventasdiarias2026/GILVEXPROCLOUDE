export type UserRole = 'ceo' | 'admin' | 'advisor';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
  createdBy?: string;
  assignedAdminId?: string; // which admin manages this advisor
  createdAt: string;
  active: boolean;
}

export type SaleType =
  | 'Portabilidad'
  | 'Alta'
  | 'Renovación'
  | 'CyC'
  | 'Mica'
  | 'Accesorios'
  | 'Prepago';

export type OperatorCedente = 'Movistar' | 'Entel' | 'Bitel';

export const VALID_CARGOS_FIJOS = [
  29.9, 39.9, 49.9, 54.9, 69.9, 70, 79.9, 89, 89.9, 95.9, 99, 109.9, 170,
] as const;

export interface Sale {
  id: string;
  advisorId: string;
  advisorUsername: string;
  advisorFullName: string;
  adminId?: string; // admin who oversees advisor
  saleType: SaleType;
  cantidad: number; // NUEVA OPCIÓN DE CANTIDAD
  clientName: string;
  clientDni: string;
  clientPhone: string;
  cargoFijo: number | null;
  cedente: OperatorCedente | null;
  commission: number;
  saleDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
  notes?: string;
  renewedFromSaleId?: string;
  isRenewed?: boolean;
}

export interface CommercialGoals {
  altas: number;
  portabilidades: number;
  renovaciones: number;
  prepagos: number;
  cyc: number;
}

export const DEFAULT_GOALS: CommercialGoals = {
  altas: 22,
  portabilidades: 22,
  renovaciones: 30,
  prepagos: 100,
  cyc: 7,
};

export interface BackupItem {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  salesCount: number;
  usersCount: number;
  type: 'auto' | 'manual';
}

export interface AppDatabase {
  users: User[];
  sales: Sale[];
  goals: CommercialGoals;
  lastBackupAt?: string;
}
