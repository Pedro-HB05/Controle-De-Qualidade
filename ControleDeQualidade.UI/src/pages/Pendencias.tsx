import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pendencia, Maquina, PendenciaInput } from '../types';
import {
  Plus,
  CheckCircle2,
  Search,
  Check,
  Trash2,
  X,
  User,
  Calendar,
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
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Problemas & Prazos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Acompanhe tudo o que estragou ou precisa de conserto, quem vai resolver e a data limite.
          </p>
        </div>

        <button
          onClick={handleOpenNovoModal}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Anotar Novo Problema
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por problema, quem vai resolver ou código..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'Aberta', label: 'Para Consertar' },
            { id: 'Atrasadas', label: 'Atrasados ⚠️' },
            { id: 'Resolvida', label: 'Já Consertados ✓' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFiltroStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroStatus === st.id
                  ? 'bg-slate-900 dark:bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Pendências */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          Carregando problemas...
        </div>
      ) : pendencias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Tudo em ordem! Nenhum problema pendente
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Todas as manutenções e consertos estão em dia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pendencias.map((p) => {
            const isResolvida = p.status === 'Resolvida';
            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  p.estaAtrasada
                    ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-200 dark:ring-rose-900/50'
                    : isResolvida
                    ? 'border-emerald-200 dark:border-emerald-900/60 opacity-90'
                    : 'border-slate-200/80 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                      {p.codigoPendencia}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isResolvida
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : p.estaAtrasada
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isResolvida
                        ? '✓ Consertado'
                        : p.estaAtrasada
                        ? '⚠️ Prazo Atrasado'
                        : '● Para Consertar'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-3 leading-tight">
                    {p.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {p.descricao || 'Sem anotações adicionais.'}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Quem vai consertar: <strong className="text-slate-800 dark:text-slate-200">{p.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Equipamento:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {p.numeroPatrimonio !== 'Geral'
                            ? `${p.numeroPatrimonio} (${p.nomeModelo})`
                            : 'Geral / Sem vínculo'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Prazo Máximo:{' '}
                        <strong
                          className={
                            p.estaAtrasada
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-800 dark:text-slate-200 font-bold'
                          }
                        >
                          {new Date(p.prazoLimite).toLocaleDateString('pt-BR')}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {isResolvida && p.solucaoAplicada && (
                    <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                      <strong>Como foi consertado:</strong> {p.solucaoAplicada}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  {!isResolvida ? (
                    <button
                      onClick={() => handleOpenResolver(p)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar como Consertado
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Consertado em {new Date(p.dataResolucao || '').toLocaleDateString('pt-BR')}
                    </span>
                  )}

                  <button
                    onClick={() => handleExcluir(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-955/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Anotar Problema para Conserto
              </h3>
              <button
                onClick={() => setShowNovoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSalvarNova} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O que quebrou ou deu defeito? *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Trocar bateria do rádio, tela do notebook falhando"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qual é o equipamento? (Opcional)
                </label>
                <select
                  value={maquinaId || ''}
                  onChange={(e) => setMaquinaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Problema Geral / Sem vínculo</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.numeroPatrimonio} - {m.nomeModelo} ({m.responsavel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quem vai consertar? *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Ex: Técnico de TI, Suporte, Mecânico"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prazo Limite para Consertar *
                  </label>
                  <input
                    type="date"
                    required
                    value={prazoLimite}
                    onChange={(e) => setPrazoLimite(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Anotações sobre o defeito (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Explique o que aconteceu para ajudar quem for consertar..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
                >
                  {saving ? 'Salvando...' : 'Salvar Problema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Concluir / Resolver Pendência */}
      {showResolverModal && pendenciaSelecionada && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Confirmar que o Problema foi Resolvido
              </h3>
              <button
                onClick={() => setShowResolverModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConcluirTratativa} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {pendenciaSelecionada.titulo}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Equipamento: {pendenciaSelecionada.numeroPatrimonio} | Quem consertou:{' '}
                  {pendenciaSelecionada.responsavel}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O que foi feito para consertar? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={solucaoAplicada}
                  onChange={(e) => setSolucaoAplicada(e.target.value)}
                  placeholder="Ex: Trocada a peça queimada por uma nova e testado com sucesso."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolverModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
                >
                  {saving ? 'Salvando...' : 'Confirmar Conserto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
