import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Maquina, MaquinaInput } from '../types';
import {
  Plus,
  Search,
  Laptop,
  User,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const Maquinas: React.FC = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [patrimonio, setPatrimonio] = useState<string>('');
  const [nomeModelo, setNomeModelo] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Informática');
  const [responsavel, setResponsavel] = useState<string>('');
  const [setor, setSetor] = useState<string>('Advocacia');
  const [status, setStatus] = useState<string>('Ativo');
  const [proximaRevisao, setProximaRevisao] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  const carregarMaquinas = async () => {
    setLoading(true);
    try {
      const data = await api.getMaquinas({
        busca,
        setor: filtroSetor,
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
  }, [busca, filtroStatus, filtroSetor]);

  const handleOpenModal = (m?: Maquina) => {
    setErrorMsg(null);
    if (m) {
      setEditingId(m.id);
      setPatrimonio(m.numeroPatrimonio);
      setNomeModelo(m.nomeModelo);
      setCategoria(m.categoria);
      setResponsavel(m.responsavel);
      setSetor(m.setor);
      setStatus(m.status);
      setProximaRevisao(m.proximaRevisao ? m.proximaRevisao.split('T')[0] : '');
      setObservacoes(m.observacoes || '');
    } else {
      setEditingId(null);
      setPatrimonio('');
      setNomeModelo('');
      setCategoria('Informática');
      setResponsavel('');
      setSetor('Advocacia');
      setStatus('Ativo');
      setProximaRevisao('');
      setObservacoes('');
    }
    setShowModal(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload: MaquinaInput = {
      numeroPatrimonio: patrimonio,
      nomeModelo,
      categoria,
      responsavel,
      setor,
      status,
      proximaRevisao: proximaRevisao ? new Date(proximaRevisao).toISOString() : undefined,
      observacoes,
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
      setErrorMsg(err?.message || 'Falha ao salvar máquina.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este equipamento do patrimônio?')) return;
    try {
      await api.excluirMaquina(id);
      carregarMaquinas();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  const setoresUnicos = Array.from(new Set(maquinas.map((m) => m.setor).filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de cadastro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Máquinas & Equipamentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Cadastre computadores, veículos ou rádios, veja com quem fica cada item e se está funcionando.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Equipamento
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, código ou responsável..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full sm:w-auto text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="Ativo">Funcionando Normal</option>
            <option value="Em Manutenção">Em Manutenção / Quebrado</option>
            <option value="Disponível">Guardado / No Estoque</option>
            <option value="Desativado">Desativado</option>
          </select>

          {/* Filtro Setor */}
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="w-full sm:w-auto text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="todos">Todos os Setores</option>
            {setoresUnicos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista / Tabela de Equipamentos */}
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
            Clique no botão azul acima para cadastrar seu primeiro item (ex: notebook, carro, rádio).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {maquinas.map((m) => {
            const isManutencao = m.status === 'Em Manutenção';
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold rounded-lg border border-sky-100 dark:border-sky-900/60">
                      {m.numeroPatrimonio}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isManutencao
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : m.status === 'Ativo'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ● {m.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-3 leading-tight">
                    {m.nomeModelo}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.categoria}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Responsável:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{m.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Setor: <strong className="text-slate-800 dark:text-slate-200">{m.setor}</strong>
                      </span>
                    </div>

                    {m.proximaRevisao && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Próx. Revisão:{' '}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {new Date(m.proximaRevisao).toLocaleDateString('pt-BR')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {m.observacoes && (
                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg italic border border-slate-100 dark:border-slate-800/60">
                      "{m.observacoes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {m.totalVistorias ?? 0} checagens feitas
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(m)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar máquina"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExcluir(m.id)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir máquina"
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

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-955/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {editingId ? 'Editar Equipamento' : 'Novo Equipamento / Patrimônio'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSalvar} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código ou Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    value={patrimonio}
                    onChange={(e) => setPatrimonio(e.target.value)}
                    placeholder="Ex: NOTE-01, HT-05, PLACA-1234"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo do Item
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Informática">Informática (Notebook, PC, Impressora)</option>
                    <option value="Comunicação">Comunicação (Rádio HT, Celular)</option>
                    <option value="CFTV">CFTV / Câmeras de Segurança</option>
                    <option value="Segurança">Segurança / Alarme</option>
                    <option value="Veículo">Veículo / Viatura</option>
                    <option value="Mobiliário">Móveis / Cadeiras</option>
                    <option value="Outro">Outro Equipamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  value={nomeModelo}
                  onChange={(e) => setNomeModelo(e.target.value)}
                  placeholder="Ex: Notebook Dell Inspiron, Gol Branco 2022"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Com quem fica? (Responsável) *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Ex: Dr. Carlos, Portaria 1, TI"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Setor ou Sala *
                  </label>
                  <input
                    type="text"
                    required
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    placeholder="Ex: Advocacia, Segurança, Recepção"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Situação Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Ativo">Funcionando Normal</option>
                    <option value="Em Manutenção">Em Manutenção / Quebrado</option>
                    <option value="Disponível">Guardado / No Estoque</option>
                    <option value="Desativado">Desativado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Próxima Revisão (Opcional)
                  </label>
                  <input
                    type="date"
                    value={proximaRevisao}
                    onChange={(e) => setProximaRevisao(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Anotações Extras (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Alguma informação importante sobre o equipamento (ex: fica na mesa 2, comprado novo em jan/2026)..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

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
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
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
