export type StatusLote = 'EmProducao' | 'AguardandoInspecao' | 'Inspecionado' | 'Aprovado' | 'Reprovado' | 'AprovadoComRestricao';

export type StatusInspecao = 'Aprovado' | 'Reprovado' | 'AprovadoComRestricao';

export type CategoriaDefeito = 'Dimensional' | 'Visual' | 'Funcional' | 'Material' | 'Acabamento' | 'Embalagem';

export type GravidadeDefeito = 'Leve' | 'Media' | 'Grave' | 'Critica';

export type StatusNaoConformidade = 'Aberta' | 'EmAnalise' | 'EmTratativa' | 'Resolvida' | 'Cancelada';

export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  unidadeMedida: string;
  ativo: boolean;
  dataCadastro: string;
  totalLotesCadastrados: number;
}

export interface Lote {
  id: number;
  numeroLote: string;
  produtoId: number;
  nomeProduto: string;
  codigoProduto: string;
  quantidadeTotal: number;
  dataFabricacao: string;
  linhaProducao: string;
  status: StatusLote;
  observacoes: string;
  totalInspecoes: number;
  totalNaoConformidades: number;
}

export interface TipoDefeito {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaDefeito;
  gravidade: GravidadeDefeito;
  ativo: boolean;
  totalOcorrenciasRegistradas: number;
}

export interface DefeitoIdentificado {
  id?: number;
  tipoDefeitoId: number;
  codigoDefeito?: string;
  nomeDefeito?: string;
  categoriaDefeito?: string;
  quantidade: number;
  gravidade: GravidadeDefeito;
  observacao?: string;
}

export interface Inspecao {
  id: number;
  codigoInspecao: string;
  loteId: number;
  numeroLote: string;
  produtoNome: string;
  produtoCodigo: string;
  dataInspecao: string;
  inspetor: string;
  quantidadeInspecionada: number;
  quantidadeAprovada: number;
  quantidadeRejeitada: number;
  taxaAprovacaoPercentual: number;
  status: StatusInspecao;
  observacoes: string;
  defeitos: DefeitoIdentificado[];
  rncGeradaId?: number | null;
}

export interface InspecaoCriacaoInput {
  codigoInspecao?: string;
  loteId: number;
  dataInspecao: string;
  inspetor: string;
  quantidadeInspecionada: number;
  quantidadeAprovada: number;
  quantidadeRejeitada: number;
  status?: StatusInspecao;
  observacoes?: string;
  gerarRncSeReprovado: boolean;
  defeitosIdentificados: {
    tipoDefeitoId: number;
    quantidade: number;
    gravidade: GravidadeDefeito;
    observacao?: string;
  }[];
}

export interface NaoConformidade {
  id: number;
  numeroRnc: string;
  titulo: string;
  descricao: string;
  origem: string;
  inspecaoId?: number | null;
  codigoInspecao?: string | null;
  loteId?: number | null;
  numeroLote?: string | null;
  nomeProduto?: string | null;
  causaRaiz?: string | null;
  acaoImediata?: string | null;
  acaoCorretiva?: string | null;
  responsavelTratativa: string;
  status: StatusNaoConformidade;
  gravidade: GravidadeDefeito;
  dataAbertura: string;
  prazoConclusao?: string | null;
  dataFechamento?: string | null;
  observacoes?: string;
  emAtraso: boolean;
}

export interface NaoConformidadeCriacaoInput {
  numeroRnc?: string;
  titulo: string;
  descricao: string;
  origem?: string;
  loteId?: number | null;
  inspecaoId?: number | null;
  responsavelTratativa: string;
  gravidade: GravidadeDefeito;
  status: StatusNaoConformidade;
  prazoConclusao?: string | null;
  observacoes?: string;
}

export interface TratativaInput {
  causaRaiz: string;
  acaoImediata?: string;
  acaoCorretiva: string;
  responsavelTratativa: string;
  status: StatusNaoConformidade;
  prazoConclusao?: string | null;
  concluirTratativa: boolean;
  observacoes?: string;
}

export interface DashboardKpis {
  totalInspecoes: number;
  totalLotesCadastrados: number;
  totalPecasInspecionadas: number;
  totalPecasAprovadas: number;
  totalPecasRejeitadas: number;
  taxaAprovacaoPercentual: number;
  taxaRejeicaoPercentual: number;
  totalRncsAbertas: number;
  totalRncsEmTratativa: number;
  totalRncsResolvidas: number;
  totalRncsAtrasadas: number;
}

export interface ParetoItem {
  tipoDefeitoId: number;
  codigo: string;
  nomeDefeito: string;
  categoria: string;
  quantidadeTotal: number;
  percentual: number;
  percentualAcumulado: number;
}

export interface CategoriaDefeitoResumo {
  categoria: string;
  quantidade: number;
  percentual: number;
}

export interface EvolucaoMensal {
  mesAno: string;
  totalInspecoes: number;
  totalPecasInspecionadas: number;
  totalPecasAprovadas: number;
  totalPecasRejeitadas: number;
  taxaAprovacao: number;
}

export interface RelatorioGerencial {
  dataGeracao: string;
  periodoDescricao: string;
  totalInspecoes: number;
  totalPecasInspecionadas: number;
  totalPecasAprovadas: number;
  totalPecasRejeitadas: number;
  indiceQualidadeGlobal: number;
  totalRncsNoPeriodo: number;
  totalRncsResolvidasNoPeriodo: number;
  principaisDefeitos: ParetoItem[];
  inspecoes: Inspecao[];
  naoConformidades: NaoConformidade[];
}
