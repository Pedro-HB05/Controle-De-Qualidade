namespace ControleDeQualidade.API.DTOs;

public class DashboardKpisDto
{
    public int TotalInspecoes { get; set; }
    public int TotalLotesCadastrados { get; set; }
    public int TotalPecasInspecionadas { get; set; }
    public int TotalPecasAprovadas { get; set; }
    public int TotalPecasRejeitadas { get; set; }
    public double TaxaAprovacaoPercentual { get; set; }
    public double TaxaRejeicaoPercentual { get; set; }

    public int TotalRncsAbertas { get; set; }
    public int TotalRncsEmTratativa { get; set; }
    public int TotalRncsResolvidas { get; set; }
    public int TotalRncsAtrasadas { get; set; }
}

public class ParetoItemDto
{
    public int TipoDefeitoId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string NomeDefeito { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public int QuantidadeTotal { get; set; }
    public double Percentual { get; set; }
    public double PercentualAcumulado { get; set; }
}

public class CategoriaDefeitoResumoDto
{
    public string Categoria { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public double Percentual { get; set; }
}

public class EvolucaoMensalDto
{
    public string MesAno { get; set; } = string.Empty; // ex: "10/2026"
    public int TotalInspecoes { get; set; }
    public int TotalPecasInspecionadas { get; set; }
    public int TotalPecasAprovadas { get; set; }
    public int TotalPecasRejeitadas { get; set; }
    public double TaxaAprovacao { get; set; }
}

public class StatusContagemDto
{
    public string Status { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}

public class ProdutoQualidadeRankingDto
{
    public int ProdutoId { get; set; }
    public string CodigoProduto { get; set; } = string.Empty;
    public string NomeProduto { get; set; } = string.Empty;
    public int TotalInspecionado { get; set; }
    public int TotalRejeitado { get; set; }
    public double TaxaRejeicaoPercentual { get; set; }
}
