import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Maquina, MaquinaInput } from '../types';
import {
  Plus,
  Search,
  Filter,
  Laptop,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
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

  // Setores únicos para o filtro
  const setoresUnicos = Array.from(new Set(maquinas.map((m) => m.setor).filter(Boolean)));

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de cadastro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Controle de Máquinas & Patrimônio</h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os equipamentos, identifique o responsável por cada máquina e acompanhe o estado operacional.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Máquina / Equipamento
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por patrimônio, modelo ou responsável..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="Ativo">Ativo / Em Uso</option>
            <option value="Em Manutenção">Em Manutenção</option>
            <option value="Disponível">Disponível no Estoque</option>
            <option value="Desativado">Desativado</option>
          </select>

          {/* Filtro Setor */}
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
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
        <div className="py-12 text-center text-slate-400 text-xs">Carregando patrimônio...</div>
      ) : maquinas.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">Nenhum equipamento encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre seu primeiro equipamento usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {maquinas.map((m) => {
            const isManutencao = m.status === 'Em Manutenção';
            return (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded-lg border border-sky-100">
                      {m.numeroPatrimonio}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isManutencao
                          ? 'bg-amber-100 text-amber-800'
                          : m.status === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      ● {m.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3 leading-tight">
                    {m.nomeModelo}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.categoria}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Responsável: <strong className="text-slate-800">{m.responsavel}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Setor: <strong className="text-slate-800">{m.setor}</strong>
                      </span>
                    </div>

                    {m.proximaRevisao && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Próx. Revisão:{' '}
                          <strong className="text-slate-800">
                            {new Date(m.proximaRevisao).toLocaleDateString('pt-BR')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {m.observacoes && (
                    <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                      "{m.observacoes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    {m.totalVistorias ?? 0} vistorias realizadas
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(m)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Editar máquina"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExcluir(m.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Editar Equipamento' : 'Novo Equipamento / Patrimônio'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSalvar} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nº Patrimônio / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={patrimonio}
                    onChange={(e) => setPatrimonio(e.target.value)}
                    placeholder="Ex: PAT-010"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Informática">Informática (Notebook, PC)</option>
                    <option value="Comunicação">Comunicação (Rádio HT)</option>
                    <option value="CFTV">CFTV / Câmeras</option>
                    <option value="Segurança">Segurança / Alarme</option>
                    <option value="Veículo">Veículo / Viatura</option>
                    <option value="Mobiliário">Mobiliário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome / Modelo do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  value={nomeModelo}
                  onChange={(e) => setNomeModelo(e.target.value)}
                  placeholder="Ex: Notebook Dell Vostro 3520"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável (Com quem está) *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Ex: Dra. Andressa, Pedro"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Setor *</label>
                  <input
                    type="text"
                    required
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    placeholder="Ex: Advocacia, Segurança, Portaria"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Operacional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Ativo">Ativo / Funcionando</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Disponível">Disponível no Estoque</option>
                    <option value="Desativado">Desativado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Próxima Revisão / Checagem</label>
                  <input
                    type="date"
                    value={proximaRevisao}
                    onChange={(e) => setProximaRevisao(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Detalhes</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais, número de série, etc."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
