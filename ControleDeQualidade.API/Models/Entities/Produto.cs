using System.Text.Json.Serialization;

namespace ControleDeQualidade.API.Models.Entities;

public class Produto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = "UN";
    public bool Ativo { get; set; } = true;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
}
