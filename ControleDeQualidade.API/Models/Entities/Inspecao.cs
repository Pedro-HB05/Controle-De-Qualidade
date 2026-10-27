using System.Text.Json.Serialization;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Models.Entities;

public class Inspecao
{
    public int Id { get; set; }
    public string CodigoInspecao { get; set; } = string.Empty;
    public int LoteId { get; set; }
    public Lote? Lote { get; set; }
    public DateTime DataInspecao { get; set; } = DateTime.UtcNow;
    public string Inspetor { get; set; } = string.Empty;
    public int QuantidadeInspecionada { get; set; }
    public int QuantidadeAprovada { get; set; }
    public int QuantidadeRejeitada { get; set; }
    public StatusInspecao Status { get; set; } = StatusInspecao.Aprovado;
    public string Observacoes { get; set; } = string.Empty;

    public ICollection<DefeitoIdentificado> DefeitosIdentificados { get; set; } = new List<DefeitoIdentificado>();

    [JsonIgnore]
    public ICollection<NaoConformidade> NaoConformidades { get; set; } = new List<NaoConformidade>();
}
