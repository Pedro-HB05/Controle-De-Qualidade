using System.Text.Json.Serialization;

namespace ControleDeQualidade.API.Models.Entities;

public class Vistoria
{
    public int Id { get; set; }
    public string CodigoVistoria { get; set; } = string.Empty;
    public int MaquinaId { get; set; }
    public Maquina? Maquina { get; set; }
    public string ResponsavelVistoria { get; set; } = string.Empty;
    public DateTime DataVistoria { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Aprovado"; // "Aprovado", "Reprovado", "Aprovado com Restrição"
    public string Observacoes { get; set; } = string.Empty;
    public int? PendenciaGeradaId { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
}
