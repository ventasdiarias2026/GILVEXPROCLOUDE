import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BackupItem } from '../types';
import { api } from '../services/api';

interface BackupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => Promise<void>;
}

export const BackupManagementModal: React.FC<BackupManagementModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getBackups();
      setBackups(list || []);
    } catch (err: unknown) {
      setError('Error al obtener lista de respaldos del servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBackups();
      setActionMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerBackup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.triggerBackup();
      setActionMessage(`¡Respaldo creado con éxito! Archivo: ${res.filename}`);
      await fetchBackups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar respaldo');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (
      !confirm(
        `¿Deseas restaurar la copia "${filename}"? Todos los registros actuales se sincronizarán con los datos de ese punto en el tiempo.`
      )
    ) {
      return;
    }

    setRestoringFilename(filename);
    setError(null);
    try {
      await api.restoreBackup(filename);
      setActionMessage('¡Base de datos restaurada correctamente desde el respaldo!');
      await onDataReload();
      await fetchBackups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al restaurar respaldo');
    } finally {
      setRestoringFilename(null);
    }
  };

  const handleExportJson = () => {
    window.open('/api/database/export', '_blank');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.sales || !parsed.users) {
          throw new Error('El archivo no tiene el formato válido de GILVEXPRO CLOUD');
        }

        if (
          !confirm(
            `Se han detectado ${parsed.sales.length} ventas y ${parsed.users.length} usuarios en el archivo. ¿Confirmar importación y reemplazo?`
          )
        ) {
          return;
        }

        setLoading(true);
        await api.importDatabase(parsed);
        setActionMessage('Base de datos importada exitosamente desde el archivo JSON.');
        await onDataReload();
        await fetchBackups();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al importar archivo');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 bg-[#faf7f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
                Sistema de Respaldo Automático Integrado
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                GILVEXPRO CLOUD • Persistencia 100% en la Nube y Sincronización Multi-dispositivo
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Estado del Almacenamiento en la Nube: 100% Activo
                </span>
                <p className="text-xs text-stone-600">
                  Todas las ventas y usuarios se guardan en el servidor en tiempo real. Al ingresar desde cualquier otra PC o celular, todo se mantiene intacto.
                </p>
              </div>
            </div>
          </div>

          {actionMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleTriggerBackup}
              disabled={loading}
              className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#e11d48] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Generar Respaldo Ahora</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Crea una copia instantánea en el servidor.
              </p>
            </button>

            <button
              onClick={handleExportJson}
              className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl text-left transition-all group shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Descargar Base de Datos</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Exporta archivo JSON completo a tu PC.
              </p>
            </button>

            <label className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl text-left transition-all cursor-pointer group shadow-sm">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Importar Respaldo JSON</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Carga un archivo de respaldo desde tu PC.
              </p>
            </label>
          </div>

          {/* Backup Snapshots list */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Historial de Copias de Seguridad en Servidor ({backups.length})
              </h3>
              <button
                onClick={fetchBackups}
                className="text-xs text-[#e11d48] hover:text-[#be123c] font-bold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Actualizar lista
              </button>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
              {backups.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  No hay respaldos previos aún. Genera uno con el botón superior.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto">
                  {backups.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-800 truncate max-w-xs sm:max-w-md">
                            {b.filename}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              b.type === 'manual'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.type === 'manual' ? 'Manual' : 'Automático'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                          <span>{new Date(b.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span>{b.salesCount} ventas</span>
                          <span>•</span>
                          <span>{b.usersCount} usuarios</span>
                          <span>•</span>
                          <span>{(b.sizeBytes / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreBackup(b.filename)}
                        disabled={restoringFilename === b.filename}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-stone-200"
                      >
                        {restoringFilename === b.filename ? 'Restaurando...' : 'Restaurar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#faf7f5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
