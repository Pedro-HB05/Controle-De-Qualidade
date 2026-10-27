namespace ControleDeQualidade.API.Models.Enums;

public enum StatusLote
{
    EmProducao = 1,
    AguardandoInspecao = 2,
    Inspecionado = 3,
    Aprovado = 4,
    Reprovado = 5,
    AprovadoComRestricao = 6
}
