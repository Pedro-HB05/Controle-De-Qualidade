import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Maquinas } from './pages/Maquinas';
import { Vistorias } from './pages/Vistorias';
import { Pendencias } from './pages/Pendencias';
import { Relatorios } from './pages/Relatorios';
import { Usuario } from './types';

const AppContent: React.FC = () => {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
          title: 'Início & Resumo Geral',
          subtitle: 'Acompanhe de forma simples o estado dos equipamentos, revisões e consertos.',
        };
      case 'maquinas':
        return {
          title: 'Máquinas & Equipamentos',
          subtitle: 'Veja com quem está cada item e se ele está funcionando normalmente.',
        };
      case 'vistorias':
        return {
          title: 'Checagens & Revisões',
          subtitle: 'Anote as conferências feitas e marque se o item está aprovado ou com defeito.',
        };
      case 'pendencias':
        return {
          title: 'Problemas & Prazos',
          subtitle: 'Anote o que estragou, quem vai consertar e o prazo para resolver.',
        };
      case 'relatorios':
        return {
          title: 'Relatórios & Histórico',
          subtitle: 'Puxe e imprima relatórios com tudo o que foi checado e consertado.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        usuario={usuario}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
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

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
