import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TipoDefeito, CategoriaDefeito, GravidadeDefeito } from '../types';
import { Plus, Layers, X } from 'lucide-react';

export const TiposDefeitos: React.FC = () => {
  const [defeitos, setDefeitos] = useState<TipoDefeito[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [codigo, setCodigo] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [categoria, setCategoria] = useState<CategoriaDefeito>('Dimensional');
  const [gravidade, setGravidade] = useState<GravidadeDefeito>('Media');

  const carregarDefeitos = async () => {
    setLoading(true);
    try {
      const data = await api.getTiposDefeitos();
      setDefeitos(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDefeitos();
  }, []);

  const handleCriarDefeito = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    try {
      await api.criarTipoDefeito({
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria,
        gravidade,
      });
      setShowModal(false);
      setCodigo('');
      setNome('');
      setDescricao('');
      carregarDefeitos();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao cadastrar tipo de defeito.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catálogo de Defeitos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Padronização e categorização das não conformidades identificáveis no processo produtivo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Tipo de Defeito
        </button>
      </div>

      {/* Grid de Defeitos */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Carregando catálogo de defeitos...
        </div>
      ) : defeitos.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
          Nenhum tipo de defeito cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defeitos.map((def) => (
            <div
              key={def.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {def.codigo}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                    {def.categoria}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{def.nome}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{def.descricao}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Gravidade:{' '}
                  <strong className="text-slate-800 font-semibold">{def.gravidade}</strong>
                </span>
                <span className="font-semibold text-sky-600">
                  {def.totalOcorrenciasRegistradas} ocorrências
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Defeito */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Cadastrar Tipo de Defeito</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarDefeito} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código do Defeito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DEF-DIM-01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Defeito *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dimensional fora de tolerância"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaDefeito)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Dimensional">Dimensional</option>
                    <option value="Visual">Visual</option>
                    <option value="Funcional">Funcional</option>
                    <option value="Material">Material</option>
                    <option value="Acabamento">Acabamento</option>
                    <option value="Embalagem">Embalagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gravidade *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Critério de aceitação ou método de identificação..."
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
                  {saving ? 'Gravando...' : 'Salvar Defeito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
