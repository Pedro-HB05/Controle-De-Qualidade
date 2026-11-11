using System.Text.Json.Serialization;

namespace ControleDeQualidade.API.Models.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Cargo { get; set; } = "Colaborador";
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
}
