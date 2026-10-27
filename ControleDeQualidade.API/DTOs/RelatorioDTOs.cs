namespace ControleDeQualidade.API.DTOs;

public class FiltroRelatorioDto
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int? ProdutoId { get; set; }
    public int? LoteId { get; set; }
}

public class RelatorioGerencialDto
{
    public DateTime DataGeracao { get; set; } = DateTime.UtcNow;
    public string PeriodoDescricao { get; set; } = string.Empty;
    public int TotalInspecoes { get; set; }
    public int TotalPecasInspecionadas { get; set; }
    public int TotalPecasAprovadas { get; set; }
    public int TotalPecasRejeitadas { get; set; }
    public double IndiceQualidadeGlobal { get; set; }
    public int TotalRncsNoPeriodo { get; set; }
    public int TotalRncsResolvidasNoPeriodo { get; set; }

    public List<InspecaoRespostaDto> Inspecoes { get; set; } = new();
    public List<NaoConformidadeRespostaDto> NaoConformidades { get; set; } = new();
    public List<ParetoItemDto> PrincipaisDefeitos { get; set; } = new();
}

public class RelatorioLoteConsolidadoDto
{
    public LoteRespostaDto Lote { get; set; } = null!;
    public int TotalInspecoes { get; set; }
    public int QuantidadeTotalInspecionada { get; set; }
    public int QuantidadeTotalAprovada { get; set; }
    public int QuantidadeTotalRejeitada { get; set; }
    public double TaxaAprovacao { get; set; }
    public List<InspecaoRespostaDto> Inspecoes { get; set; } = new();
    public List<NaoConformidadeRespostaDto> NaoConformidades { get; set; } = new();
}
