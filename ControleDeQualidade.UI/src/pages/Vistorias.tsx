import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vistoria, Maquina, VistoriaInput } from '../types';
import {
  Plus,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  X,
  Trash2,
  Calendar,
  User,
  Laptop,
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

  // Form simplificado
  const [maquinaId, setMaquinaId] = useState<number>(0);
  const [responsavelVistoria, setResponsavelVistoria] = useState<string>('');
  const [dataVistoria, setDataVistoria] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string>('Aprovado'); // 'Aprovado' ou 'Reprovado'
  const [defeitoDescricao, setDefeitoDescricao] = useState<string>('');
  const [observacoesExtras, setObservacoesExtras] = useState<string>('');

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
    setDefeitoDescricao('');
    setObservacoesExtras('');
    if (maquinas.length > 0) {
      setMaquinaId(maquinas[0].id);
    }
    setShowModal(true);
  };

  const handleSalvarVistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId) {
      setErrorMsg('Por favor, selecione qual equipamento você conferiu.');
      return;
    }

    if (status === 'Reprovado' && !defeitoDescricao.trim()) {
      setErrorMsg('Por favor, informe qual defeito você encontrou no equipamento.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: VistoriaInput = {
      maquinaId,
      responsavelVistoria: responsavelVistoria.trim() || 'Inspetor',
      dataVistoria: new Date(dataVistoria).toISOString(),
      status,
      observacoes: status === 'Reprovado'
        ? defeitoDescricao.trim() + (observacoesExtras ? ` (${observacoesExtras.trim()})` : '')
        : observacoesExtras.trim() || 'Equipamento conferido e funcionando normalmente.',
      criarPendenciaSeReprovado: status === 'Reprovado',
      tituloPendencia: defeitoDescricao.trim(),
    };

    try {
      await api.criarVistoria(payload);
      setShowModal(false);
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar checagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja apagar o registro desta checagem?')) return;
    try {
      await api.excluirVistoria(id);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de checagem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Revisões Preventivas & Testes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Registre as checagens técnicas feitas pela equipe de TI nos computadores e notebooks para garantir que estão 100% operacionais.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Revisão
        </button>
      </div>

      {/* Filtros em botões simples */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Filtrar revisões:
        </span>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'todos', label: 'Todas as Revisões' },
            { id: 'Aprovado', label: '✅ Apenas Aprovadas' },
            { id: 'Reprovado', label: '❌ Com Defeito' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFiltroStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === st.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Checagens */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
          Carregando checagens...
        </div>
      ) : vistorias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Nenhuma revisão técnica registrada ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clique no botão verde acima para registrar o primeiro teste técnico em um equipamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {vistorias.map((v) => {
            const isAprovado = v.status === 'Aprovado';
            return (
              <div
                key={v.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  !isAprovado
                    ? 'border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-100 dark:ring-rose-900/30'
                    : 'border-slate-200/80 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Topo do Card: Data e Resultado */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg">
                      {new Date(v.dataVistoria).toLocaleDateString('pt-BR')}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isAprovado
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isAprovado ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Aprovado
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Com Defeito
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nome do Equipamento */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-3 leading-snug">
                    {v.nomeModelo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Patrimônio: {v.numeroPatrimonio}
                  </p>

                  {/* Detalhes */}
                  <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Técnico de TI:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {v.responsavelVistoria}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Setor: <strong className="text-slate-800 dark:text-slate-200">{v.setor}</strong>
                      </span>
                    </div>
                  </div>

                  {v.observacoes && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs ${
                        !isAprovado
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40'
                          : v.observacoes.includes('[Reparo Concluído')
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40'
                          : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60'
                      }`}
                    >
                      {!isAprovado && <strong className="block mb-0.5 font-bold">Defeito anotado:</strong>}
                      {isAprovado && v.observacoes.includes('[Reparo Concluído') && (
                        <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reparado & Aprovado com sucesso</span>
                        </div>
                      )}
                      {v.observacoes}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px]">{v.codigoVistoria}</span>
                  <button
                    onClick={() => handleExcluir(v.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Apagar este registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Fazer Checagem Simples */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Cadastrar Revisão Técnica
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

            <form onSubmit={handleSalvarVistoria} className="mt-4 space-y-3.5">
              {/* Campo 1: Selecionar Equipamento */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Qual equipamento você testou? *
                </label>
                {maquinas.length === 0 ? (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Nenhum equipamento cadastrado ainda. Cadastre um equipamento primeiro.
                  </p>
                ) : (
                  <select
                    value={maquinaId}
                    onChange={(e) => setMaquinaId(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {maquinas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nomeModelo} (Tag: {m.numeroPatrimonio} — com {m.responsavel})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Campo 2: Técnico e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Técnico de TI responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavelVistoria}
                    onChange={(e) => setResponsavelVistoria(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Data da revisão técnica *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataVistoria}
                    onChange={(e) => setDataVistoria(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Campo 3: Resultado (2 Botões Grandes) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Como está o equipamento? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Aprovado')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'Aprovado'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tudo Certo (Aprovado)
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Reprovado')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      status === 'Reprovado'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Tem Defeito (Reprovado)
                  </button>
                </div>
              </div>

              {/* Se foi Reprovado: Campo direto e obrigatório para dizer o que quebrou */}
              {status === 'Reprovado' && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900 dark:text-rose-200">
                    O que está quebrado ou com defeito? *
                  </label>
                  <input
                    type="text"
                    required
                    value={defeitoDescricao}
                    onChange={(e) => setDefeitoDescricao(e.target.value)}
                    placeholder="Ex: Teclado travado, não liga, cabo arrebentado..."
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    💡 O sistema já vai marcar o equipamento como "Com Defeito" e anotar o conserto na aba de Manutenções & Prazos automaticamente.
                  </p>
                </div>
              )}

              {/* Anotação Opcional (Se Aprovado) */}
              {status === 'Aprovado' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Anotação extra (Opcional)
                  </label>
                  <input
                    type="text"
                    value={observacoesExtras}
                    onChange={(e) => setObservacoesExtras(e.target.value)}
                    placeholder="Ex: Limpeza feita, bateria com 100%..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

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
                  disabled={saving || maquinas.length === 0}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 text-center"
                >
                  {saving ? 'Salvando...' : 'Salvar Revisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
