import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  ClipboardCheck,
  ClockAlert,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  User,
  X,
} from 'lucide-react';
import { Usuario } from '../types';

export type NavItem = 'dashboard' | 'maquinas' | 'vistorias' | 'pendencias' | 'relatorios';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  usuario: Usuario | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  usuario,
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const menuItems: { id: NavItem; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Início',
      icon: <LayoutDashboard className="w-5 h-5" />,
      desc: 'Resumo geral',
    },
    {
      id: 'maquinas',
      label: 'Máquinas & Equipamentos',
      icon: <Laptop className="w-5 h-5" />,
      desc: 'Onde está cada item',
    },
    {
      id: 'vistorias',
      label: 'Checagens & Revisões',
      icon: <ClipboardCheck className="w-5 h-5" />,
      desc: 'Conferir se está funcionando',
    },
    {
      id: 'pendencias',
      label: 'Problemas & Prazos',
      icon: <ClockAlert className="w-5 h-5" />,
      desc: 'O que quebrou e consertos',
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Histórico',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      desc: 'Ver histórico e imprimir',
    },
  ];

  const handleSelect = (id: NavItem) => {
    onSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop para Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight tracking-tight">
                ControlDesk
              </h1>
              <span className="text-[11px] text-sky-400 font-medium">Controle de Equipamentos</span>
            </div>
          </div>

          {/* Botão de Fechar no Mobile */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-sky-900/60 text-sky-300 flex items-center justify-center shrink-0 border border-sky-700/50">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{usuario?.nome || 'Usuário'}</p>
                <p className="text-[10px] text-slate-400 truncate">{usuario?.cargo || 'Colaborador'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
