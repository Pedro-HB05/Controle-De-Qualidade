import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vistoria, Maquina, VistoriaInput } from '../types';
import {
  Plus,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  X,
  Trash2,
} from 'lucide-react';

export const Vistorias: React.FC = () => {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [maquinaId, setMaquinaId] = useState<number>(0);
  const [responsavelVistoria, setResponsavelVistoria] = useState<string>('');
  const [dataVistoria, setDataVistoria] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string>('Aprovado');
  const [observacoes, setObservacoes] = useState<string>('');
  const [criarPendencia, setCriarPendencia] = useState<boolean>(true);
  const [tituloPendencia, setTituloPendencia] = useState<string>('');
  const [responsavelTratativa, setResponsavelTratativa] = useState<string>('');
  const [prazoPendencia, setPrazoPendencia] = useState<string>('');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vData, mData] = await Promise.all([
        api.getVistorias({ status: filtroStatus }),
        api.getMaquinas(),
      ]);
      setVistorias(vData);
      setMaquinas(mData);
      if (mData.length > 0 && !maquinaId) {
        setMaquinaId(mData[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroStatus]);

  const handleOpenModal = () => {
    setErrorMsg(null);
    setDataVistoria(new Date().toISOString().split('T')[0]);
    setStatus('Aprovado');
    setObservacoes('');
    setCriarPendencia(true);
    setTituloPendencia('');
    setResponsavelTratativa('');
    setPrazoPendencia('');
    if (maquinas.length > 0) {
      setMaquinaId(maquinas[0].id);
    }
    setShowModal(true);
  };

  const handleSalvarVistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId) {
      setErrorMsg('Selecione uma máquina para vistoriar.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: VistoriaInput = {
      maquinaId,
      responsavelVistoria,
      dataVistoria: new Date(dataVistoria).toISOString(),
      status,
      observacoes,
      criarPendenciaSeReprovado: status !== 'Aprovado' && criarPendencia,
      tituloPendencia,
      responsavelTratativa,
      prazoPendencia: prazoPendencia ? new Date(prazoPendencia).toISOString() : undefined,
    };

    try {
      await api.criarVistoria(payload);
      setShowModal(false);
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar vistoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir o registro desta vistoria?')) return;
    try {
      await api.excluirVistoria(id);
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
            Checagens & Revisões
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Anote as conferências feitas nos equipamentos para registrar quem testou, a data e se está tudo funcionando.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Fazer Nova Checagem
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Filtrar por Situação:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'Aprovado', label: 'Aprovadas' },
            { id: 'Reprovado', label: 'Reprovadas (Com Defeito)' },
            { id: 'Aprovado com Restrição', label: 'Com Restrição' },
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

      {/* Lista de Vistorias */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          Carregando checagens...
        </div>
      ) : vistorias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Nenhuma checagem realizada ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clique no botão azul acima para registrar a primeira conferência de um equipamento.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Equipamento / Patrimônio</th>
                  <th className="py-3.5 px-4">Setor</th>
                  <th className="py-3.5 px-4">Quem Checou</th>
                  <th className="py-3.5 px-4">Data da Checagem</th>
                  <th className="py-3.5 px-4">Resultado</th>
                  <th className="py-3.5 px-4">Observações</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vistorias.map((v) => {
                  const isAprovado = v.status === 'Aprovado';
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {v.codigoVistoria}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {v.nomeModelo}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {v.numeroPatrimonio}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{v.setor}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {v.responsavelVistoria}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(v.dataVistoria).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isAprovado
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : v.status === 'Reprovado'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isAprovado ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {v.observacoes || 'Sem observações adicionais.'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleExcluir(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Excluir vistoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar Vistoria */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Registrar Checagem do Equipamento
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

            <form onSubmit={handleSalvarVistoria} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qual equipamento você conferiu? *
                </label>
                <select
                  value={maquinaId}
                  onChange={(e) => setMaquinaId(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.numeroPatrimonio} - {m.nomeModelo} ({m.responsavel} - {m.setor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quem fez a conferência? *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavelVistoria}
                    onChange={(e) => setResponsavelVistoria(e.target.value)}
                    placeholder="Seu nome ou quem testou"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Conferência *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataVistoria}
                    onChange={(e) => setDataVistoria(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O equipamento está funcionando? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Aprovado', label: '✅ Aprovado (Tudo Certo)' },
                    { id: 'Reprovado', label: '❌ Reprovado (Com Defeito)' },
                    { id: 'Aprovado com Restrição', label: '⚠️ Com Restrição (Aviso)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatus(item.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                        status === item.id
                          ? 'bg-slate-900 dark:bg-sky-600 text-white border-slate-900 dark:border-sky-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Anotações sobre a checagem (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva o que foi testado ou detalhes do estado do equipamento..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Se foi reprovado, abre seção de pendência automática */}
              {status !== 'Aprovado' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      🚨 Deseja já registrar esse problema para conserto?
                    </span>
                    <input
                      type="checkbox"
                      checked={criarPendencia}
                      onChange={(e) => setCriarPendencia(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </div>

                  {criarPendencia && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Qual foi o problema ou defeito?
                        </label>
                        <input
                          type="text"
                          value={tituloPendencia}
                          onChange={(e) => setTituloPendencia(e.target.value)}
                          placeholder="Ex: Câmera com conector frouxo, rádio não liga"
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Quem vai consertar?
                          </label>
                          <input
                            type="text"
                            value={responsavelTratativa}
                            onChange={(e) => setResponsavelTratativa(e.target.value)}
                            placeholder="Ex: Técnico de TI, Oficina"
                            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Data limite para conserto
                          </label>
                          <input
                            type="date"
                            value={prazoPendencia}
                            onChange={(e) => setPrazoPendencia(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  {saving ? 'Salvando...' : 'Salvar Checagem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
