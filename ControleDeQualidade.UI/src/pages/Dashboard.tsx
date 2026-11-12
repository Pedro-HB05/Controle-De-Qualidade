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
  Check,
} from 'lucide-react';

interface DashboardProps {
  usuario: Usuario | null;
  onNavigate: (tab: 'maquinas' | 'vistorias' | 'pendencias' | 'relatorios') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ usuario, onNavigate }) => {
  const [dados, setDados] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvendoId, setResolvendoId] = useState<number | null>(null);

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

  const handleResolverRapido = async (id: number) => {
    if (!window.confirm('Confirmar que esta manutenção foi realizada com sucesso?')) return;
    setResolvendoId(id);
    try {
      await api.resolverPendencia(id, {
        solucaoAplicada: 'Manutenção concluída pelo painel inicial',
        status: 'Resolvida',
      });
      await carregarDashboard();
    } catch (err: any) {
      alert(err?.message || 'Erro ao concluir conserto.');
    } finally {
      setResolvendoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const kpis = dados?.kpis;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Bloco de Boas-vindas e Ações Rápidas */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Olá, {usuario?.nome ? usuario.nome.split(' ')[0] : 'Técnico'}! 👋
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
              Help Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Painel da equipe de TI: controle de equipamentos, revisões e manutenções.
          </p>
        </div>

        {/* 3 Botões Grandes do Help Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('maquinas')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Equipamento
          </button>
          <button
            onClick={() => onNavigate('vistorias')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            Cadastrar Revisão
          </button>
          <button
            onClick={() => onNavigate('pendencias')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ClockAlert className="w-4 h-4" />
            Registrar Manutenção
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

      {/* 3 Resumos Principais em Destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Total de Máquinas */}
        <div
          onClick={() => onNavigate('maquinas')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Equipamentos no Inventário
            </span>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-xl">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis?.totalMaquinas ?? 0}
            </span>
            <span className="text-xs text-slate-400">ativos cadastrados</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ● {kpis?.maquinasAtivas ?? 0} com colaboradores/equipe
            </span>
            {(kpis?.maquinasManutencao ?? 0) > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ● {kpis?.maquinasManutencao} em reparo
              </span>
            )}
          </div>
        </div>

        {/* Checagens Feitas */}
        <div
          onClick={() => onNavigate('vistorias')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Revisões Preventivas
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis?.totalVistorias ?? 0}
            </span>
            <span className="text-xs text-slate-400">testes feitos</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Aprovados no teste:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {kpis?.taxaAprovacao.toFixed(0) ?? '100'}%
            </span>
          </div>
        </div>

        {/* Problemas a Resolver */}
        <div
          onClick={() => onNavigate('pendencias')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Manutenções em Andamento
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {kpis?.pendenciasAbertas ?? 0}
            </span>
            <span className="text-xs text-slate-400">em aberto</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Situação:</span>
            <span
              className={`font-bold ${
                (kpis?.pendenciasAtrasadas ?? 0) > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {(kpis?.pendenciasAtrasadas ?? 0) > 0
                ? `${kpis?.pendenciasAtrasadas} atrasados ⚠️`
                : 'Tudo em dia! 🎉'}
            </span>
          </div>
        </div>
      </div>

      {/* Lista Direta: Problemas que precisam de conserto */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Manutenções que precisam de atenção no momento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Equipamentos em conserto e prazos da equipe de TI
            </p>
          </div>
          <button
            onClick={() => onNavigate('pendencias')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dados?.pendenciasUrgentes && dados.pendenciasUrgentes.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dados.pendenciasUrgentes.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-3 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold shrink-0">
                      {item.codigoPendencia}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.titulo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>
                      Equipamento: <strong className="text-slate-700 dark:text-slate-300">{item.patrimonio}</strong>
                    </span>
                    <span>
                      Técnico de TI: <strong className="text-slate-700 dark:text-slate-300">{item.responsavel}</strong>
                    </span>
                    <span>
                      Prazo: <strong className={item.estaAtrasada ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{new Date(item.prazoLimite).toLocaleDateString('pt-BR')}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleResolverRapido(item.id)}
                    disabled={resolvendoId === item.id}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    title="Clique para marcar como resolvido diretamente"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {resolvendoId === item.id ? 'Salvando...' : 'Concluir Manutenção'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Está tudo funcionando perfeitamente!</p>
            <p className="mt-0.5">Nenhum equipamento com defeito no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};
