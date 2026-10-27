using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Models.Entities;

public class NaoConformidade
{
    public int Id { get; set; }
    public string NumeroRnc { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Origem { get; set; } = "Inspeção de Qualidade";
    
    public int? InspecaoId { get; set; }
    public Inspecao? Inspecao { get; set; }

    public int? LoteId { get; set; }
    public Lote? Lote { get; set; }

    public string? CausaRaiz { get; set; }
    public string? AcaoImediata { get; set; }
    public string? AcaoCorretiva { get; set; }

    public string ResponsavelTratativa { get; set; } = string.Empty;
    public StatusNaoConformidade Status { get; set; } = StatusNaoConformidade.Aberta;
    public GravidadeDefeito Gravidade { get; set; } = GravidadeDefeito.Media;

    public DateTime DataAbertura { get; set; } = DateTime.UtcNow;
    public DateTime? PrazoConclusao { get; set; }
    public DateTime? DataFechamento { get; set; }
    public string Observacoes { get; set; } = string.Empty;
}
