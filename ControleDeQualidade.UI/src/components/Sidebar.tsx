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
} from 'lucide-react';
import { Usuario } from '../types';

export type NavItem = 'dashboard' | 'maquinas' | 'vistorias' | 'pendencias' | 'relatorios';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  usuario: Usuario | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  usuario,
  onLogout,
}) => {
  const menuItems: { id: NavItem; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Indicadores & KPIs',
      icon: <LayoutDashboard className="w-5 h-5" />,
      desc: 'Visão geral e gráficos',
    },
    {
      id: 'maquinas',
      label: 'Máquinas & Patrimônio',
      icon: <Laptop className="w-5 h-5" />,
      desc: 'Equipamentos e responsáveis',
    },
    {
      id: 'vistorias',
      label: 'Checagens & Vistorias',
      icon: <ClipboardCheck className="w-5 h-5" />,
      desc: 'Inspeções e revisões',
    },
    {
      id: 'pendencias',
      label: 'Prazos & Pendências',
      icon: <ClockAlert className="w-5 h-5" />,
      desc: 'Problemas e prazos limites',
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Histórico',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      desc: 'Impressão e exportação PDF',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">ControlDesk</h1>
          <span className="text-[11px] text-sky-400 font-medium">Patrimônio & Qualidade</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Módulos Principais
        </div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
              <div className="text-left">
                <div className="leading-tight">{item.label}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center justify-between mb-3">
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
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Banco Neon: Conectado</span>
        </div>
      </div>
    </aside>
  );
};
