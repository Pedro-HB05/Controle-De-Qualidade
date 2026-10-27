import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RelatorioGerencial, Produto, Lote } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

export const Relatorios: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioGerencial | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [produtoId, setProdutoId] = useState<string>('');
  const [loteId, setLoteId] = useState<string>('');

  const carregarFiltros = async () => {
    try {
      const [prodData, lotesData] = await Promise.all([api.getProdutos(), api.getLotes()]);
      setProdutos(prodData);
      setLotes(lotesData);
    } catch (err: any) {
      console.error(err);
    }
  };

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const data = await api.getRelatorioGerencial({
        dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
        dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
        produtoId: produtoId ? Number(produtoId) : undefined,
        loteId: loteId ? Number(loteId) : undefined,
      });
      setRelatorio(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFiltros();
    gerarRelatorio();
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      {/* Header (oculto na impressão seletiva ou formatado) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Relatórios Gerenciais de Qualidade</h2>
          <p className="text-xs text-slate-500 mt-1">
            Geração de relatórios consolidados para tomada de decisão e auditoria de processos.
          </p>
        </div>

        <button
          onClick={handleImprimir}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Printer className="w-4 h-4" />
          Imprimir / PDF
        </button>
      </div>

      {/* Painel de Filtros (oculto na impressão) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm print:hidden space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Parâmetros do Relatório
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Data Inicial</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Data Final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Produto</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="">Todos os Produtos</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lote</label>
            <select
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="">Todos os Lotes</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.numeroLote}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={gerarRelatorio}
            disabled={loading}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            {loading ? 'Atualizando...' : 'Aplicar Filtros'}
          </button>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Gerando relatório...
        </div>
      ) : !relatorio ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
          Sem dados para o período informado.
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Cabeçalho do Documento */}
          <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                Relatório Gerencial de Qualidade
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Controle de Processos Produtivos
              </h1>
              <p className="text-xs text-slate-500 mt-1">Período: {relatorio.periodoDescricao}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Emitido em: {new Date(relatorio.dataGeracao).toLocaleString('pt-BR')}</div>
              <div className="font-semibold text-slate-600 mt-1">Documento Oficial de Auditoria</div>
            </div>
          </div>

          {/* Cards do Sumário Executivo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Índice Global</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {relatorio.indiceQualidadeGlobal.toFixed(1)}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Conformidade geral</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Peças Inspecionadas</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {relatorio.totalPecasInspecionadas}
              </div>
              <span className="text-[11px] text-slate-500">em {relatorio.totalInspecoes} verificações</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Peças Rejeitadas</span>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">
                {relatorio.totalPecasRejeitadas}
              </div>
              <span className="text-[11px] text-slate-500">desvios de fabricação</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Não Conformidades</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {relatorio.totalRncsNoPeriodo}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {relatorio.totalRncsResolvidasNoPeriodo} tratadas
              </span>
            </div>
          </div>

          {/* Principais Defeitos no Período (Pareto) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Principais Defeitos Registrados no Período
            </h3>
            {relatorio.principaisDefeitos.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum defeito registrado no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Nome da Falha</th>
                      <th className="py-2 px-3">Categoria</th>
                      <th className="py-2 px-3 text-right">Ocorrências</th>
                      <th className="py-2 px-3 text-right">% Relativo</th>
                      <th className="py-2 px-3 text-right">% Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatorio.principaisDefeitos.map((d) => (
                      <tr key={d.tipoDefeitoId}>
                        <td className="py-2 px-3 font-mono font-bold">{d.codigo}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{d.nomeDefeito}</td>
                        <td className="py-2 px-3 text-slate-500">{d.categoria}</td>
                        <td className="py-2 px-3 text-right font-bold">{d.quantidadeTotal} un</td>
                        <td className="py-2 px-3 text-right">{d.percentual.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-600">
                          {d.percentualAcumulado.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Registro Detalhado de Inspeções */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Histórico de Inspeções no Período ({relatorio.inspecoes.length})
            </h3>
            {relatorio.inspecoes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Sem inspeções no filtro informado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="py-2 px-3">Inspeção</th>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Lote</th>
                      <th className="py-2 px-3">Produto</th>
                      <th className="py-2 px-3">Inspetor</th>
                      <th className="py-2 px-3 text-center">Amostra</th>
                      <th className="py-2 px-3 text-center">Conformidade</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatorio.inspecoes.map((i) => (
                      <tr key={i.id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {i.codigoInspecao}
                        </td>
                        <td className="py-2 px-3 text-slate-500">
                          {new Date(i.dataInspecao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-3 font-semibold">{i.numeroLote}</td>
                        <td className="py-2 px-3 text-slate-600">{i.produtoNome}</td>
                        <td className="py-2 px-3">{i.inspetor}</td>
                        <td className="py-2 px-3 text-center">
                          {i.quantidadeAprovada} / {i.quantidadeInspecionada}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {i.taxaAprovacaoPercentual.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 font-semibold">{i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
