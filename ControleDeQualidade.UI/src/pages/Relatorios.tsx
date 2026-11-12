import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Maquina, Vistoria, Pendencia } from '../types';
import {
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  ClockAlert,
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
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto print:p-0 print:max-w-none">
      {/* Header (Oculto na impressão) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Relatórios & Histórico
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Puxe e imprima em folha A4 ou PDF um resumo simples de todas as checagens e consertos realizados.
          </p>
        </div>

        <button
          onClick={handleImprimir}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar em PDF
        </button>
      </div>

      {/* Painel de Filtros (Oculto na impressão) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 sm:gap-4 print:hidden">
        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex-1 min-w-[130px]">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Setor
          </label>
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="text-xs text-rose-600 dark:text-rose-400 underline font-semibold sm:mb-2 text-left"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* RELATÓRIO FORMATADO (Visível na tela e na impressão A4) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6 transition-colors">
        {/* Cabeçalho do Documento para Impressão */}
        <div className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white print:text-black uppercase tracking-tight">
                ControlDesk — Relatório de Ativos de TI e Manutenções
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5">
                Inventário e histórico técnico de Help Desk para a Diretoria / Gestão
              </p>
            </div>
            <div className="sm:text-right text-xs text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span className="font-bold">Setor: </span>
              {filtroSetor === 'todos' ? 'Geral (Todos)' : filtroSetor}
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 print:border-slate-300 text-center">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 uppercase font-semibold">
              Total de Ativos
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white print:text-black mt-1">
              {maquinasFiltradas.length}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 uppercase font-semibold">
              Revisões Feitas
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white print:text-black mt-1">
              {vistoriasFiltradas.length}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 uppercase font-semibold">
              100% Operacionais
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 mt-1">
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
            <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 uppercase font-semibold">
              Manutenções Concluídas
            </span>
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400 print:text-sky-700 mt-1">
              {pendenciasFiltradas.filter((p) => p.status === 'Resolvida').length} /{' '}
              {pendenciasFiltradas.length}
            </div>
          </div>
        </div>

        {/* Seção 1: Histórico de Vistorias e Checagens */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-slate-300 pb-1.5 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            1. Histórico de Revisões Técnicas Preventivas
          </h3>

          {vistoriasFiltradas.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Nenhuma revisão técnica realizada no período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 print:border-slate-300 min-w-[640px] print:min-w-0">
                <thead className="bg-slate-100 dark:bg-slate-950 print:bg-slate-100 text-slate-700 dark:text-slate-300 print:text-slate-800 font-semibold border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-2">Cód.</th>
                    <th className="p-2">Equipamento</th>
                    <th className="p-2">Setor / Usuário</th>
                    <th className="p-2">Data</th>
                    <th className="p-2">Técnico de TI</th>
                    <th className="p-2">Resultado</th>
                    <th className="p-2">Anotações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                  {vistoriasFiltradas.map((v) => (
                    <tr key={v.id}>
                      <td className="p-2 font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        {v.codigoVistoria}
                      </td>
                      <td className="p-2 font-medium text-slate-900 dark:text-white print:text-black">
                        {v.numeroPatrimonio} - {v.nomeModelo}
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700">
                        {v.setor}
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700">
                        {new Date(v.dataVistoria).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2 text-slate-800 dark:text-slate-200 print:text-black">
                        {v.responsavelVistoria}
                      </td>
                      <td className="p-2 font-bold">
                        <span
                          className={
                            v.status === 'Aprovado'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700 truncate max-w-xs">
                        {v.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seção 2: Histórico de Problemas, Prazos e Soluções */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-slate-300 pb-1.5 flex items-center gap-2">
            <ClockAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            2. Histórico de Manutenções & Reparos de TI
          </h3>

          {pendenciasFiltradas.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Nenhuma manutenção de equipamento registrada no período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 print:border-slate-300 min-w-[640px] print:min-w-0">
                <thead className="bg-slate-100 dark:bg-slate-950 print:bg-slate-100 text-slate-700 dark:text-slate-300 print:text-slate-800 font-semibold border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-2">Cód.</th>
                    <th className="p-2">Defeito Apresentado</th>
                    <th className="p-2">Equipamento</th>
                    <th className="p-2">Técnico Encarregado</th>
                    <th className="p-2">Prazo SLA</th>
                    <th className="p-2">Situação</th>
                    <th className="p-2">Solução Aplicada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                  {pendenciasFiltradas.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        {p.codigoPendencia}
                      </td>
                      <td className="p-2 font-medium text-slate-900 dark:text-white print:text-black">
                        {p.titulo}
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700">
                        {p.numeroPatrimonio}
                      </td>
                      <td className="p-2 text-slate-800 dark:text-slate-200 print:text-black">
                        {p.responsavel}
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700">
                        {new Date(p.prazoLimite).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2 font-bold">
                        <span
                          className={
                            p.status === 'Resolvida'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : p.estaAtrasada
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {p.status === 'Resolvida' ? 'Reparado' : p.status}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-400 print:text-slate-700">
                        {p.solucaoAplicada || 'Aguardando reparo'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé de Assinatura para Prestação de Contas */}
        <div className="pt-8 sm:pt-12 border-t border-slate-200 dark:border-slate-800 print:border-slate-400 flex flex-col sm:flex-row gap-8 sm:gap-0 justify-between items-center text-center text-xs text-slate-600 dark:text-slate-400 print:text-black print:flex-row">
          <div className="w-full sm:w-64 border-t border-slate-400 pt-2">
            <p className="font-bold">Responsável pelo Help Desk / TI</p>
          </div>
          <div className="w-full sm:w-64 border-t border-slate-400 pt-2">
            <p className="font-bold">Diretoria / Gestão da Empresa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
