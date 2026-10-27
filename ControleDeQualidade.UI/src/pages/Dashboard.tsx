import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardKpis, ParetoItem, CategoriaDefeitoResumo, EvolucaoMensal } from '../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardList,
  Layers,
  Clock,
  Plus,
} from 'lucide-react';

interface DashboardProps {
  onNavigateToInspecoes: () => void;
  onNavigateToRncs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToInspecoes,
  onNavigateToRncs,
}) => {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [pareto, setPareto] = useState<ParetoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDefeitoResumo[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoMensal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpisData, paretoData, catData, evoData] = await Promise.all([
        api.getKpis(),
        api.getParetoDefeitos(),
        api.getDefeitosPorCategoria(),
        api.getEvolucaoMensal(),
      ]);
      setKpis(kpisData);
      setPareto(paretoData);
      setCategorias(catData);
      setEvolucao(evoData);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar indicadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando indicadores de qualidade...</p>
        </div>
      </div>
    );
  }

  const maxParetoQty = Math.max(...pareto.map((p) => p.quantidadeTotal), 1);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Banner de Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-2xl text-white shadow-lg shadow-slate-900/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Painel de Controle e Indicadores</h2>
          <p className="text-slate-300 text-sm mt-1">
            Acompanhamento contínuo de inspeções de chão de fábrica, defeitos e não conformidades.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToInspecoes}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Inspeção
          </button>
          <button
            onClick={onNavigateToRncs}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Abrir RNC
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={carregarDados} className="underline font-semibold ml-4">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Taxa de Aprovação */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Conformidade
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.taxaAprovacaoPercentual.toFixed(1) ?? '0.0'}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {kpis?.totalPecasAprovadas ?? 0} aprovadas de {kpis?.totalPecasInspecionadas ?? 0} inspecionadas
          </p>
        </div>

        {/* Taxa de Rejeição */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Rejeição
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.taxaRejeicaoPercentual.toFixed(1) ?? '0.0'}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {kpis?.totalPecasRejeitadas ?? 0} peças reprovadas no processo
          </p>
        </div>

        {/* Total Inspeções */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inspeções Realizadas
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {kpis?.totalInspecoes ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">verificações</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {kpis?.totalLotesCadastrados ?? 0} lotes cadastrados no sistema
          </p>
        </div>

        {/* Não Conformidades */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Não Conformidades (RNC)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {(kpis?.totalRncsAbertas ?? 0) + (kpis?.totalRncsEmTratativa ?? 0)}
            </span>
            <span className="text-xs text-slate-500 font-medium">em andamento</span>
          </div>
          <div className="flex items-center gap-3 text-xs mt-2 text-slate-500">
            <span className="text-emerald-600 font-medium">{kpis?.totalRncsResolvidas ?? 0} resolvidas</span>
            {kpis && kpis.totalRncsAtrasadas > 0 && (
              <span className="text-rose-600 font-bold">({kpis.totalRncsAtrasadas} em atraso)</span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Pareto de Defeitos (Princípio 80/20) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Análise de Pareto de Defeitos (Princípio 80/20)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Frequência de ocorrência por tipo de falha e percentual acumulado para priorização de ações de melhoria.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-sky-500 rounded-sm" />
              <span className="text-slate-600 font-medium">Quantidade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-amber-500 rounded-full" />
              <span className="text-slate-600 font-medium">% Acumulado</span>
            </div>
          </div>
        </div>

        {pareto.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhum defeito registrado até o momento. As análises de Pareto aparecerão conforme inspeções apontarem desvios.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pareto.map((item) => (
              <div key={item.tipoDefeitoId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.codigo}
                    </span>
                    <span className="font-semibold text-slate-800">{item.nomeDefeito}</span>
                    <span className="text-slate-400">({item.categoria})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{item.quantidadeTotal} un</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{item.percentual.toFixed(1)}%</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Acum: {item.percentualAcumulado.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.quantidadeTotal / maxParetoQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid com Distribuição por Categoria e Evolução Histórica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defeitos por Categoria */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Defeitos por Categoria</h3>
          <p className="text-xs text-slate-500 mb-6">
            Distribuição percentual das não conformidades segundo a natureza do defeito.
          </p>

          {categorias.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Nenhuma categoria com ocorrência registrada.
            </div>
          ) : (
            <div className="space-y-4">
              {categorias.map((cat) => (
                <div key={cat.categoria} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat.categoria}</span>
                    <span className="text-slate-500">
                      {cat.quantidade} peças ({cat.percentual.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evolução Histórica das Inspeções */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-base">Evolução Mensal de Qualidade</h3>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Volume de inspeções e taxa de conformidade dos últimos períodos.
          </p>

          {evolucao.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Sem dados históricos suficientes para traçar evolução temporal.
            </div>
          ) : (
            <div className="space-y-4">
              {evolucao.map((evo) => (
                <div
                  key={evo.mesAno}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                >
                  <div className="font-bold text-slate-800 text-sm">{evo.mesAno}</div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-900">{evo.totalInspecoes}</span> inspeções (
                    {evo.totalPecasInspecionadas} peças)
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{evo.taxaAprovacao.toFixed(1)}% aprovado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
