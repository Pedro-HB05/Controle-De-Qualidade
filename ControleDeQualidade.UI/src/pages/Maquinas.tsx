import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Maquina, MaquinaInput } from '../types';
import {
  Plus,
  Search,
  Laptop,
  User,
  Building2,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Maquinas: React.FC = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMaisOpcoes, setShowMaisOpcoes] = useState<boolean>(false);

  // Form simplificado
  const [nomeModelo, setNomeModelo] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('');
  const [setor, setSetor] = useState<string>('Advocacia');
  const [patrimonio, setPatrimonio] = useState<string>('');
  const [status, setStatus] = useState<string>('Ativo');
  const [observacoes, setObservacoes] = useState<string>('');

  const carregarMaquinas = async () => {
    setLoading(true);
    try {
      const data = await api.getMaquinas({
        busca,
        status: filtroStatus,
      });
      setMaquinas(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMaquinas();
  }, [busca, filtroStatus]);

  const handleOpenModal = (m?: Maquina) => {
    setErrorMsg(null);
    setShowMaisOpcoes(false);
    if (m) {
      setEditingId(m.id);
      setNomeModelo(m.nomeModelo);
      setResponsavel(m.responsavel);
      setSetor(m.setor);
      setPatrimonio(m.numeroPatrimonio);
      setStatus(m.status);
      setObservacoes(m.observacoes || '');
    } else {
      setEditingId(null);
      setNomeModelo('');
      setResponsavel('');
      setSetor('Advocacia');
      setPatrimonio('');
      setStatus('Ativo');
      setObservacoes('');
    }
    setShowModal(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    // Se o código foi deixado em branco, geramos um simples identificador
    let codigoFinal = patrimonio.trim();
    if (!codigoFinal) {
      const prefixo = nomeModelo.trim().slice(0, 3).toUpperCase() || 'EQP';
      const aleatorio = Math.floor(100 + Math.random() * 900);
      codigoFinal = `${prefixo}-${aleatorio}`;
    }

    const payload: MaquinaInput = {
      numeroPatrimonio: codigoFinal,
      nomeModelo: nomeModelo.trim(),
      categoria: 'Geral',
      responsavel: responsavel.trim(),
      setor: setor.trim(),
      status,
      observacoes: observacoes.trim(),
    };

    try {
      if (editingId) {
        await api.atualizarMaquina(editingId, payload);
      } else {
        await api.criarMaquina(payload);
      }
      setShowModal(false);
      carregarMaquinas();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao salvar equipamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este equipamento da lista?')) return;
    try {
      await api.excluirMaquina(id);
      carregarMaquinas();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  // Botão rápido de 1 clique no card para alterar a situação
  const handleToggleStatus = async (m: Maquina) => {
    const novoStatus = m.status === 'Ativo' ? 'Em Manutenção' : 'Ativo';
    try {
      await api.atualizarMaquina(m.id, {
        numeroPatrimonio: m.numeroPatrimonio,
        nomeModelo: m.nomeModelo,
        categoria: m.categoria || 'Geral',
        responsavel: m.responsavel,
        setor: m.setor,
        status: novoStatus,
        proximaRevisao: m.proximaRevisao,
        observacoes: m.observacoes,
      });
      carregarMaquinas();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar situação.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de cadastro simples */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Máquinas & Equipamentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Cadastre computadores, celulares ou carros, veja com quem está e marque se está funcionando.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Equipamento
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
            placeholder="Buscar por nome, responsável ou código..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filtros em botões fáceis */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'Ativo', label: '✅ Funcionando' },
            { id: 'Em Manutenção', label: '⚠️ Com Defeito' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFiltroStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === st.id
                  ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Equipamentos */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          Carregando equipamentos...
        </div>
      ) : maquinas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Laptop className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Nenhum equipamento cadastrado ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clique no botão azul acima para cadastrar seu primeiro item de forma simples.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {maquinas.map((m) => {
            const isManutencao = m.status === 'Em Manutenção';
            return (
              <div
                key={m.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isManutencao
                    ? 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-200 dark:ring-amber-900/40'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Topo do Card: Código e Situação */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      {m.numeroPatrimonio}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isManutencao
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {isManutencao ? (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Com Defeito
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Funcionando
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nome do Equipamento */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-3 leading-snug">
                    {m.nomeModelo}
                  </h3>

                  {/* Informações Diretas */}
                  <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Com quem fica:{' '}
                        <strong className="text-slate-800 dark:text-slate-100">{m.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Setor ou Sala:{' '}
                        <strong className="text-slate-800 dark:text-slate-100">{m.setor}</strong>
                      </span>
                    </div>
                  </div>

                  {m.observacoes && (
                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl italic border border-slate-100 dark:border-slate-800/60">
                      "{m.observacoes}"
                    </p>
                  )}
                </div>

                {/* Ações do Card: Botão de 1 clique para alterar situação + editar/excluir */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isManutencao
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800'
                    }`}
                    title={isManutencao ? 'Marcar como consertado' : 'Avisar que quebrou'}
                  >
                    {isManutencao ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar Funcionando
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Avisar Defeito
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(m)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar dados"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExcluir(m.id)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir equipamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Simples de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingId ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSalvar} className="mt-4 space-y-3.5">
              {/* Campo 1: Nome do Equipamento */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  value={nomeModelo}
                  onChange={(e) => setNomeModelo(e.target.value)}
                  placeholder="Ex: Notebook Dell Inspiron, Gol Branco, Câmera Recepção"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              {/* Campo 2: Com quem fica? */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Com quem fica? (Pessoa ou Posto) *
                </label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Ex: Dr. Carlos, Portaria 1, TI"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              {/* Campo 3: Setor ou Sala */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Setor ou Sala *
                </label>
                <input
                  type="text"
                  required
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  placeholder="Ex: Advocacia, Segurança, Recepção"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              {/* Campo 4: Situação Atual (2 botões grandes) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Está funcionando agora?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Ativo')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'Ativo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sim, funcionando
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Em Manutenção')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'Em Manutenção'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Não, tem defeito
                  </button>
                </div>
              </div>

              {/* Opções Extras Recolhidas (Para não assustar o usuário leigo) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMaisOpcoes(!showMaisOpcoes)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
                >
                  {showMaisOpcoes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showMaisOpcoes ? 'Ocultar opções extras' : 'Opções extras (código ou anotação)'}
                </button>

                {showMaisOpcoes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Código / Etiqueta de Patrimônio (Opcional)
                      </label>
                      <input
                        type="text"
                        value={patrimonio}
                        onChange={(e) => setPatrimonio(e.target.value)}
                        placeholder="Deixe em branco para gerar automático"
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 font-mono uppercase text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Anotações ou Detalhes (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Ex: Fica na sala 2, comprado novo..."
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
