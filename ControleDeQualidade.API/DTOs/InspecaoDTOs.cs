using System.ComponentModel.DataAnnotations;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.DTOs;

public class DefeitoIdentificadoInputDto
{
    [Required]
    public int TipoDefeitoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade de peças com defeito deve ser no mínimo 1")]
    public int Quantidade { get; set; }

    public GravidadeDefeito Gravidade { get; set; } = GravidadeDefeito.Media;

    [MaxLength(255)]
    public string Observacao { get; set; } = string.Empty;
}

public class InspecaoCriacaoDto
{
    [MaxLength(50)]
    public string? CodigoInspecao { get; set; } // Opcional, se vazio gera automático ex: INSP-2026-XXXX

    [Required(ErrorMessage = "O lote da inspeção é obrigatório")]
    public int LoteId { get; set; }

    public DateTime DataInspecao { get; set; } = DateTime.UtcNow;

    [Required(ErrorMessage = "O nome do inspetor é obrigatório")]
    [MaxLength(100)]
    public string Inspetor { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade inspecionada deve ser maior que zero")]
    public int QuantidadeInspecionada { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quantidade aprovada não pode ser negativa")]
    public int QuantidadeAprovada { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quantidade rejeitada não pode ser negativa")]
    public int QuantidadeRejeitada { get; set; }

    public StatusInspecao? Status { get; set; } // Se nulo, calculado pelas quantidades

    public string Observacoes { get; set; } = string.Empty;

    public bool GerarRncSeReprovado { get; set; } = false;

    public List<DefeitoIdentificadoInputDto> DefeitosIdentificados { get; set; } = new();
}

public class InspecaoAtualizacaoDto
{
    [Required(ErrorMessage = "O nome do inspetor é obrigatório")]
    [MaxLength(100)]
    public string Inspetor { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade inspecionada deve ser maior que zero")]
    public int QuantidadeInspecionada { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quantidade aprovada não pode ser negativa")]
    public int QuantidadeAprovada { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quantidade rejeitada não pode ser negativa")]
    public int QuantidadeRejeitada { get; set; }

    public StatusInspecao Status { get; set; }

    public string Observacoes { get; set; } = string.Empty;

    public List<DefeitoIdentificadoInputDto> DefeitosIdentificados { get; set; } = new();
}

public class DefeitoIdentificadoRespostaDto
{
    public int Id { get; set; }
    public int TipoDefeitoId { get; set; }
    public string CodigoDefeito { get; set; } = string.Empty;
    public string NomeDefeito { get; set; } = string.Empty;
    public string CategoriaDefeito { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public GravidadeDefeito Gravidade { get; set; }
    public string GravidadeNome => Gravidade.ToString();
    public string Observacao { get; set; } = string.Empty;
}

public class InspecaoRespostaDto
{
    public int Id { get; set; }
    public string CodigoInspecao { get; set; } = string.Empty;
    public int LoteId { get; set; }
    public string NumeroLote { get; set; } = string.Empty;
    public string ProdutoNome { get; set; } = string.Empty;
    public string ProdutoCodigo { get; set; } = string.Empty;
    public DateTime DataInspecao { get; set; }
    public string Inspetor { get; set; } = string.Empty;
    public int QuantidadeInspecionada { get; set; }
    public int QuantidadeAprovada { get; set; }
    public int QuantidadeRejeitada { get; set; }
    public double TaxaAprovacaoPercentual => QuantidadeInspecionada > 0 
        ? Math.Round((double)QuantidadeAprovada / QuantidadeInspecionada * 100, 2) 
        : 0;
    public StatusInspecao Status { get; set; }
    public string StatusNome => Status.ToString();
    public string Observacoes { get; set; } = string.Empty;
    public List<DefeitoIdentificadoRespostaDto> Defeitos { get; set; } = new();
    public int? RncGeradaId { get; set; }
}
