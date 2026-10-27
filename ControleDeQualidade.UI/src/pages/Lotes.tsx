import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Lote, Produto, StatusLote } from '../types';
import { Plus, Boxes, Search, X } from 'lucide-react';

export const Lotes: React.FC = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form states
  const [numeroLote, setNumeroLote] = useState<string>('');
  const [produtoId, setProdutoId] = useState<number>(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState<number>(100);
  const [linhaProducao, setLinhaProducao] = useState<string>('Linha 01');
  const [observacoes, setObservacoes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [lotesData, produtosData] = await Promise.all([
        api.getLotes(),
        api.getProdutos(),
      ]);
      setLotes(lotesData);
      setProdutos(produtosData);
      if (produtosData.length > 0) setProdutoId(produtosData[0].id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    try {
      await api.criarLote({
        numeroLote: numeroLote.trim().toUpperCase(),
        produtoId,
        quantidadeTotal,
        linhaProducao: linhaProducao.trim(),
        status: 'AguardandoInspecao',
        observacoes: observacoes.trim(),
      });
      setShowModal(false);
      setNumeroLote('');
      setObservacoes('');
      carregarDados();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao cadastrar lote.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, novoStatus: StatusLote) => {
    try {
      await api.atualizarStatusLote(id, novoStatus);
      carregarDados();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar status.');
    }
  };

  const lotesFiltrados = lotes.filter(
    (l) =>
      !busca ||
      l.numeroLote.toLowerCase().includes(busca.toLowerCase()) ||
      l.nomeProduto.toLowerCase().includes(busca.toLowerCase()) ||
      l.linhaProducao.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusBadge = (status: StatusLote) => {
    switch (status) {
      case 'Aprovado':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Aprovado</span>;
      case 'Reprovado':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700">Reprovado</span>;
      case 'AprovadoComRestricao':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700">Aprov. c/ Restrição</span>;
      case 'AguardandoInspecao':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700">Aguardando Inspeção</span>;
      case 'EmProducao':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">Em Produção</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lotes de Fabricação</h2>
          <p className="text-xs text-slate-500 mt-1">
            Rastreabilidade de lotes no chão de fábrica e status para inspeção de qualidade.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Lote
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Buscar por lote, produto ou linha..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-800"
        />
      </div>

      {/* Tabela de Lotes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Carregando lotes...</div>
        ) : lotesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Nenhum lote cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lote / Fabricação</th>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Linha</th>
                  <th className="py-3.5 px-4 text-center">Quantidade Total</th>
                  <th className="py-3.5 px-4">Status Operacional</th>
                  <th className="py-3.5 px-4 text-center">Inspeções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lotesFiltrados.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{l.numeroLote}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(l.dataFabricacao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{l.nomeProduto}</div>
                      <div className="text-xs text-slate-400 font-mono">{l.codigoProduto}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{l.linhaProducao}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {l.quantidadeTotal} un
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={l.status}
                        onChange={(e) => handleStatusChange(l.id, e.target.value as StatusLote)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
                      >
                        <option value="EmProducao">Em Produção</option>
                        <option value="AguardandoInspecao">Aguardando Inspeção</option>
                        <option value="Inspecionado">Inspecionado</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Reprovado">Reprovado</option>
                        <option value="AprovadoComRestricao">Aprovado c/ Restrição</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {l.totalInspecoes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Lote */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Cadastrar Lote de Produção</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarLote} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Produto Fabricado *</label>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(Number(e.target.value))}
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número do Lote *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: LOTE-2026-001"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantidade Total *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantidadeTotal}
                    onChange={(e) => setQuantidadeTotal(Number(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Linha de Produção</label>
                <input
                  type="text"
                  placeholder="Ex: Linha de Usinagem 01"
                  value={linhaProducao}
                  onChange={(e) => setLinhaProducao(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Turno, operador responsável, máquina..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm"
                >
                  {saving ? 'Gravando...' : 'Salvar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
