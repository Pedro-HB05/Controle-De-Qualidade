using System.Text.Json.Serialization;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Models.Entities;

public class DefeitoIdentificado
{
    public int Id { get; set; }
    public int InspecaoId { get; set; }

    [JsonIgnore]
    public Inspecao? Inspecao { get; set; }

    public int TipoDefeitoId { get; set; }
    public TipoDefeito? TipoDefeito { get; set; }

    public int Quantidade { get; set; }
    public GravidadeDefeito Gravidade { get; set; } = GravidadeDefeito.Media;
    public string Observacoes { get; set; } = string.Empty;

    public string Observacao
    {
        get => Observacoes;
        set => Observacoes = value;
    }
}
