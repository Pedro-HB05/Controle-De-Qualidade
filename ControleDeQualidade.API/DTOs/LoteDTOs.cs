using System.ComponentModel.DataAnnotations;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.DTOs;

public class LoteCriacaoDto
{
    [Required(ErrorMessage = "O número do lote é obrigatório")]
    [MaxLength(50)]
    public string NumeroLote { get; set; } = string.Empty;

    [Required(ErrorMessage = "O ID do produto é obrigatório")]
    public int ProdutoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade total deve ser maior que zero")]
    public int QuantidadeTotal { get; set; }

    public DateTime DataFabricacao { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string LinhaProducao { get; set; } = string.Empty;

    public StatusLote Status { get; set; } = StatusLote.EmProducao;

    public string Observacoes { get; set; } = string.Empty;
}

public class LoteAtualizacaoDto
{
    [Range(1, int.MaxValue, ErrorMessage = "A quantidade total deve ser maior que zero")]
    public int QuantidadeTotal { get; set; }

    public DateTime DataFabricacao { get; set; }

    [MaxLength(100)]
    public string LinhaProducao { get; set; } = string.Empty;

    public StatusLote Status { get; set; }

    public string Observacoes { get; set; } = string.Empty;
}

public class LoteRespostaDto
{
    public int Id { get; set; }
    public string NumeroLote { get; set; } = string.Empty;
    public int ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public string CodigoProduto { get; set; } = string.Empty;
    public int QuantidadeTotal { get; set; }
    public DateTime DataFabricacao { get; set; }
    public string LinhaProducao { get; set; } = string.Empty;
    public StatusLote Status { get; set; }
    public string StatusNome => Status.ToString();
    public string Observacoes { get; set; } = string.Empty;
    public int TotalInspecoes { get; set; }
    public int TotalNaoConformidades { get; set; }
}
