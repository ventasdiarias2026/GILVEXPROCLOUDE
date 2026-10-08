import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { CommercialGoals, DEFAULT_GOALS, Sale, User } from './types';
import { useInactivityLock } from './hooks/useInactivityLock';
import { isSaleAptoForRenewal } from './utils/renewals';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { LockScreenModal } from './components/LockScreenModal';
import { RenewalAlertBanner } from './components/RenewalAlertBanner';
import { SalesTable } from './components/SalesTable';
import { SaleModal } from './components/SaleModal';
import { RenewalsTab } from './components/RenewalsTab';
import { CommercialGoalsCards } from './components/CommercialGoalsCards';
import { TeamManagementModal } from './components/TeamManagementModal';
import { BackupManagementModal } from './components/BackupManagementModal';
import { Sparkles, X, Users } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [goals, setGoals] = useState<CommercialGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState<boolean>(true);

  // Views matching sidebar navigation
  const [activeView, setActiveView] = useState<'dashboard' | 'operations' | 'renewals' | 'team' | 'goals'>('dashboard');
  const [selectedAdvisorFilter, setSelectedAdvisorFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [prefilledSaleData, setPrefilledSaleData] = useState<Partial<Sale> | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 5000);
  };

  // Inactivity Lock (60 seconds idle timeout, active when logged in)
  const { isLocked, lockSession, unlockSession, secondsRemaining } = useInactivityLock(
    60 * 1000,
    !!currentUser
  );

  // Load initial data from Cloud Backend
  const loadData = useCallback(async () => {
    try {
      const [fetchedSales, fetchedUsers, fetchedGoals] = await Promise.all([
        api.getSales(),
        api.getUsers(),
        api.getGoals(),
      ]);
      setSales(fetchedSales || []);
      setUsers(fetchedUsers || []);
      setGoals(fetchedGoals || DEFAULT_GOALS);
    } catch (err) {
      console.error('Error loading data from cloud backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();

      // Cloud synchronization polling every 25 seconds for multi-device sync
      const syncInterval = window.setInterval(() => {
        loadData();
      }, 25000);

      return () => window.clearInterval(syncInterval);
    }
  }, [currentUser, loadData]);

  // Auth handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    api.setCurrentUser(user);
    showToast(`¡Bienvenido a GILVEXPRO CLOUD, ${user.fullName}! 🚀`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    api.setCurrentUser(null);
    unlockSession();
  };

  // Sales CRUD handlers
  const handleSaveSale = async (saleData: Partial<Sale>) => {
    if (editingSale) {
      const updated = await api.updateSale(editingSale.id, saleData);
      setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast('¡Venta actualizada exitosamente! 📝');
    } else {
      const created = await api.createSale(saleData);
      setSales((prev) => [created, ...prev]);
      showToast(`¡Venta de ${created.saleType} (${created.cantidad || 1} un.) registrada exitosamente! 🎉`);
    }
    loadData();
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      await api.deleteSale(saleId);
      setSales((prev) => prev.filter((s) => s.id !== saleId));
      showToast('Venta eliminada del registro comercial. 🗑️');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar venta');
    }
  };

  // 1-Click Renewal process from 6-month alert
  const handleProcessRenewal = (sale: Sale) => {
    setPrefilledSaleData({
      saleType: 'Renovación',
      cantidad: 1,
      clientName: sale.clientName,
      clientDni: sale.clientDni,
      clientPhone: sale.clientPhone,
      cargoFijo: sale.cargoFijo ?? 49.9,
      notes: `Renovación de equipo tras cumplir 6+ meses (Venta original: ${sale.saleDate})`,
      renewedFromSaleId: sale.id,
    });
    setEditingSale(null);
    setIsSaleModalOpen(true);
  };

  const handleMarkRenewed = async (saleId: string) => {
    try {
      const updated = await api.markSaleRenewed(saleId);
      setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast('Cliente marcado como renovado/atendido.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  // Team Management CRUD
  const handleCreateUser = async (userData: Partial<User> & { password: string }) => {
    const newUser = await api.createUser(userData);
    setUsers((prev) => [...prev, newUser]);
    showToast(`Usuario ${newUser.fullName} creado exitosamente. 👤`);
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const updated = await api.updateUser(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast(`Usuario actualizado correctamente.`);
  };

  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Usuario eliminado del sistema.');
  };

  // If not logged in, render AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renewalAlertCount = sales.filter(isSaleAptoForRenewal).length;
  const teamAdvisors = users.filter((u) => u.role === 'advisor');

  return (
    <div className="min-h-screen bg-[#faf6f3] text-stone-900 flex font-sans selection:bg-rose-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1f1513] border border-rose-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <p className="text-xs sm:text-sm font-bold max-w-sm">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inactivity Security Lock Screen */}
      {isLocked && (
        <LockScreenModal
          user={currentUser}
          onUnlock={unlockSession}
          onLogout={handleLogout}
        />
      )}

      {/* 1. Left Dark Sidebar (Matching pos.jpg style) */}
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewSale={() => {
          setEditingSale(null);
          setPrefilledSaleData(null);
          setIsSaleModalOpen(true);
        }}
        onOpenBackups={() => setIsBackupModalOpen(true)}
        onManualLock={lockSession}
        onLogout={handleLogout}
        renewalAlertCount={renewalAlertCount}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header matching pos.jpg */}
        <TopHeader
          currentUser={currentUser}
          onOpenNewSale={() => {
            setEditingSale(null);
            setPrefilledSaleData(null);
            setIsSaleModalOpen(true);
          }}
          onManualLock={lockSession}
          inactivitySecondsRemaining={secondsRemaining}
          renewalAlertCount={renewalAlertCount}
          onOpenAlerts={() => setActiveView('renewals')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Dynamic Main Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* DASHBOARD VIEW (Matching pos.jpg) */}
          {activeView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              sales={sales}
              goals={goals}
              onOpenNewSale={() => {
                setEditingSale(null);
                setPrefilledSaleData(null);
                setIsSaleModalOpen(true);
              }}
              onOpenRenewals={() => setActiveView('renewals')}
              onOpenSalesTable={() => setActiveView('operations')}
              onOpenBackups={() => setIsBackupModalOpen(true)}
              onOpenTeam={() => setActiveView('team')}
              onGoalAchievedToast={showToast}
            />
          )}

          {/* VENTAS / TABLA VIEW */}
          {activeView === 'operations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Registro de Ventas & Operaciones
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    Historial de ventas con comisiones, opción de cantidad y exportación a Excel.
                  </p>
                </div>
              </div>

              <SalesTable
                sales={sales}
                currentUser={currentUser}
                teamAdvisors={teamAdvisors}
                onNewSale={() => {
                  setEditingSale(null);
                  setPrefilledSaleData(null);
                  setIsSaleModalOpen(true);
                }}
                onEditSale={(sale) => {
                  setEditingSale(sale);
                  setPrefilledSaleData(null);
                  setIsSaleModalOpen(true);
                }}
                onDeleteSale={handleDeleteSale}
                onOpenRenewalsTab={() => setActiveView('renewals')}
                selectedAdvisorFilter={selectedAdvisorFilter}
                onSelectAdvisorFilter={setSelectedAdvisorFilter}
              />
            </div>
          )}

          {/* RENEWALS TAB (6+ Months) */}
          {activeView === 'renewals' && (
            <div className="space-y-4">
              <RenewalsTab
                sales={sales}
                onProcessRenewal={handleProcessRenewal}
                onMarkRenewed={handleMarkRenewed}
              />
            </div>
          )}

          {/* GOALS DEDICATED VIEW */}
          {activeView === 'goals' && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
                <CommercialGoalsCards
                  sales={sales}
                  goals={goals}
                  onGoalAchievedToast={showToast}
                  titlePrefix="Metas Comerciales del Periodo (22 Altas, 22 Portabilidades, 30 Renovaciones, 100 Prepagos, 7 CyC)"
                />
              </div>
            </div>
          )}

          {/* TEAM & HIERARCHY VIEW */}
          {activeView === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Estructura Organizacional & Equipo Comercial
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    {currentUser.role === 'ceo'
                      ? '👑 Como CEO (Gilberto), puedes crear administradores y asesores con permisos globales.'
                      : '🛡️ Como Administrador, puedes crear y supervisar a tus asesores de venta.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-4.5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20"
                >
                  + Gestionar / Crear Usuarios
                </button>
              </div>

              {/* Quick Team Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u) => {
                  const isCEO = u.role === 'ceo' || u.username.toLowerCase() === 'gilberto';
                  const userSales = sales.filter((s) => s.advisorId === u.id);
                  const userCommissions = userSales.reduce((acc, s) => acc + s.commission, 0);

                  return (
                    <div
                      key={u.id}
                      className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                              isCEO
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : u.role === 'admin'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {isCEO ? '👑' : u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-stone-900">{u.fullName}</h4>
                            <span className="text-xs text-stone-400">@{u.username}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            isCEO
                              ? 'bg-amber-500 text-stone-950'
                              : u.role === 'admin'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCEO ? 'CEO' : u.role === 'admin' ? 'ADMIN' : 'ASESOR'}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-stone-50 rounded-xl">
                          <span className="text-stone-400 block text-[11px] font-medium">Ventas:</span>
                          <span className="font-extrabold text-stone-900 text-sm">{userSales.length}</span>
                        </div>
                        <div className="p-2.5 bg-stone-50 rounded-xl">
                          <span className="text-stone-400 block text-[11px] font-medium">Comisiones:</span>
                          <span className="font-extrabold text-emerald-700 text-sm">
                            S/ {userCommissions.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-[11px] text-stone-500">
                        <span>Estado: {u.active ? '🟢 Activo' : '🔴 Inactivo'}</span>
                        <button
                          onClick={() => {
                            setSelectedAdvisorFilter(u.id);
                            setActiveView('operations');
                          }}
                          className="text-rose-600 hover:text-rose-700 font-bold"
                        >
                          Ver sus ventas →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sale Modal with Cantidad Option */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setEditingSale(null);
          setPrefilledSaleData(null);
        }}
        onSave={handleSaveSale}
        editingSale={editingSale}
        currentUser={currentUser}
        teamAdvisors={teamAdvisors}
        prefilledData={prefilledSaleData}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Cloud Backup Management Modal */}
      <BackupManagementModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReload={loadData}
      />
    </div>
  );
}
