import React, { useState, useEffect } from 'react';
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
    const token = localStorage.getItem('token');
    if (salvo && token) {
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

  useEffect(() => {
    const handleAuthLogout = () => {
      setUsuario(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
          title: 'Painel do Help Desk',
          subtitle: 'Visão geral do inventário de TI, manutenções em andamento e revisões preventivas.',
        };
      case 'maquinas':
        return {
          title: 'Inventário de TI & Equipamentos',
          subtitle: 'Cadastre computadores, notebooks e equipamentos, e acompanhe com qual colaborador ou setor o item está.',
        };
      case 'vistorias':
        return {
          title: 'Revisões Preventivas & Testes',
          subtitle: 'Registre os testes e checagens técnicas feitas pela equipe de Help Desk nos equipamentos.',
        };
      case 'pendencias':
        return {
          title: 'Manutenções & Prazos',
          subtitle: 'Acompanhe equipamentos em conserto, técnico responsável pelo reparo e a data limite de entrega.',
        };
      case 'relatorios':
        return {
          title: 'Relatórios & Histórico de TI',
          subtitle: 'Puxe e imprima relatórios completos de equipamentos e manutenções para a diretoria.',
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
