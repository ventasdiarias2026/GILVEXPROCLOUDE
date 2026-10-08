import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  X,
  Trash2,
  Lock,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onCreateUser: (data: Partial<User> & { password: string }) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Create form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(currentUser.role === 'ceo' ? 'admin' : 'advisor');
  const [assignedAdminId, setAssignedAdminId] = useState<string>(currentUser.id);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const adminsList = users.filter((u) => u.role === 'admin' || u.role === 'ceo');

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateUser({
        fullName: fullName.trim(),
        username: username.trim(),
        password: password.trim(),
        role,
        assignedAdminId: role === 'advisor' ? assignedAdminId : undefined,
        createdBy: currentUser.id,
      });

      setFullName('');
      setUsername('');
      setPassword('');
      setActiveTab('list');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (user.username.toLowerCase() === 'gilberto') return;
    try {
      await onUpdateUser(user.id, { active: !user.active });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleDelete = async (user: User) => {
    if (user.username.toLowerCase() === 'gilberto') {
      alert('No es posible eliminar al Administrador Principal Gilberto.');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.fullName} (@${user.username})?`)) {
      try {
        await onDeleteUser(user.id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 bg-[#faf7f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                Gestión de Jerarquía & Equipo Comercial
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {currentUser.role === 'ceo'
                  ? '👑 Vista CEO: Puedes crear Administradores y Asesores de Venta'
                  : '🛡️ Vista Administrador: Puedes crear y gestionar Asesores para tu equipo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 flex gap-2 border-b border-stone-100 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-[#e11d48] text-[#e11d48]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Equipo Registrado ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-[#e11d48] text-[#e11d48]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {currentUser.role === 'ceo' ? 'Crear Administrador / Asesor' : 'Crear Asesor de Ventas'}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-400 bg-stone-50">
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Rol / Jerarquía</th>
                      <th className="py-3 px-4">Supervisor / Asignación</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map((user) => {
                      const supervisor = users.find((u) => u.id === user.assignedAdminId);
                      const isCEO = user.role === 'ceo' || user.username.toLowerCase() === 'gilberto';

                      return (
                        <tr key={user.id} className="hover:bg-stone-50/80">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${
                                  isCEO
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : user.role === 'admin'
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                    : 'bg-stone-100 text-stone-800 border border-stone-200'
                                }`}
                              >
                                {isCEO ? '👑' : user.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                  <span>{user.fullName}</span>
                                  {isCEO && (
                                    <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-md">
                                      CEO GILBERTO
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-400 font-mono font-medium">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                                isCEO
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : user.role === 'admin'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isCEO ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                              {isCEO ? 'CEO General' : user.role === 'admin' ? 'Administrador' : 'Asesor de Ventas'}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-stone-500 text-xs font-medium">
                            {isCEO ? (
                              <span className="text-amber-700 font-bold">Titular Máximo</span>
                            ) : supervisor ? (
                              <span>Supervisado por {supervisor.fullName}</span>
                            ) : (
                              <span>Directo de Dirección</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              disabled={isCEO}
                              onClick={() => handleToggleActive(user)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                user.active
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {user.active ? 'Activo 🟢' : 'Inactivo 🔴'}
                            </button>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-center">
                            {!isCEO && (currentUser.role === 'ceo' || currentUser.id === user.createdBy) && (
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="max-w-lg mx-auto space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Roberto Sánchez"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Nombre de Usuario (Para Iniciar Sesión) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  placeholder="Ej. rsanchez o roberto.ventas"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Contraseña de Acceso <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña inicial para el usuario"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>

              {currentUser.role === 'ceo' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Nivel de Jerarquía <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        role === 'admin'
                          ? 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <div className="font-extrabold text-xs">🛡️ Administrador</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Supervisa su equipo y crea sus propios asesores
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('advisor')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        role === 'advisor'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <div className="font-extrabold text-xs">💼 Asesor de Ventas</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Registra ventas y ve su propio espacio privado
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500">
                  <span>Rol asignado: <strong>💼 Asesor de Ventas</strong> (Bajo tu supervisión directa).</span>
                </div>
              )}

              {role === 'advisor' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    Administrador Supervisor
                  </label>
                  <select
                    value={assignedAdminId}
                    onChange={(e) => setAssignedAdminId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                  >
                    {adminsList.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.fullName} ({adm.role === 'ceo' ? 'CEO General' : 'Administrador'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
