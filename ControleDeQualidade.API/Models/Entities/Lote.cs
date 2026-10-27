using System.Text.Json.Serialization;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Models.Entities;

public class Lote
{
    public int Id { get; set; }
    public string NumeroLote { get; set; } = string.Empty;
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int QuantidadeTotal { get; set; }
    public DateTime DataFabricacao { get; set; } = DateTime.UtcNow;
    public string LinhaProducao { get; set; } = string.Empty;
    public StatusLote Status { get; set; } = StatusLote.EmProducao;
    public string Observacoes { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Inspecao> Inspecoes { get; set; } = new List<Inspecao>();

    [JsonIgnore]
    public ICollection<NaoConformidade> NaoConformidades { get; set; } = new List<NaoConformidade>();
}
