import {
  Usuario,
  AuthResponse,
  Maquina,
  MaquinaInput,
  Vistoria,
  VistoriaInput,
  Pendencia,
  PendenciaInput,
  DashboardResumo,
} from '../types';

const envUrl = import.meta.env.VITE_API_URL;
const API_BASE = envUrl
  ? envUrl.endsWith('/api')
    ? envUrl
    : `${envUrl.replace(/\/+$/, '')}/api`
  : '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Sessão expirada ou não autorizada: limpa credenciais com segurança
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_logado');
    window.dispatchEvent(new Event('auth-logout'));
  }

  if (response.status === 429) {
    throw new Error('Muitas tentativas consecutivas. Por segurança, aguarde 1 minuto antes de tentar novamente.');
  }

  if (!response.ok) {
    let errorMsg = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.mensagem) errorMsg = errorData.mensagem;
      else if (errorData?.title) errorMsg = errorData.title;
    } catch {
      // Ignora erro de parse
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Autenticação
  login: (data: { email: string; senha: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: { nome: string; email: string; senha: string; cargo?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getUsuarios: () => request<Usuario[]>('/auth/usuarios'),

  // Dashboard
  getDashboardResumo: () => request<DashboardResumo>('/dashboard/resumo'),

  // Máquinas & Patrimônio
  getMaquinas: (params?: { busca?: string; setor?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.busca) query.append('busca', params.busca);
    if (params?.setor) query.append('setor', params.setor);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return request<Maquina[]>(`/maquinas${qs ? `?${qs}` : ''}`);
  },

  getMaquinaPorId: (id: number) => request<Maquina>(`/maquinas/${id}`),

  criarMaquina: (data: MaquinaInput) =>
    request<Maquina>('/maquinas', { method: 'POST', body: JSON.stringify(data) }),

  atualizarMaquina: (id: number, data: MaquinaInput) =>
    request<Maquina>(`/maquinas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  excluirMaquina: (id: number) =>
    request<void>(`/maquinas/${id}`, { method: 'DELETE' }),

  // Checagens & Vistorias
  getVistorias: (params?: { maquinaId?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.maquinaId) query.append('maquinaId', params.maquinaId.toString());
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return request<Vistoria[]>(`/vistorias${qs ? `?${qs}` : ''}`);
  },

  criarVistoria: (data: VistoriaInput) =>
    request<Vistoria>('/vistorias', { method: 'POST', body: JSON.stringify(data) }),

  excluirVistoria: (id: number) =>
    request<void>(`/vistorias/${id}`, { method: 'DELETE' }),

  // Prazos & Pendências
  getPendencias: (params?: { status?: string; busca?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.busca) query.append('busca', params.busca);
    const qs = query.toString();
    return request<Pendencia[]>(`/pendencias${qs ? `?${qs}` : ''}`);
  },

  criarPendencia: (data: PendenciaInput) =>
    request<Pendencia>('/pendencias', { method: 'POST', body: JSON.stringify(data) }),

  resolverPendencia: (id: number, data: { solucaoAplicada: string; status?: string }) =>
    request<Pendencia>(`/pendencias/${id}/resolver`, { method: 'PUT', body: JSON.stringify(data) }),

  excluirPendencia: (id: number) =>
    request<void>(`/pendencias/${id}`, { method: 'DELETE' }),
};
