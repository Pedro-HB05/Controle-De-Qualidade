import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pendencia, Maquina, PendenciaInput } from '../types';
import {
  Plus,
  ClockAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  Trash2,
  X,
  User,
  Calendar,
  Building2,
  Laptop,
} from 'lucide-react';

export const Pendencias: React.FC = () => {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modal Nova Pendência
  const [showNovoModal, setShowNovoModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [maquinaId, setMaquinaId] = useState<number | undefined>(undefined);
  const [setor, setSetor] = useState<string>('Operacional');
  const [responsavel, setResponsavel] = useState<string>('');
  const [prazoLimite, setPrazoLimite] = useState<string>('');

  // Modal Resolver Pendência
  const [showResolverModal, setShowResolverModal] = useState<boolean>(false);
  const [pendenciaSelecionada, setPendenciaSelecionada] = useState<Pendencia | null>(null);
  const [solucaoAplicada, setSolucaoAplicada] = useState<string>('');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [pData, mData] = await Promise.all([
        api.getPendencias({ status: filtroStatus, busca }),
        api.getMaquinas(),
      ]);
      setPendencias(pData);
      setMaquinas(mData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [busca, filtroStatus]);

  const handleOpenNovoModal = () => {
    setErrorMsg(null);
    setTitulo('');
    setDescricao('');
    setMaquinaId(undefined);
    setSetor('Operacional');
    setResponsavel('');
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setPrazoLimite(d.toISOString().split('T')[0]);
    setShowNovoModal(true);
  };

  const handleSalvarNova = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload: PendenciaInput = {
      titulo,
      descricao,
      maquinaId,
      setor,
      responsavel,
      prazoLimite: new Date(prazoLimite).toISOString(),
    };

    try {
      await api.criarPendencia(payload);
      setShowNovoModal(false);
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar pendência.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResolver = (p: Pendencia) => {
    setPendenciaSelecionada(p);
    setSolucaoAplicada('');
    setShowResolverModal(true);
  };

  const handleConcluirTratativa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendenciaSelecionada) return;
    setSaving(true);
    try {
      await api.resolverPendencia(pendenciaSelecionada.id, {
        solucaoAplicada,
        status: 'Resolvida',
      });
      setShowResolverModal(false);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Falha ao concluir pendência.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pendência?')) return;
    try {
      await api.excluirPendencia(id);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Controle de Prazos & Pendências</h2>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe falhas em aberto, quem é o encarregado e garanta que nada passe do prazo.
          </p>
        </div>

        <button
          onClick={handleOpenNovoModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Nova Pendência
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, responsável ou código..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'Aberta', 'Atrasadas', 'Resolvida'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Pendências */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Carregando pendências...</div>
      ) : pendencias.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">Nenhuma pendência encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">
            Todas as manutenções e prazos estão em dia!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendencias.map((p) => {
            const isResolvida = p.status === 'Resolvida';
            return (
              <div
                key={p.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  p.estaAtrasada
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isResolvida
                    ? 'border-emerald-200 opacity-90'
                    : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                      {p.codigoPendencia}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isResolvida
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.estaAtrasada
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isResolvida
                        ? '✓ Resolvida'
                        : p.estaAtrasada
                        ? '⚠️ Prazo Atrasado'
                        : '● Em Aberto'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3 leading-tight">
                    {p.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {p.descricao || 'Sem descrição detalhada.'}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Responsável: <strong className="text-slate-800">{p.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Patrimônio:{' '}
                        <strong className="text-slate-800">
                          {p.numeroPatrimonio !== 'Geral'
                            ? `${p.numeroPatrimonio} (${p.nomeModelo})`
                            : 'Geral'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Data Limite:{' '}
                        <strong
                          className={
                            p.estaAtrasada ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'
                          }
                        >
                          {new Date(p.prazoLimite).toLocaleDateString('pt-BR')}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {isResolvida && p.solucaoAplicada && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800">
                      <strong>Solução:</strong> {p.solucaoAplicada}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {!isResolvida ? (
                    <button
                      onClick={() => handleOpenResolver(p)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar como Resolvido
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Concluído em {new Date(p.dataResolucao || '').toLocaleDateString('pt-BR')}
                    </span>
                  )}

                  <button
                    onClick={() => handleExcluir(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir pendência"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Pendência */}
      {showNovoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Nova Pendência / Falha</h3>
              <button
                onClick={() => setShowNovoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSalvarNova} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Problema *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Trocar bateria do rádio comunicador"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a um Equipamento (Opcional)
                </label>
                <select
                  value={maquinaId || ''}
                  onChange={(e) => setMaquinaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Problema Geral / Sem vínculo</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.numeroPatrimonio} - {m.nomeModelo} ({m.responsavel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quem tem que resolver? *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Ex: Técnico TI, Manutenção"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Limite (Prazo) *
                  </label>
                  <input
                    type="date"
                    required
                    value={prazoLimite}
                    onChange={(e) => setPrazoLimite(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Defeito
                </label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Explique o que aconteceu, sintomas da falha, etc."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Registrar Pendência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Concluir / Resolver Pendência */}
      {showResolverModal && pendenciaSelecionada && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Resolver e Concluir Pendência</h3>
              <button
                onClick={() => setShowResolverModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConcluirTratativa} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900">{pendenciaSelecionada.titulo}</div>
                <div className="text-slate-500">
                  Patrimônio: {pendenciaSelecionada.numeroPatrimonio} | Responsável:{' '}
                  {pendenciaSelecionada.responsavel}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  O que foi feito para consertar? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={solucaoAplicada}
                  onChange={(e) => setSolucaoAplicada(e.target.value)}
                  placeholder="Ex: Trocada a fonte de alimentação queimada por uma nova de 12V e testada com sucesso."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolverModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Concluindo...' : 'Marcar como Resolvido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
