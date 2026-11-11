import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Maquina, Vistoria, Pendencia } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  ClockAlert,
  Laptop,
  ClipboardCheck,
} from 'lucide-react';

export const Relatorios: React.FC = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [mData, vData, pData] = await Promise.all([
        api.getMaquinas(),
        api.getVistorias(),
        api.getPendencias(),
      ]);
      setMaquinas(mData);
      setVistorias(vData);
      setPendencias(pData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  // Filtragem local dos dados
  const vistoriasFiltradas = vistorias.filter((v) => {
    if (filtroSetor !== 'todos' && v.setor !== filtroSetor) return false;
    const data = new Date(v.dataVistoria);
    if (dataInicio && data < new Date(dataInicio)) return false;
    if (dataFim && data > new Date(dataFim + 'T23:59:59')) return false;
    return true;
  });

  const pendenciasFiltradas = pendencias.filter((p) => {
    if (filtroSetor !== 'todos' && p.setor !== filtroSetor) return false;
    const data = new Date(p.dataCriacao);
    if (dataInicio && data < new Date(dataInicio)) return false;
    if (dataFim && data > new Date(dataFim + 'T23:59:59')) return false;
    return true;
  });

  const maquinasFiltradas = maquinas.filter((m) => {
    if (filtroSetor !== 'todos' && m.setor !== filtroSetor) return false;
    return true;
  });

  const setoresUnicos = Array.from(new Set(maquinas.map((m) => m.setor).filter(Boolean)));

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      {/* Header (Oculto na impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Relatórios & Histórico Consolidado</h2>
          <p className="text-xs text-slate-500 mt-1">
            Geração de relatórios executivos para prestação de contas, auditoria e controle de patrimônio.
          </p>
        </div>

        <button
          onClick={handleImprimir}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar em PDF
        </button>
      </div>

      {/* Painel de Filtros (Oculto na impressão) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 print:hidden">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Inicial</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Final</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Setor</label>
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="todos">Todos os Setores</option>
            {setoresUnicos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {(dataInicio || dataFim || filtroSetor !== 'todos') && (
          <button
            onClick={() => {
              setDataInicio('');
              setDataFim('');
              setFiltroSetor('todos');
            }}
            className="text-xs text-rose-600 underline font-semibold mt-4"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* RELATÓRIO FORMATADO (Visível na tela e na impressão A4) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Cabeçalho do Documento para Impressão */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                ControlDesk — Relatório de Gestão & Patrimônio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Emissão em: {new Date().toLocaleDateString('pt-BR')} às{' '}
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="font-bold">Setor: </span>
              {filtroSetor === 'todos' ? 'Geral (Todos)' : filtroSetor}
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Equipamentos</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{maquinasFiltradas.length}</div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Vistorias Feitas</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {vistoriasFiltradas.length}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">
              Taxa de Aprovação
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {vistoriasFiltradas.length > 0
                ? `${Math.round(
                    (vistoriasFiltradas.filter((v) => v.status === 'Aprovado').length /
                      vistoriasFiltradas.length) *
                      100
                  )}%`
                : '100%'}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">
              Pendências Resolvidas
            </span>
            <div className="text-xl font-bold text-sky-600 mt-1">
              {pendenciasFiltradas.filter((p) => p.status === 'Resolvida').length} /{' '}
              {pendenciasFiltradas.length}
            </div>
          </div>
        </div>

        {/* Seção 1: Histórico de Vistorias e Checagens */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-sky-600" />
            1. Histórico de Checagens & Vistorias
          </h3>

          {vistoriasFiltradas.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhuma vistoria registrada no período.</p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Cód.</th>
                  <th className="p-2">Patrimônio / Equipamento</th>
                  <th className="p-2">Setor</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Inspetor</th>
                  <th className="p-2">Resultado</th>
                  <th className="p-2">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vistoriasFiltradas.map((v) => (
                  <tr key={v.id}>
                    <td className="p-2 font-mono font-bold">{v.codigoVistoria}</td>
                    <td className="p-2 font-medium">
                      {v.numeroPatrimonio} - {v.nomeModelo}
                    </td>
                    <td className="p-2">{v.setor}</td>
                    <td className="p-2">{new Date(v.dataVistoria).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{v.responsavelVistoria}</td>
                    <td className="p-2 font-bold">
                      <span
                        className={
                          v.status === 'Aprovado' ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 truncate max-w-xs">{v.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Seção 2: Histórico de Problemas, Prazos e Soluções */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <ClockAlert className="w-4 h-4 text-amber-600" />
            2. Histórico de Problemas & Prazos de Resolução
          </h3>

          {pendenciasFiltradas.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhuma pendência registrada no período.</p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Cód.</th>
                  <th className="p-2">Título do Problema</th>
                  <th className="p-2">Patrimônio</th>
                  <th className="p-2">Responsável</th>
                  <th className="p-2">Prazo Limite</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Solução Aplicada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pendenciasFiltradas.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 font-mono font-bold">{p.codigoPendencia}</td>
                    <td className="p-2 font-medium">{p.titulo}</td>
                    <td className="p-2">{p.numeroPatrimonio}</td>
                    <td className="p-2">{p.responsavel}</td>
                    <td className="p-2">{new Date(p.prazoLimite).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2 font-bold">
                      <span
                        className={
                          p.status === 'Resolvida'
                            ? 'text-emerald-700'
                            : p.estaAtrasada
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600">{p.solucaoAplicada || 'Aguardando solução'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé de Assinatura para Prestação de Contas */}
        <div className="pt-12 border-t border-slate-200 flex justify-between text-center text-xs text-slate-600">
          <div className="w-64 border-t border-slate-400 pt-2">
            <p className="font-bold">Responsável pela Qualidade / Vistorias</p>
          </div>
          <div className="w-64 border-t border-slate-400 pt-2">
            <p className="font-bold">Diretoria / Gestão do Escritório</p>
          </div>
        </div>
      </div>
    </div>
  );
};
