import { AppDatabase, CommercialGoals, DEFAULT_GOALS, Sale, User } from '../types';

const STORAGE_KEY_USER = 'gilvexpro_current_user';
const STORAGE_KEY_LOCK = 'gilvexpro_is_locked';
const STORAGE_KEY_CACHE_SALES = 'gilvexpro_cached_sales';
const STORAGE_KEY_CACHE_USERS = 'gilvexpro_cached_users';

export const api = {
  // Auth
  async login(username: string, password: string):Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    return data;
  },

  async registerAdvisor(payload: {
    fullName: string;
    username: string;
    password: string;
    assignedAdminId?: string;
  }): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/register-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar asesor');
    }
    return data;
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_LOCK);
    }
  },

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        localStorage.setItem(STORAGE_KEY_CACHE_USERS, JSON.stringify(users));
        return users;
      }
    } catch (e) {
      console.warn('Network issue fetching users, reading cache:', e);
    }
    const cached = localStorage.getItem(STORAGE_KEY_CACHE_USERS);
    return cached ? JSON.parse(cached) : [];
  },

  async createUser(user: Partial<User> & { password: string }): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const sales = await res.json();
        localStorage.setItem(STORAGE_KEY_CACHE_SALES, JSON.stringify(sales));
        return sales;
      }
    } catch (e) {
      console.warn('Network issue fetching sales, reading cache:', e);
    }
    const cached = localStorage.getItem(STORAGE_KEY_CACHE_SALES);
    return cached ? JSON.parse(cached) : [];
  },

  async createSale(sale: Partial<Sale>): Promise<Sale> {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar venta');
    return data;
  },

  async updateSale(id: string, sale: Partial<Sale>): Promise<Sale> {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar venta');
    return data;
  },

  async deleteSale(id: string): Promise<void> {
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar venta');
  },

  async markSaleRenewed(id: string): Promise<Sale> {
    const res = await fetch(`/api/sales/${id}/mark-renewed`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al marcar renovación');
    return data.sale;
  },

  // Goals
  async getGoals(): Promise<CommercialGoals> {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return DEFAULT_GOALS;
  },

  async updateGoals(goals: CommercialGoals): Promise<CommercialGoals> {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals),
    });
    return await res.json();
  },

  // Backups
  async getBackups() {
    const res = await fetch('/api/backups');
    return await res.json();
  },

  async triggerBackup() {
    const res = await fetch('/api/backups/trigger', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al generar respaldo');
    return data;
  },

  async restoreBackup(filename: string) {
    const res = await fetch(`/api/backups/restore/${filename}`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al restaurar respaldo');
    return data;
  },

  async importDatabase(dbData: AppDatabase) {
    const res = await fetch('/api/database/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dbData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar respaldo');
    return data;
  },

  async checkServerHealth() {
    try {
      const res = await fetch('/api/health');
      return res.ok;
    } catch {
      return false;
    }
  },
};
