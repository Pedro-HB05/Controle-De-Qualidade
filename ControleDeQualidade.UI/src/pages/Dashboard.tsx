import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardResumo, Usuario } from '../types';
import {
  Laptop,
  ClipboardCheck,
  ClockAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  RefreshCw,
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
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando indicadores em tempo real...</p>
        </div>
      </div>
    );
  }

  const kpis = dados?.kpis;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Banner Principal com Ações Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
            Painel Executivo
          </span>
          <h2 className="text-2xl font-bold mt-1">
            Olá, {usuario?.nome ? usuario.nome.split(' ')[0] : 'Gestor'}! 👋
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Acompanhe o status do patrimônio, vistorias realizadas e prazos de resolução em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('vistorias')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-950/40"
          >
            <Plus className="w-4 h-4" />
            Nova Vistoria
          </button>
          <button
            onClick={() => onNavigate('pendencias')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            Registrar Pendência
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={carregarDashboard} className="underline font-semibold ml-4">
            Tentar novamente
          </button>
        </div>
      )}

      {/* 4 Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Máquinas & Equipamentos */}
        <div
          onClick={() => onNavigate('maquinas')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Patrimônio & Máquinas
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.totalMaquinas ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">cadastradas</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="text-emerald-600 font-semibold">
              ● {kpis?.maquinasAtivas ?? 0} Ativas
            </span>
            <span className="text-amber-600 font-semibold">
              ● {kpis?.maquinasManutencao ?? 0} Em Manutenção
            </span>
          </div>
        </div>

        {/* Vistorias Realizadas */}
        <div
          onClick={() => onNavigate('vistorias')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Checagens Realizadas
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.totalVistorias ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">vistorias</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Taxa de Aprovação:</span>
            <span className="font-bold text-emerald-600">
              {kpis?.taxaAprovacao.toFixed(1) ?? '100'}%
            </span>
          </div>
        </div>

        {/* Pendências em Aberto */}
        <div
          onClick={() => onNavigate('pendencias')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pendências em Aberto
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {kpis?.pendenciasAbertas ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">a resolver</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Atrasadas:</span>
            <span
              className={`font-bold ${
                (kpis?.pendenciasAtrasadas ?? 0) > 0 ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              {kpis?.pendenciasAtrasadas ?? 0}
            </span>
          </div>
        </div>

        {/* Resolvidas */}
        <div
          onClick={() => onNavigate('pendencias')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Casos Resolvidos
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.pendenciasResolvidas ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">concluídas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Total Histórico:</span>
            <span className="font-semibold text-slate-700">{kpis?.totalPendencias ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Grid com Pendências Urgentes e Distribuição por Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Pendências Urgentes (2 Colunas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Prazos Urgentes & Pendências
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Problemas que exigem atenção imediata da equipe
              </p>
            </div>
            <button
              onClick={() => onNavigate('pendencias')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {dados?.pendenciasUrgentes && dados.pendenciasUrgentes.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {dados.pendenciasUrgentes.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                        {item.codigoPendencia}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.titulo}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>Patrimônio: <strong className="text-slate-700">{item.patrimonio}</strong></span>
                      <span>Responsável: <strong className="text-slate-700">{item.responsavel}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        item.estaAtrasada
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.estaAtrasada ? '⚠️ Atrasada' : 'No Prazo'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Prazo: {new Date(item.prazoLimite).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Nenhuma pendência crítica no momento. Tudo em dia!
            </div>
          )}
        </div>

        {/* Máquinas por Setor (1 Coluna) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Equipamentos por Setor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribuição do patrimônio cadastrado</p>
          </div>

          <div className="space-y-3">
            {dados?.distribuicaoSetores && dados.distribuicaoSetores.length > 0 ? (
              dados.distribuicaoSetores.map((setor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{setor.setor}</span>
                    <span className="font-bold text-slate-900">{setor.quantidade} un</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full"
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
              <p className="text-xs text-slate-400 text-center py-4">Nenhum setor registrado.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('maquinas')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 border border-slate-200"
            >
              <Building2 className="w-3.5 h-3.5" />
              Gerenciar Patrimônio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
