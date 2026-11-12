import React, { useState } from 'react';
import { api } from '../services/api';
import { Usuario } from '../types';
import { ShieldCheck, Lock, Mail, User, Briefcase, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLoginSuccess: (usuario: Usuario) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ nome, email, senha, cargo });
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
        onLoginSuccess(res.usuario);
      } else {
        const res = await api.login({ email, senha });
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
        onLoginSuccess(res.usuario);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] flex items-center justify-center p-4 relative transition-colors duration-200">
      {/* Botão de Tema no Canto Superior Direito */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all shadow-lg"
        title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-sky-300" />
        )}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl transition-all">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl mb-3 shadow-inner border border-sky-100 dark:border-sky-900/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ControlDesk
          </h1>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mt-0.5">
            Help Desk & Suporte de TI
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {isRegister
              ? 'Cadastro de técnico ou analista da equipe de suporte'
              : 'Painel da equipe de TI para controle de equipamentos e manutenções'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Função / Cargo na TI
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Técnico de Suporte, Analista de TI, Help Desk"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Senha {isRegister && <span className="text-slate-400 font-normal">(mínimo 8 caracteres)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={isRegister ? 8 : undefined}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              />
            </div>
            {isRegister && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                🔒 Mínimo de 8 caracteres contendo letras e números.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Criar Minha Conta' : 'Acessar ControlDesk'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternador Login / Cadastro */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          {isRegister ? (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Entrar com e-mail e senha
              </button>
            </p>
          ) : (
            <p>
              Primeiro acesso?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Cadastre sua conta aqui
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
