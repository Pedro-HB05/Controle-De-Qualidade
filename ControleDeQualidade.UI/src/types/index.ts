export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface Maquina {
  id: number;
  numeroPatrimonio: string;
  nomeModelo: string;
  categoria: string;
  responsavel: string;
  setor: string;
  status: string; // 'Ativo', 'Em Manutenção', 'Disponível', 'Desativado'
  dataAquisicao?: string;
  dataUltimaRevisao?: string;
  proximaRevisao?: string;
  observacoes: string;
  dataCadastro: string;
  totalVistorias?: number;
  totalPendenciasAbertas?: number;
}

export interface MaquinaInput {
  numeroPatrimonio: string;
  nomeModelo: string;
  categoria: string;
  responsavel: string;
  setor: string;
  status: string;
  dataAquisicao?: string;
  dataUltimaRevisao?: string;
  proximaRevisao?: string;
  observacoes?: string;
}

export interface Vistoria {
  id: number;
  codigoVistoria: string;
  maquinaId: number;
  numeroPatrimonio: string;
  nomeModelo: string;
  setor: string;
  responsavelVistoria: string;
  dataVistoria: string;
  status: string; // 'Aprovado', 'Reprovado', 'Aprovado com Restrição'
  observacoes: string;
  pendenciaGeradaId?: number;
  dataCadastro: string;
}

export interface VistoriaInput {
  maquinaId: number;
  responsavelVistoria: string;
  dataVistoria: string;
  status: string;
  observacoes?: string;
  criarPendenciaSeReprovado: boolean;
  tituloPendencia?: string;
  responsavelTratativa?: string;
  prazoPendencia?: string;
}

export interface Pendencia {
  id: number;
  codigoPendencia: string;
  titulo: string;
  descricao: string;
  maquinaId?: number;
  numeroPatrimonio: string;
  nomeModelo: string;
  setor: string;
  responsavel: string;
  prazoLimite: string;
  status: string; // 'Aberta', 'Em Andamento', 'Resolvida', 'Cancelada'
  dataResolucao?: string;
  solucaoAplicada?: string;
  dataCriacao: string;
  estaAtrasada: boolean;
}

export interface PendenciaInput {
  titulo: string;
  descricao: string;
  maquinaId?: number;
  setor?: string;
  responsavel: string;
  prazoLimite: string;
  status?: string;
}

export interface DashboardResumo {
  kpis: {
    totalMaquinas: number;
    maquinasAtivas: number;
    maquinasManutencao: number;
    maquinasDisponiveis: number;
    totalVistorias: number;
    vistoriasAprovadas: number;
    vistoriasReprovadas: number;
    taxaAprovacao: number;
    totalPendencias: number;
    pendenciasAbertas: number;
    pendenciasResolvidas: number;
    pendenciasAtrasadas: number;
  };
  pendenciasUrgentes: {
    id: number;
    codigoPendencia: string;
    titulo: string;
    patrimonio: string;
    responsavel: string;
    prazoLimite: string;
    status: string;
    estaAtrasada: boolean;
  }[];
  distribuicaoSetores: {
    setor: string;
    quantidade: number;
  }[];
}
