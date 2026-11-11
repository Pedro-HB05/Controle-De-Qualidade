import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Maquinas } from './pages/Maquinas';
import { Vistorias } from './pages/Vistorias';
import { Pendencias } from './pages/Pendencias';
import { Relatorios } from './pages/Relatorios';
import { Usuario } from './types';

export const App: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem('usuario_logado');
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleLogout = () => {
    localStorage.removeItem('usuario_logado');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLoginSuccess={(u) => setUsuario(u)} />;
  }

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Indicadores & KPIs de Gestão',
          subtitle: 'Visão consolidada de máquinas, vistorias e controle de prazos em tempo real.',
        };
      case 'maquinas':
        return {
          title: 'Controle de Máquinas & Patrimônio',
          subtitle: 'Cadastre o ID/patrimônio, quem está com a máquina, setor e status operacional.',
        };
      case 'vistorias':
        return {
          title: 'Controle de Checagens & Vistorias',
          subtitle: 'Registro das revisões feitas, quem conferiu e aprovação/reprovação.',
        };
      case 'pendencias':
        return {
          title: 'Controle de Prazos & Pendências',
          subtitle: 'Registro de falhas, quem tem que resolver e data limite para consertar.',
        };
      case 'relatorios':
        return {
          title: 'Relatórios & Histórico Consolidado',
          subtitle: 'Geração de relatórios com datas de checagem, falhas e histórico de resoluções.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        usuario={usuario}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />

        <main className="flex-1 overflow-y-auto" key={refreshKey}>
          {currentTab === 'dashboard' && (
            <Dashboard usuario={usuario} onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'maquinas' && <Maquinas />}
          {currentTab === 'vistorias' && <Vistorias />}
          {currentTab === 'pendencias' && <Pendencias />}
          {currentTab === 'relatorios' && <Relatorios />}
        </main>
      </div>
    </div>
  );
};

export default App;
