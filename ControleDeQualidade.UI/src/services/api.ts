import {
  Produto,
  Lote,
  TipoDefeito,
  Inspecao,
  InspecaoCriacaoInput,
  NaoConformidade,
  NaoConformidadeCriacaoInput,
  TratativaInput,
  DashboardKpis,
  ParetoItem,
  CategoriaDefeitoResumo,
  EvolucaoMensal,
  RelatorioGerencial,
  StatusLote,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.mensagem) errorMsg = errorData.mensagem;
      else if (errorData?.title) errorMsg = errorData.title;
    } catch {
      // Ignora erro no parse de json
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Indicadores / Dashboard
  getKpis: () => request<DashboardKpis>('/indicadores/kpis'),
  getParetoDefeitos: () => request<ParetoItem[]>('/indicadores/pareto-defeitos'),
  getDefeitosPorCategoria: () => request<CategoriaDefeitoResumo[]>('/indicadores/defeitos-por-categoria'),
  getEvolucaoMensal: () => request<EvolucaoMensal[]>('/indicadores/evolucao-mensal'),

  // Produtos
  getProdutos: (busca?: string) =>
    request<Produto[]>(busca ? `/produtos?termoBusca=${encodeURIComponent(busca)}` : '/produtos'),
  criarProduto: (data: Partial<Produto>) =>
    request<Produto>('/produtos', { method: 'POST', body: JSON.stringify(data) }),
  excluirProduto: (id: number) =>
    request<void>(`/produtos/${id}`, { method: 'DELETE' }),

  // Lotes
  getLotes: (produtoId?: number, status?: StatusLote) => {
    const params = new URLSearchParams();
    if (produtoId) params.append('produtoId', produtoId.toString());
    if (status) params.append('status', status);
    const qs = params.toString();
    return request<Lote[]>(qs ? `/lotes?${qs}` : '/lotes');
  },
  criarLote: (data: Partial<Lote>) =>
    request<Lote>('/lotes', { method: 'POST', body: JSON.stringify(data) }),
  atualizarStatusLote: (id: number, novoStatus: StatusLote) =>
    request<void>(`/lotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(novoStatus),
    }),

  // Tipos de Defeito
  getTiposDefeitos: () => request<TipoDefeito[]>('/tipos-defeitos'),
  criarTipoDefeito: (data: Partial<TipoDefeito>) =>
    request<TipoDefeito>('/tipos-defeitos', { method: 'POST', body: JSON.stringify(data) }),

  // Inspeções
  getInspecoes: (loteId?: number) =>
    request<Inspecao[]>(loteId ? `/inspecoes?loteId=${loteId}` : '/inspecoes'),
  criarInspecao: (data: InspecaoCriacaoInput) =>
    request<Inspecao>('/inspecoes', { method: 'POST', body: JSON.stringify(data) }),

  // Não Conformidades (RNC)
  getNaoConformidades: (apenasAtrasadas?: boolean) => {
    const qs = apenasAtrasadas ? '?apenasAtrasadas=true' : '';
    return request<NaoConformidade[]>(`/nao-conformidades${qs}`);
  },
  criarNaoConformidade: (data: NaoConformidadeCriacaoInput) =>
    request<NaoConformidade>('/nao-conformidades', { method: 'POST', body: JSON.stringify(data) }),
  registrarTratativa: (id: number, data: TratativaInput) =>
    request<{ mensagem: string }>(`/nao-conformidades/${id}/tratativa`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Relatórios
  getRelatorioGerencial: (filtro?: { dataInicio?: string; dataFim?: string; loteId?: number; produtoId?: number }) => {
    const params = new URLSearchParams();
    if (filtro?.dataInicio) params.append('dataInicio', filtro.dataInicio);
    if (filtro?.dataFim) params.append('dataFim', filtro.dataFim);
    if (filtro?.loteId) params.append('loteId', filtro.loteId.toString());
    if (filtro?.produtoId) params.append('produtoId', filtro.produtoId.toString());
    const qs = params.toString();
    return request<RelatorioGerencial>(qs ? `/relatorios/gerencial?${qs}` : '/relatorios/gerencial');
  },
};
