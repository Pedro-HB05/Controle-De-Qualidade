import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Produto } from '../types';
import { Plus, Search, Package, X, Trash2 } from 'lucide-react';

export const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [codigo, setCodigo] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [unidadeMedida, setUnidadeMedida] = useState<string>('UN');

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await api.getProdutos(busca);
      setProdutos(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [busca]);

  const handleCriarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    try {
      await api.criarProduto({
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        unidadeMedida: unidadeMedida.trim().toUpperCase(),
      });
      setShowModal(false);
      setCodigo('');
      setNome('');
      setDescricao('');
      setCategoria('');
      carregarProdutos();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao cadastrar produto.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este produto?')) return;
    try {
      await api.excluirProduto(id);
      carregarProdutos();
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir produto.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catálogo de Produtos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Itens fabricados e peças submetidas ao controle de qualidade.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Buscar por código, nome ou categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-800"
        />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Carregando catálogo...</div>
        ) : produtos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Nenhum produto cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Nome & Descrição</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-center">Unidade</th>
                  <th className="py-3.5 px-4 text-center">Lotes</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {produtos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.codigo}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.nome}</div>
                      <div className="text-xs text-slate-400 truncate max-w-sm">{p.descricao}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{p.categoria || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{p.unidadeMedida}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-900">
                      {p.totalLotesCadastrados}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleExcluir(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Cadastrar Novo Produto</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarProduto} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PRD-VALV-01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Válvula de Pressão Hidráulica"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Usinagem"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    placeholder="UN, KG, M"
                    value={unidadeMedida}
                    onChange={(e) => setUnidadeMedida(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Especificações, material, uso industrial..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
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
                  {saving ? 'Gravando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
