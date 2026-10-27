import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NaoConformidade, Lote, GravidadeDefeito, StatusNaoConformidade } from '../types';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  FileEdit,
  ShieldAlert,
} from 'lucide-react';

export const NaoConformidades: React.FC = () => {
  const [rncs, setRncs] = useState<NaoConformidade[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');

  // Modals
  const [showNovoModal, setShowNovoModal] = useState<boolean>(false);
  const [showTratativaModal, setShowTratativaModal] = useState<boolean>(false);
  const [rncSelecionada, setRncSelecionada] = useState<NaoConformidade | null>(null);

  // Form Nova RNC
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [origem, setOrigem] = useState<string>('Chão de Fábrica');
  const [loteId, setLoteId] = useState<number | undefined>(undefined);
  const [responsavel, setResponsavel] = useState<string>('');
  const [gravidade, setGravidade] = useState<GravidadeDefeito>('Media');
  const [prazo, setPrazo] = useState<string>('');

  // Form Tratativa
  const [causaRaiz, setCausaRaiz] = useState<string>('');
  const [acaoImediata, setAcaoImediata] = useState<string>('');
  const [acaoCorretiva, setAcaoCorretiva] = useState<string>('');
  const [responsavelTratativa, setResponsavelTratativa] = useState<string>('');
  const [novoStatus, setNovoStatus] = useState<StatusNaoConformidade>('EmTratativa');
  const [concluir, setConcluir] = useState<boolean>(false);
  const [tratativaObs, setTratativaObs] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [rncsData, lotesData] = await Promise.all([
        api.getNaoConformidades(),
        api.getLotes(),
      ]);
      setRncs(rncsData);
      setLotes(lotesData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAbrirTratativa = (rnc: NaoConformidade) => {
    setRncSelecionada(rnc);
    setCausaRaiz(rnc.causaRaiz || '');
    setAcaoImediata(rnc.acaoImediata || '');
    setAcaoCorretiva(rnc.acaoCorretiva || '');
    setResponsavelTratativa(rnc.responsavelTratativa || '');
    setNovoStatus(rnc.status === 'Aberta' ? 'EmTratativa' : rnc.status);
    setConcluir(rnc.status === 'Resolvida');
    setTratativaObs(rnc.observacoes || '');
    setShowTratativaModal(true);
  };

  const handleSalvarTratativa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rncSelecionada) return;
    setErrorMsg(null);
    setSaving(true);
    try {
      await api.registrarTratativa(rncSelecionada.id, {
        causaRaiz,
        acaoImediata,
        acaoCorretiva,
        responsavelTratativa,
        status: concluir ? 'Resolvida' : novoStatus,
        concluirTratativa: concluir,
        observacoes: tratativaObs,
      });
      setShowTratativaModal(false);
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar tratativa.');
    } finally {
      setSaving(false);
    }
  };

  const handleCriarNovaRnc = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    try {
      await api.criarNaoConformidade({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        origem,
        loteId: loteId ? Number(loteId) : null,
        responsavelTratativa: responsavel.trim(),
        gravidade,
        status: 'Aberta',
        prazoConclusao: prazo ? new Date(prazo).toISOString() : null,
      });
      setShowNovoModal(false);
      setTitulo('');
      setDescricao('');
      setResponsavel('');
      setPrazo('');
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao abrir RNC.');
    } finally {
      setSaving(false);
    }
  };

  const rncsFiltradas = rncs.filter((r) => {
    const matchStatus = filtroStatus === 'todos' || r.status === filtroStatus;
    const matchBusca =
      !busca ||
      r.numeroRnc.toLowerCase().includes(busca.toLowerCase()) ||
      r.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      r.responsavelTratativa.toLowerCase().includes(busca.toLowerCase()) ||
      (r.numeroLote && r.numeroLote.toLowerCase().includes(busca.toLowerCase()));
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: StatusNaoConformidade) => {
    switch (status) {
      case 'Aberta':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Aberta
          </span>
        );
      case 'EmAnalise':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Em Análise
          </span>
        );
      case 'EmTratativa':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Em Tratativa
          </span>
        );
      case 'Resolvida':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolvida
          </span>
        );
      case 'Cancelada':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelada
          </span>
        );
    }
  };

  const getGravidadeBadge = (gravidade: GravidadeDefeito) => {
    switch (gravidade) {
      case 'Critica':
        return <span className="font-bold text-rose-600 text-xs">Crítica</span>;
      case 'Grave':
        return <span className="font-semibold text-orange-600 text-xs">Grave</span>;
      case 'Media':
        return <span className="font-medium text-amber-600 text-xs">Média</span>;
      case 'Leve':
        return <span className="font-medium text-slate-500 text-xs">Leve</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gerenciamento de Não Conformidades (RNC)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle e rastreamento de desvios, análise de causa raiz e implementação de ações corretivas.
          </p>
        </div>

        <button
          onClick={() => setShowNovoModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Abrir Nova RNC
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número RNC, título, lote ou responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
            <option value="Aberta">Abertas</option>
            <option value="EmAnalise">Em Análise</option>
            <option value="EmTratativa">Em Tratativa</option>
            <option value="Resolvida">Resolvidas</option>
          </select>
        </div>
      </div>

      {/* Lista de RNCs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Carregando Não Conformidades...</div>
        ) : rncsFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhuma Não Conformidade encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">RNC / Abertura</th>
                  <th className="py-3.5 px-4">Título & Desvio</th>
                  <th className="py-3.5 px-4">Lote Afetado</th>
                  <th className="py-3.5 px-4">Gravidade</th>
                  <th className="py-3.5 px-4">Responsável</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rncsFiltradas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{r.numeroRnc}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(r.dataAbertura).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 leading-tight">{r.titulo}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{r.descricao}</div>
                      {r.emAtraso && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-1">
                          <Clock className="w-3 h-3" /> Prazo Expirado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.numeroLote ? (
                        <>
                          <span className="font-semibold text-slate-800">{r.numeroLote}</span>
                          <div className="text-xs text-slate-400 truncate max-w-[150px]">
                            {r.nomeProduto}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Desvio geral</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getGravidadeBadge(r.gravidade)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{r.responsavelTratativa}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleAbrirTratativa(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Tratativa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova RNC */}
      {showNovoModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Abrir Relatório de Não Conformidade</h3>
              </div>
              <button onClick={() => setShowNovoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarNovaRnc} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Desvio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dimensional fora de tolerância no alojamento da vedação"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Relato do problema encontrado, peças afetadas, medições aferidas..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lote Relacionado</label>
                  <select
                    value={loteId || ''}
                    onChange={(e) => setLoteId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="">Nenhum / Não aplicável</option>
                    {lotes.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.numeroLote} ({l.nomeProduto})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origem do Desvio</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Chão de Fábrica">Chão de Fábrica</option>
                    <option value="Inspeção de Qualidade">Inspeção de Qualidade</option>
                    <option value="Recebimento de Matéria-Prima">Recebimento de Matéria-Prima</option>
                    <option value="Auditoria Interna">Auditoria Interna</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Engenharia / Supervisor"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severidade *</label>
                  <select
                    value={gravidade}
                    onChange={(e) => setGravidade(e.target.value as GravidadeDefeito)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Media">Média</option>
                    <option value="Grave">Grave</option>
                    <option value="Critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prazo de Resolução</label>
                <input
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
                >
                  {saving ? 'Registrando...' : 'Abrir RNC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tratativa de RNC */}
      {showTratativaModal && rncSelecionada && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                    {rncSelecionada.numeroRnc}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Tratativa de Não Conformidade</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{rncSelecionada.titulo}</p>
              </div>
              <button onClick={() => setShowTratativaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTratativa} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Causa Raiz */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Análise de Causa Raiz (Método / Máquina / Ferramental / Operação) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Por que ocorreu o desvio? (Ex: Desgaste excessivo da ferramenta de corte por falta de substituição periódica...)"
                  value={causaRaiz}
                  onChange={(e) => setCausaRaiz(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              {/* Ação Imediata */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Ação Imediata / Contenção (Bloqueio do lote afetado)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Segregação e bloqueio de 50 peças no almoxarifado"
                  value={acaoImediata}
                  onChange={(e) => setAcaoImediata(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              {/* Ação Corretiva */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Plano de Ação Corretiva (Prevenção de Recorrência) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ação estrutural para evitar repetição (Ex: Ajuste na preventiva de troca de ferramenta a cada 500 ciclos...)"
                  value={acaoCorretiva}
                  onChange={(e) => setAcaoCorretiva(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável pela Tratativa *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavelTratativa}
                    onChange={(e) => setResponsavelTratativa(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status do Ciclo</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as StatusNaoConformidade)}
                    disabled={concluir}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 disabled:opacity-50"
                  >
                    <option value="EmAnalise">Em Análise</option>
                    <option value="EmTratativa">Em Tratativa</option>
                    <option value="Resolvida">Resolvida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Concluir */}
              <div className="flex items-center gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="concluirRnc"
                  checked={concluir}
                  onChange={(e) => {
                    setConcluir(e.target.checked);
                    if (e.target.checked) setNovoStatus('Resolvida');
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="concluirRnc" className="text-xs text-emerald-900 cursor-pointer">
                  <span className="font-bold">Encerrar e Resolver RNC:</span> Ações corretivas foram implementadas
                  e validadas com sucesso.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTratativaModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Gravando...' : 'Salvar Tratativa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
