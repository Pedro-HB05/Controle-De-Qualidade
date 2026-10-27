import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Inspecao, Lote, TipoDefeito, GravidadeDefeito, StatusInspecao } from '../types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface DefeitoInput {
  tipoDefeitoId: number;
  quantidade: number;
  gravidade: GravidadeDefeito;
  observacao: string;
}

export const Inspecoes: React.FC = () => {
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [tiposDefeitos, setTiposDefeitos] = useState<TipoDefeito[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [loteId, setLoteId] = useState<number>(0);
  const [inspetor, setInspetor] = useState<string>('');
  const [quantidadeInspecionada, setQuantidadeInspecionada] = useState<number>(50);
  const [quantidadeAprovada, setQuantidadeAprovada] = useState<number>(50);
  const [quantidadeRejeitada, setQuantidadeRejeitada] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');
  const [gerarRnc, setGerarRnc] = useState<boolean>(true);
  const [defeitos, setDefeitos] = useState<DefeitoInput[]>([]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [inspData, lotesData, defeitosData] = await Promise.all([
        api.getInspecoes(),
        api.getLotes(),
        api.getTiposDefeitos(),
      ]);
      setInspecoes(inspData);
      setLotes(lotesData);
      setTiposDefeitos(defeitosData);
      if (lotesData.length > 0) setLoteId(lotesData[0].id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleQtdAprovadaChange = (aprovada: number) => {
    setQuantidadeAprovada(aprovada);
    const rejeitada = Math.max(0, quantidadeInspecionada - aprovada);
    setQuantidadeRejeitada(rejeitada);
  };

  const handleQtdRejeitadaChange = (rejeitada: number) => {
    setQuantidadeRejeitada(rejeitada);
    const aprovada = Math.max(0, quantidadeInspecionada - rejeitada);
    setQuantidadeAprovada(aprovada);
  };

  const handleAddDefeito = () => {
    if (tiposDefeitos.length === 0) return;
    setDefeitos([
      ...defeitos,
      {
        tipoDefeitoId: tiposDefeitos[0].id,
        quantidade: 1,
        gravidade: 'Media',
        observacao: '',
      },
    ]);
  };

  const handleRemoveDefeito = (index: number) => {
    setDefeitos(defeitos.filter((_, i) => i !== index));
  };

  const handleSalvarInspecao = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loteId) {
      setFormError('Selecione um lote de produção.');
      return;
    }
    if (!inspetor.trim()) {
      setFormError('Informe o nome do inspetor responsável.');
      return;
    }
    if (quantidadeInspecionada <= 0) {
      setFormError('A quantidade inspecionada deve ser maior que zero.');
      return;
    }
    if (quantidadeAprovada + quantidadeRejeitada > quantidadeInspecionada) {
      setFormError('A soma de aprovados e rejeitados não pode ultrapassar o total inspecionado.');
      return;
    }

    setSaving(true);
    try {
      await api.criarInspecao({
        loteId,
        inspetor: inspetor.trim(),
        dataInspecao: new Date().toISOString(),
        quantidadeInspecionada,
        quantidadeAprovada,
        quantidadeRejeitada,
        observacoes,
        gerarRncSeReprovado: gerarRnc,
        defeitosIdentificados: defeitos.map((d) => ({
          tipoDefeitoId: d.tipoDefeitoId,
          quantidade: d.quantidade,
          gravidade: d.gravidade,
          observacao: d.observacao,
        })),
      });

      setShowModal(false);
      // Reset form
      setObservacoes('');
      setDefeitos([]);
      setQuantidadeAprovada(50);
      setQuantidadeRejeitada(0);
      carregarDados();
    } catch (err: any) {
      setFormError(err?.message || 'Falha ao registrar inspeção.');
    } finally {
      setSaving(false);
    }
  };

  const inspecoesFiltradas = inspecoes.filter((i) => {
    const matchStatus = filtroStatus === 'todos' || i.status === filtroStatus;
    const matchBusca =
      !busca ||
      i.codigoInspecao.toLowerCase().includes(busca.toLowerCase()) ||
      i.inspetor.toLowerCase().includes(busca.toLowerCase()) ||
      i.numeroLote.toLowerCase().includes(busca.toLowerCase()) ||
      i.produtoNome.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: StatusInspecao) => {
    switch (status) {
      case 'Aprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Aprovado
          </span>
        );
      case 'Reprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Reprovado
          </span>
        );
      case 'AprovadoComRestricao':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Aprovado c/ Restrição
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inspeções de Qualidade</h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro estruturado de verificações de lote, controle de amostragem e apontamento de defeitos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Inspeção
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, lote, produto ou inspetor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="Aprovado">Aprovados</option>
            <option value="Reprovado">Reprovados</option>
            <option value="AprovadoComRestricao">Aprovados com Restrição</option>
          </select>
        </div>
      </div>

      {/* Tabela de Inspeções */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Carregando inspeções...</div>
        ) : inspecoesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhuma inspeção encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Código / Data</th>
                  <th className="py-3.5 px-4">Lote / Produto</th>
                  <th className="py-3.5 px-4">Inspetor</th>
                  <th className="py-3.5 px-4 text-center">Amostra (Peças)</th>
                  <th className="py-3.5 px-4 text-center">Taxa de Conformidade</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Defeitos Apontados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {inspecoesFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{item.codigoInspecao}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(item.dataInspecao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.numeroLote}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{item.produtoNome}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{item.inspetor}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-semibold text-slate-900">{item.quantidadeInspecionada} un</div>
                      <div className="text-xs text-slate-400">
                        {item.quantidadeAprovada} aprov / {item.quantidadeRejeitada} rej
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-slate-900">
                        {item.taxaAprovacaoPercentual.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4">
                      {item.defeitos && item.defeitos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.defeitos.map((d, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                              title={d.observacao}
                            >
                              {d.nomeDefeito || d.codigoDefeito}: {d.quantidade} un
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sem defeitos</span>
                      )}
                      {item.rncGeradaId && (
                        <div className="mt-1">
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            RNC #{item.rncGeradaId} Aberta
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro de Nova Inspeção */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Registrar Inspeção de Qualidade</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarInspecao} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Lote & Inspetor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lote de Fabricação *
                  </label>
                  <select
                    value={loteId}
                    onChange={(e) => setLoteId(Number(e.target.value))}
                    required
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {lotes.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.numeroLote} - {l.nomeProduto} ({l.quantidadeTotal} un)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inspetor Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={inspetor}
                    onChange={(e) => setInspetor(e.target.value)}
                    placeholder="Ex: Inspetor de Qualidade"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Quantidades Amostradas */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qtd. Inspecionada *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantidadeInspecionada}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuantidadeInspecionada(val);
                      setQuantidadeAprovada(val);
                      setQuantidadeRejeitada(0);
                    }}
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">
                    Qtd. Aprovada *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantidadeInspecionada}
                    required
                    value={quantidadeAprovada}
                    onChange={(e) => handleQtdAprovadaChange(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-emerald-300 rounded-lg px-3 py-1.5 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    Qtd. Rejeitada *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantidadeInspecionada}
                    required
                    value={quantidadeRejeitada}
                    onChange={(e) => handleQtdRejeitadaChange(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-rose-300 rounded-lg px-3 py-1.5 font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Apontamento de Defeitos Específicos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Defeitos Específicos Identificados ({defeitos.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDefeito}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Falha
                  </button>
                </div>

                {defeitos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                    Nenhum defeito adicionado. Se houver peças rejeitadas, adicione o tipo de defeito correspondente.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {defeitos.map((def, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <select
                          value={def.tipoDefeitoId}
                          onChange={(e) => {
                            const updated = [...defeitos];
                            updated[idx].tipoDefeitoId = Number(e.target.value);
                            setDefeitos(updated);
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                        >
                          {tiposDefeitos.map((td) => (
                            <option key={td.id} value={td.id}>
                              {td.codigo} - {td.nome} ({td.categoria})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={def.quantidade}
                          onChange={(e) => {
                            const updated = [...defeitos];
                            updated[idx].quantidade = Number(e.target.value);
                            setDefeitos(updated);
                          }}
                          className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-center font-bold"
                        />

                        <input
                          type="text"
                          placeholder="Obs / Local da falha"
                          value={def.observacao}
                          onChange={(e) => {
                            const updated = [...defeitos];
                            updated[idx].observacao = e.target.value;
                            setDefeitos(updated);
                          }}
                          className="w-40 bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveDefeito(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Gerais da Inspeção
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Parecer do inspetor, condições do ensaio ou liberação com restrição..."
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              {/* Opção de Gerar RNC Automática */}
              <div className="flex items-center gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="gerarRnc"
                  checked={gerarRnc}
                  onChange={(e) => setGerarRnc(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <label htmlFor="gerarRnc" className="text-xs text-amber-900 cursor-pointer">
                  <span className="font-bold">Gerar RNC Automática:</span> Se a inspeção for reprovada ou com
                  restrição, abrir automaticamente um Relatório de Não Conformidade.
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Salvar Inspeção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
