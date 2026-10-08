import React, { useState } from 'react';
import { User, Lock, Radio, ArrowRight, AlertCircle, MessageCircle, Phone, Mail, Headphones, Shield } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Login form state
  const [loginUsername, setLoginUsername] = useState('Gilberto');
  const [loginPassword, setLoginPassword] = useState('0903');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await api.login(loginUsername, loginPassword);
      onLoginSuccess(res.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1311] text-stone-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Brand Header matching pos.jpg */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#251a17] border border-[#3b2a25] rounded-2xl mb-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black tracking-wider text-white">
                GILVEXPRO
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 block -mt-1">
                CLOUD ENTERPRISE
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Sistema de gestión comercial, metas telecom y respaldo en la nube.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#241a17] border border-[#382823] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full bg-[#18100e] border border-[#382823] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-stone-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#18100e] border border-[#382823] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-stone-600"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 bg-[#e11d48] hover:bg-[#be123c] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? 'Ingresando...' : (
                <>
                  Ingresar al Panel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Support Card (Requested by user) */}
        <div className="bg-[#241a17] border border-[#382823] rounded-2xl p-5 shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
            <Headphones className="w-3.5 h-3.5" />
            Atención & Registro de Cuentas
          </div>

          <p className="text-xs font-semibold text-stone-300 leading-relaxed">
            Si aún no tienes una cuenta, comunícate con el grupo de soporte:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {/* WHATSAPP */}
            <a
              href="https://wa.me/51992292480?text=Hola,%20deseo%20solicitar%20la%20creaci%C3%B3n%20de%20mi%20cuenta%20en%20GILVEXPRO%20CLOUD"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-[#18100e] hover:bg-emerald-950/50 border border-[#382823] hover:border-emerald-500/50 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                    WhatsApp
                  </span>
                  <span className="font-extrabold text-white group-hover:text-emerald-400">
                    992292480
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">Enviar Mensaje →</span>
            </a>

            {/* LLAMADA */}
            <a
              href="tel:914232229"
              className="p-2.5 bg-[#18100e] hover:bg-sky-950/50 border border-[#382823] hover:border-sky-500/50 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                    Llamada
                  </span>
                  <span className="font-extrabold text-white group-hover:text-sky-400">
                    914232229
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-sky-400 font-bold">Llamar Ahora →</span>
            </a>

            {/* CORREO */}
            <a
              href="mailto:cellphonestarapoto@gmail.com?subject=Solicitud%20de%20Cuenta%20GILVEXPRO%20CLOUD"
              className="p-2.5 bg-[#18100e] hover:bg-rose-950/50 border border-[#382823] hover:border-rose-500/50 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                    Correo
                  </span>
                  <span className="font-extrabold text-white group-hover:text-rose-400 truncate max-w-[180px]">
                    cellphonestarapoto@gmail.com
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-rose-400 font-bold">Redactar →</span>
            </a>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nube Conectada
          </span>
          <span>•</span>
          <span>Auto-Bloqueo de Seguridad</span>
          <span>•</span>
          <span>Respaldo Automático</span>
        </div>
      </div>
    </div>
  );
};
