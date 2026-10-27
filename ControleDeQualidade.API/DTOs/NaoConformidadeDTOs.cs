using System.ComponentModel.DataAnnotations;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.DTOs;

public class NaoConformidadeCriacaoDto
{
    [MaxLength(50)]
    public string? NumeroRnc { get; set; } // Opcional, se não fornecido gera RNC-2026-XXXX

    [Required(ErrorMessage = "O título da não conformidade é obrigatório")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição da não conformidade é obrigatória")]
    public string Descricao { get; set; } = string.Empty;

    public string Origem { get; set; } = "Inspeção de Qualidade";

    public int? InspecaoId { get; set; }
    public int? LoteId { get; set; }

    public string? CausaRaiz { get; set; }
    public string? AcaoImediata { get; set; }
    public string? AcaoCorretiva { get; set; }

    [Required(ErrorMessage = "O responsável pela tratativa é obrigatório")]
    [MaxLength(100)]
    public string ResponsavelTratativa { get; set; } = string.Empty;

    public StatusNaoConformidade Status { get; set; } = StatusNaoConformidade.Aberta;
    public GravidadeDefeito Gravidade { get; set; } = GravidadeDefeito.Media;

    public DateTime DataAbertura { get; set; } = DateTime.UtcNow;
    public DateTime? PrazoConclusao { get; set; }
    public string Observacoes { get; set; } = string.Empty;
}

public class NaoConformidadeAtualizacaoDto
{
    [Required(ErrorMessage = "O título é obrigatório")]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória")]
    public string Descricao { get; set; } = string.Empty;

    public string Origem { get; set; } = string.Empty;
    public string? CausaRaiz { get; set; }
    public string? AcaoImediata { get; set; }
    public string? AcaoCorretiva { get; set; }

    [Required(ErrorMessage = "O responsável pela tratativa é obrigatório")]
    [MaxLength(100)]
    public string ResponsavelTratativa { get; set; } = string.Empty;

    public StatusNaoConformidade Status { get; set; }
    public GravidadeDefeito Gravidade { get; set; }

    public DateTime? PrazoConclusao { get; set; }
    public DateTime? DataFechamento { get; set; }
    public string Observacoes { get; set; } = string.Empty;
}

public class NaoConformidadeTratativaDto
{
    [Required(ErrorMessage = "A causa raiz deve ser informada")]
    public string CausaRaiz { get; set; } = string.Empty;

    public string? AcaoImediata { get; set; }

    [Required(ErrorMessage = "O plano de ação corretiva deve ser informado")]
    public string AcaoCorretiva { get; set; } = string.Empty;

    [Required(ErrorMessage = "O responsável deve ser informado")]
    public string ResponsavelTratativa { get; set; } = string.Empty;

    public StatusNaoConformidade Status { get; set; } = StatusNaoConformidade.EmTratativa;
    public DateTime? PrazoConclusao { get; set; }
    public bool ConcluirTratativa { get; set; } = false;
    public string? Observacoes { get; set; }
}

public class NaoConformidadeRespostaDto
{
    public int Id { get; set; }
    public string NumeroRnc { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Origem { get; set; } = string.Empty;

    public int? InspecaoId { get; set; }
    public string? CodigoInspecao { get; set; }

    public int? LoteId { get; set; }
    public string? NumeroLote { get; set; }
    public string? NomeProduto { get; set; }

    public string? CausaRaiz { get; set; }
    public string? AcaoImediata { get; set; }
    public string? AcaoCorretiva { get; set; }

    public string ResponsavelTratativa { get; set; } = string.Empty;
    public StatusNaoConformidade Status { get; set; }
    public string StatusNome => Status.ToString();
    public GravidadeDefeito Gravidade { get; set; }
    public string GravidadeNome => Gravidade.ToString();

    public DateTime DataAbertura { get; set; }
    public DateTime? PrazoConclusao { get; set; }
    public DateTime? DataFechamento { get; set; }
    public string Observacoes { get; set; } = string.Empty;
    public bool EmAtraso => Status != StatusNaoConformidade.Resolvida && 
                           Status != StatusNaoConformidade.Cancelada && 
                           PrazoConclusao.HasValue && 
                           PrazoConclusao.Value < DateTime.UtcNow;
}
