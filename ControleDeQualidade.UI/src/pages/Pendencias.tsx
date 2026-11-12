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
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const Pendencias: React.FC = () => {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modal Novo Problema
  const [showNovoModal, setShowNovoModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [maquinaId, setMaquinaId] = useState<number | undefined>(undefined);
  const [responsavel, setResponsavel] = useState<string>('');
  const [prazoLimite, setPrazoLimite] = useState<string>('');

  // Modal Rápido de Resolução
  const [showResolverModal, setShowResolverModal] = useState<boolean>(false);
  const [pendenciaSelecionada, setPendenciaSelecionada] = useState<Pendencia | null>(null);
  const [solucaoRapida, setSolucaoRapida] = useState<string>('');

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

  const aplicarPrazoAtalho = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    setPrazoLimite(d.toISOString().split('T')[0]);
  };

  const handleOpenNovoModal = () => {
    setErrorMsg(null);
    setTitulo('');
    setDescricao('');
    setMaquinaId(undefined);
    setResponsavel('');
    aplicarPrazoAtalho(3); // Padrão: 3 dias
    setShowNovoModal(true);
  };

  const handleSalvarNova = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload: PendenciaInput = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      maquinaId,
      setor: 'Geral',
      responsavel: responsavel.trim(),
      prazoLimite: new Date(prazoLimite).toISOString(),
    };

    try {
      await api.criarPendencia(payload);
      setShowNovoModal(false);
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar problema.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResolver = (p: Pendencia) => {
    setPendenciaSelecionada(p);
    setSolucaoRapida('Consertado e testado com sucesso');
    setShowResolverModal(true);
  };

  const handleConfirmarConserto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendenciaSelecionada) return;
    setSaving(true);
    try {
      await api.resolverPendencia(pendenciaSelecionada.id, {
        solucaoAplicada: solucaoRapida.trim() || 'Consertado com sucesso',
        status: 'Resolvida',
      });
      setShowResolverModal(false);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Falha ao concluir conserto.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja apagar este registro de problema?')) return;
    try {
      await api.excluirPendencia(id);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de nova manutenção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Manutenções & Prazos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Acompanhe equipamentos em conserto, quem está responsável pelo reparo e a data limite de entrega.
          </p>
        </div>

        <button
          onClick={handleOpenNovoModal}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Manutenção
        </button>
      </div>

      {/* Busca e Filtros Rápidos */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por defeito, equipamento ou técnico..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'todos', label: 'Todas as Manutenções' },
            { id: 'Aberta', label: '⏳ Em Manutenção' },
            { id: 'Atrasadas', label: '⚠️ Prazo Vencido' },
            { id: 'Resolvida', label: '✅ Concluídas' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFiltroStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === st.id
                  ? 'bg-slate-900 dark:bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Manutenções */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          Carregando manutenções...
        </div>
      ) : pendencias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Tudo em ordem! Nenhuma manutenção em aberto
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Todos os equipamentos estão operacionais e a fila de manutenções está zerada.
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
                  {/* Topo do Card: Código e Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                      {p.codigoPendencia}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isResolvida
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : p.estaAtrasada
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isResolvida ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Manutenção Concluída
                        </>
                      ) : p.estaAtrasada ? (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Prazo Vencido
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Em Reparo
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nome do Problema */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-3 leading-snug">
                    {p.titulo}
                  </h3>

                  {/* Detalhes de Quem e Prazos */}
                  <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Equipamento:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {p.numeroPatrimonio !== 'Geral'
                            ? `${p.numeroPatrimonio} (${p.nomeModelo || 'Item'})`
                            : 'Geral / Sem vínculo'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Técnico de TI:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{p.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Prazo de entrega / SLA:{' '}
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

                  {/* Se já foi resolvido: mostrar solução */}
                  {isResolvida && p.solucaoAplicada && (
                    <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      <strong className="block font-bold mb-0.5">Como foi reparado:</strong>
                      {p.solucaoAplicada}
                    </div>
                  )}

                  {/* Observação original */}
                  {!isResolvida && p.descricao && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      {p.descricao}
                    </p>
                  )}
                </div>

                {/* Rodapé: Botão de 1 clique para Marcar como Consertado */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {!isResolvida ? (
                    <button
                      onClick={() => handleOpenResolver(p)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Concluir Manutenção
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluída
                    </span>
                  )}

                  <button
                    onClick={() => handleExcluir(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Excluir registro de manutenção"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Nova Manutenção */}
      {showNovoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Registrar Manutenção de Equipamento
              </h3>
              <button
                onClick={() => setShowNovoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSalvarNova} className="mt-4 space-y-3.5">
              {/* Campo 1: O que quebrou? */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Defeito ou motivo da manutenção *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Teclado travando, notebook não liga, troca de fonte, troca de pasta térmica..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Campo 2: Qual equipamento? */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Qual é o equipamento em manutenção? (Opcional)
                </label>
                <select
                  value={maquinaId || ''}
                  onChange={(e) => setMaquinaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Manutenção Geral de TI / Sem equipamento específico</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nomeModelo} (Tag: {m.numeroPatrimonio} — com {m.responsavel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo 3: Quem vai consertar? */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Técnico ou assistência responsável *
                </label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Ex: Lucas (TI), Suporte N2, Assistência Dell"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Campo 4: Prazo com atalhos de 1 clique */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Prazo Limite para Entrega / SLA *
                  </label>
                  <span className="text-[11px] text-slate-400">Atalhos rápidos:</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => aplicarPrazoAtalho(0)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPrazoAtalho(3)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Em 3 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPrazoAtalho(7)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Em 1 semana
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPrazoAtalho(15)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Em 15 dias
                  </button>
                </div>

                <input
                  type="date"
                  required
                  value={prazoLimite}
                  onChange={(e) => setPrazoLimite(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Campo 5: Anotação Opcional */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mais detalhes sobre o defeito (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Alguma informação extra que ajude quem vai consertar..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Botões do Rodapé */}
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
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
                >
                  {saving ? 'Salvando...' : 'Salvar Manutenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido: Confirmar Conserto com 1 Clique */}
      {showResolverModal && pendenciaSelecionada && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Concluir Manutenção do Equipamento
              </h3>
              <button
                onClick={() => setShowResolverModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarConserto} className="mt-4 space-y-3.5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {pendenciaSelecionada.titulo}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Equipamento: {pendenciaSelecionada.numeroPatrimonio}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O que foi feito no equipamento? (Opcional)
                </label>
                <input
                  type="text"
                  value={solucaoRapida}
                  onChange={(e) => setSolucaoRapida(e.target.value)}
                  placeholder="Ex: Trocado teclado, reinstalado Windows e testado..."
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
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Confirmar Manutenção Concluída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
