using System.Text.Json.Serialization;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Models.Entities;

public class TipoDefeito
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public CategoriaDefeito Categoria { get; set; }
    public GravidadeDefeito Gravidade { get; set; }
    public bool Ativo { get; set; } = true;

    [JsonIgnore]
    public ICollection<DefeitoIdentificado> DefeitosIdentificados { get; set; } = new List<DefeitoIdentificado>();
}
