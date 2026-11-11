using System.Text.Json.Serialization;

namespace ControleDeQualidade.API.Models.Entities;

public class Pendencia
{
    public int Id { get; set; }
    public string CodigoPendencia { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int? MaquinaId { get; set; }
    public Maquina? Maquina { get; set; }
    public string Setor { get; set; } = string.Empty;
    public string Responsavel { get; set; } = string.Empty; // Quem tem que resolver
    public DateTime PrazoLimite { get; set; } = DateTime.UtcNow.AddDays(7);
    public string Status { get; set; } = "Aberta"; // "Aberta", "Em Andamento", "Resolvida", "Cancelada"
    public DateTime? DataResolucao { get; set; }
    public string SolucaoAplicada { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
