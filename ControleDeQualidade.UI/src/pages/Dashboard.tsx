import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardResumo, Usuario } from '../types';
import {
  Laptop,
  ClipboardCheck,
  ClockAlert,
  CheckCircle2,
  Plus,
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  usuario: Usuario | null;
  onNavigate: (tab: 'maquinas' | 'vistorias' | 'pendencias' | 'relatorios') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ usuario, onNavigate }) => {
  const [dados, setDados] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardResumo();
      setDados(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar indicadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando indicadores em tempo real...</p>
        </div>
      </div>
    );
  }

  const kpis = dados?.kpis;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto">
      {/* Banner Principal com Ações Rápidas */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950 p-5 sm:p-6 md:p-8 rounded-2xl text-white shadow-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-500/30 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Visão Geral</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Olá, {usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário'}! 👋
          </h2>
          <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Acompanhe de forma simples suas máquinas, revisões e o que precisa de conserto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('vistorias')}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-950/40"
          >
            <Plus className="w-4 h-4" />
            Fazer Checagem
          </button>
          <button
            onClick={() => onNavigate('pendencias')}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            Anotar Problema
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={carregarDashboard} className="underline font-semibold ml-4">
            Tentar novamente
          </button>
        </div>
      )}

      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Máquinas & Equipamentos */}
        <div
          onClick={() => onNavigate('maquinas')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Máquinas & Itens
            </span>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis?.totalMaquinas ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">cadastrados</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ● {kpis?.maquinasAtivas ?? 0} funcionando
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ● {kpis?.maquinasManutencao ?? 0} em conserto
            </span>
          </div>
        </div>

        {/* Vistorias Realizadas */}
        <div
          onClick={() => onNavigate('vistorias')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Checagens Feitas
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis?.totalVistorias ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">revisões</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Aprovados sem defeito:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {kpis?.taxaAprovacao.toFixed(1) ?? '100'}%
            </span>
          </div>
        </div>

        {/* Pendências em Aberto */}
        <div
          onClick={() => onNavigate('pendencias')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Problemas a Resolver
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {kpis?.pendenciasAbertas ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">na fila</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Prazo atrasado:</span>
            <span
              className={`font-bold ${
                (kpis?.pendenciasAtrasadas ?? 0) > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {(kpis?.pendenciasAtrasadas ?? 0) > 0
                ? `${kpis?.pendenciasAtrasadas} atrasados`
                : 'Nenhum atrasado 🎉'}
            </span>
          </div>
        </div>

        {/* Resolvidas */}
        <div
          onClick={() => onNavigate('pendencias')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Problemas Resolvidos
            </span>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis?.pendenciasResolvidas ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">consertados</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Total no histórico:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {kpis?.totalPendencias ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid com Pendências Urgentes e Distribuição por Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Pendências Urgentes (2 Colunas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Problemas que Precisam de Atenção
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Itens que quebraram ou precisam de conserto
              </p>
            </div>
            <button
              onClick={() => onNavigate('pendencias')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Ver todos os problemas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {dados?.pendenciasUrgentes && dados.pendenciasUrgentes.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dados.pendenciasUrgentes.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold shrink-0">
                        {item.codigoPendencia}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.titulo}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>
                        Patrimônio:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">{item.patrimonio}</strong>
                      </span>
                      <span>
                        Responsável:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">{item.responsavel}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full ${
                        item.estaAtrasada
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.estaAtrasada ? '⚠️ Atrasada' : 'No Prazo'}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 sm:mt-1">
                      Prazo: {new Date(item.prazoLimite).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Tudo certo! Nenhum problema pendente no momento.
            </div>
          )}
        </div>

        {/* Máquinas por Setor (1 Coluna) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Onde Estão os Equipamentos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quantidade de itens por setor ou sala
            </p>
          </div>

          <div className="space-y-3">
            {dados?.distribuicaoSetores && dados.distribuicaoSetores.length > 0 ? (
              dados.distribuicaoSetores.map((setor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{setor.setor}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {setor.quantidade} {setor.quantidade === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 dark:bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (setor.quantidade / (kpis?.totalMaquinas || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                Nenhum equipamento cadastrado ainda.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('maquinas')}
              className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Building2 className="w-3.5 h-3.5" />
              Ver Todos os Equipamentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
