using System.Text.Json.Serialization;

namespace ControleDeQualidade.API.Models.Entities;

public class Maquina
{
    public int Id { get; set; }
    public string NumeroPatrimonio { get; set; } = string.Empty;
    public string NomeModelo { get; set; } = string.Empty;
    public string Categoria { get; set; } = "Equipamento";
    public string Responsavel { get; set; } = string.Empty;
    public string Setor { get; set; } = string.Empty;
    public string Status { get; set; } = "Ativo"; // "Ativo", "Em Manutenção", "Disponível", "Desativado"
    public DateTime? DataAquisicao { get; set; }
    public DateTime? DataUltimaRevisao { get; set; }
    public DateTime? ProximaRevisao { get; set; }
    public string Observacoes { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Vistoria> Vistorias { get; set; } = new List<Vistoria>();

    [JsonIgnore]
    public ICollection<Pendencia> Pendencias { get; set; } = new List<Pendencia>();
}
