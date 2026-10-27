import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertOctagon,
  Boxes,
  Package,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export type NavItem =
  | 'dashboard'
  | 'inspecoes'
  | 'nao-conformidades'
  | 'lotes'
  | 'produtos'
  | 'defeitos'
  | 'relatorios';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Indicadores & KPIs', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'inspecoes', label: 'Inspeções de Qualidade', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'nao-conformidades', label: 'Não Conformidades (RNC)', icon: <AlertOctagon className="w-5 h-5" /> },
    { id: 'lotes', label: 'Lotes de Produção', icon: <Boxes className="w-5 h-5" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="w-5 h-5" /> },
    { id: 'defeitos', label: 'Catálogo de Defeitos', icon: <Layers className="w-5 h-5" /> },
    { id: 'relatorios', label: 'Relatórios Gerenciais', icon: <FileSpreadsheet className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight">Controle de Qualidade</h1>
          <span className="text-xs text-slate-400 font-medium">Processos Produtivos</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Módulos Operacionais
        </div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Backend: Online</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Conectado a http://localhost:5170</div>
      </div>
    </aside>
  );
};
