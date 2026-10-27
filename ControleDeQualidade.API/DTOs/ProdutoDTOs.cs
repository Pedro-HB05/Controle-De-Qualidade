using System.ComponentModel.DataAnnotations;

namespace ControleDeQualidade.API.DTOs;

public class ProdutoCriacaoDto
{
    [Required(ErrorMessage = "O código do produto é obrigatório")]
    [MaxLength(50)]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "O nome do produto é obrigatório")]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(20)]
    public string UnidadeMedida { get; set; } = "UN";
}

public class ProdutoAtualizacaoDto
{
    [Required(ErrorMessage = "O nome do produto é obrigatório")]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(20)]
    public string UnidadeMedida { get; set; } = "UN";

    public bool Ativo { get; set; } = true;
}

public class ProdutoRespostaDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string UnidadeMedida { get; set; } = "UN";
    public bool Ativo { get; set; }
    public DateTime DataCadastro { get; set; }
    public int TotalLotesCadastrados { get; set; }
}
