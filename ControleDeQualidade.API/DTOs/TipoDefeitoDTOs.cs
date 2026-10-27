using System.ComponentModel.DataAnnotations;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.DTOs;

public class TipoDefeitoCriacaoDto
{
    [Required(ErrorMessage = "O código do defeito é obrigatório")]
    [MaxLength(50)]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "O nome do defeito é obrigatório")]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    public CategoriaDefeito Categoria { get; set; } = CategoriaDefeito.Dimensional;

    public GravidadeDefeito Gravidade { get; set; } = GravidadeDefeito.Media;
}

public class TipoDefeitoAtualizacaoDto
{
    [Required(ErrorMessage = "O nome do defeito é obrigatório")]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    public CategoriaDefeito Categoria { get; set; }

    public GravidadeDefeito Gravidade { get; set; }

    public bool Ativo { get; set; } = true;
}

public class TipoDefeitoRespostaDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public CategoriaDefeito Categoria { get; set; }
    public string CategoriaNome => Categoria.ToString();
    public GravidadeDefeito Gravidade { get; set; }
    public string GravidadeNome => Gravidade.ToString();
    public bool Ativo { get; set; }
    public int TotalOcorrenciasRegistradas { get; set; }
}
