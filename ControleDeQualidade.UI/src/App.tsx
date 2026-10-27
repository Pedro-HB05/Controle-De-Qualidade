import React, { useState } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Inspecoes } from './pages/Inspecoes';
import { NaoConformidades } from './pages/NaoConformidades';
import { Lotes } from './pages/Lotes';
import { Produtos } from './pages/Produtos';
import { TiposDefeitos } from './pages/TiposDefeitos';
import { Relatorios } from './pages/Relatorios';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Indicadores & KPIs de Qualidade',
          subtitle: 'Visão consolidada de desempenho produtivo, Pareto de defeitos e tendências.',
        };
      case 'inspecoes':
        return {
          title: 'Módulo de Inspeções Estruturadas',
          subtitle: 'Registro sistemático de verificações de lote e apontamento detalhado de defeitos.',
        };
      case 'nao-conformidades':
        return {
          title: 'Gestão de Não Conformidades (RNC)',
          subtitle: 'Rastreamento de desvios, análise de causa raiz e planos de ação corretiva.',
        };
      case 'lotes':
        return {
          title: 'Lotes de Fabricação',
          subtitle: 'Controle de lotes, linhas produtivas e status operacional de liberação.',
        };
      case 'produtos':
        return {
          title: 'Produtos & Peças Fabricadas',
          subtitle: 'Catálogo de itens monitorados pelo controle de qualidade.',
        };
      case 'defeitos':
        return {
          title: 'Catálogo de Tipos de Defeito',
          subtitle: 'Classificação por categorias, severidade e critérios de aceitação técnica.',
        };
      case 'relatorios':
        return {
          title: 'Relatórios Gerenciais',
          subtitle: 'Consolidação de dados para auditoria, histórico e apoio à tomada de decisão.',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />

        <main className="flex-1 overflow-y-auto" key={refreshKey}>
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateToInspecoes={() => setCurrentTab('inspecoes')}
              onNavigateToRncs={() => setCurrentTab('nao-conformidades')}
            />
          )}
          {currentTab === 'inspecoes' && <Inspecoes />}
          {currentTab === 'nao-conformidades' && <NaoConformidades />}
          {currentTab === 'lotes' && <Lotes />}
          {currentTab === 'produtos' && <Produtos />}
          {currentTab === 'defeitos' && <TiposDefeitos />}
          {currentTab === 'relatorios' && <Relatorios />}
        </main>
      </div>
    </div>
  );
};

export default App;
