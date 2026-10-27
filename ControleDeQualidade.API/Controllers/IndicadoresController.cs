using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/indicadores")]
public class IndicadoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public IndicadoresController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna os principais KPIs e métricas consolidadas de qualidade (Cards do Dashboard)
    /// </summary>
    [HttpGet("kpis")]
    public async Task<ActionResult<DashboardKpisDto>> ObterKpis()
    {
        var totalInspecoes = await _context.Inspecoes.CountAsync();
        var totalLotes = await _context.Lotes.CountAsync();

        var pecasInspecionadas = await _context.Inspecoes.SumAsync(i => (int?)i.QuantidadeInspecionada) ?? 0;
        var pecasAprovadas = await _context.Inspecoes.SumAsync(i => (int?)i.QuantidadeAprovada) ?? 0;
        var pecasRejeitadas = await _context.Inspecoes.SumAsync(i => (int?)i.QuantidadeRejeitada) ?? 0;

        double taxaAprovacao = pecasInspecionadas > 0
            ? Math.Round((double)pecasAprovadas / pecasInspecionadas * 100, 2)
            : 0;

        double taxaRejeicao = pecasInspecionadas > 0
            ? Math.Round((double)pecasRejeitadas / pecasInspecionadas * 100, 2)
            : 0;

        var agora = DateTime.UtcNow;
        var rncsAbertas = await _context.NaoConformidades.CountAsync(n => n.Status == StatusNaoConformidade.Aberta);
        var rncsEmTratativa = await _context.NaoConformidades.CountAsync(n => n.Status == StatusNaoConformidade.EmTratativa || n.Status == StatusNaoConformidade.EmAnalise);
        var rncsResolvidas = await _context.NaoConformidades.CountAsync(n => n.Status == StatusNaoConformidade.Resolvida);
        var rncsAtrasadas = await _context.NaoConformidades.CountAsync(n =>
            n.Status != StatusNaoConformidade.Resolvida &&
            n.Status != StatusNaoConformidade.Cancelada &&
            n.PrazoConclusao.HasValue &&
            n.PrazoConclusao.Value < agora);

        return Ok(new DashboardKpisDto
        {
            TotalInspecoes = totalInspecoes,
            TotalLotesCadastrados = totalLotes,
            TotalPecasInspecionadas = pecasInspecionadas,
            TotalPecasAprovadas = pecasAprovadas,
            TotalPecasRejeitadas = pecasRejeitadas,
            TaxaAprovacaoPercentual = taxaAprovacao,
            TaxaRejeicaoPercentual = taxaRejeicao,
            TotalRncsAbertas = rncsAbertas,
            TotalRncsEmTratativa = rncsEmTratativa,
            TotalRncsResolvidas = rncsResolvidas,
            TotalRncsAtrasadas = rncsAtrasadas
        });
    }

    /// <summary>
    /// Retorna o Gráfico de Pareto de Defeitos com percentual individual e acumulado (Princípio 80/20)
    /// </summary>
    [HttpGet("pareto-defeitos")]
    public async Task<ActionResult<IEnumerable<ParetoItemDto>>> ObterParetoDefeitos()
    {
        var defeitosAgrupados = await _context.DefeitosIdentificados
            .Include(d => d.TipoDefeito)
            .GroupBy(d => new { d.TipoDefeitoId, d.TipoDefeito!.Codigo, d.TipoDefeito.Nome, d.TipoDefeito.Categoria })
            .Select(g => new
            {
                TipoDefeitoId = g.Key.TipoDefeitoId,
                Codigo = g.Key.Codigo,
                NomeDefeito = g.Key.Nome,
                Categoria = g.Key.Categoria.ToString(),
                QuantidadeTotal = g.Sum(x => x.Quantidade)
            })
            .OrderByDescending(x => x.QuantidadeTotal)
            .ToListAsync();

        int somaGeral = defeitosAgrupados.Sum(x => x.QuantidadeTotal);
        var resultado = new List<ParetoItemDto>();
        double acumulado = 0;

        foreach (var item in defeitosAgrupados)
        {
            double percentual = somaGeral > 0 ? Math.Round((double)item.QuantidadeTotal / somaGeral * 100, 2) : 0;
            acumulado += percentual;

            resultado.Add(new ParetoItemDto
            {
                TipoDefeitoId = item.TipoDefeitoId,
                Codigo = item.Codigo,
                NomeDefeito = item.NomeDefeito,
                Categoria = item.Categoria,
                QuantidadeTotal = item.QuantidadeTotal,
                Percentual = percentual,
                PercentualAcumulado = Math.Min(100.0, Math.Round(acumulado, 2))
            });
        }

        return Ok(resultado);
    }

    /// <summary>
    /// Retorna a distribuição de defeitos agrupados por Categoria (Gráfico de Pizza)
    /// </summary>
    [HttpGet("defeitos-por-categoria")]
    public async Task<ActionResult<IEnumerable<CategoriaDefeitoResumoDto>>> ObterPorCategoria()
    {
        var grupos = await _context.DefeitosIdentificados
            .Include(d => d.TipoDefeito)
            .GroupBy(d => d.TipoDefeito!.Categoria)
            .Select(g => new
            {
                Categoria = g.Key.ToString(),
                Quantidade = g.Sum(d => d.Quantidade)
            })
            .ToListAsync();

        int total = grupos.Sum(g => g.Quantidade);

        var resultado = grupos.Select(g => new CategoriaDefeitoResumoDto
        {
            Categoria = g.Categoria,
            Quantidade = g.Quantidade,
            Percentual = total > 0 ? Math.Round((double)g.Quantidade / total * 100, 2) : 0
        }).OrderByDescending(g => g.Quantidade).ToList();

        return Ok(resultado);
    }

    /// <summary>
    /// Retorna o quantitativo de Não Conformidades por Status
    /// </summary>
    [HttpGet("status-rncs")]
    public async Task<ActionResult<IEnumerable<StatusContagemDto>>> ObterStatusRncs()
    {
        var statusValues = Enum.GetValues<StatusNaoConformidade>();
        var contagens = await _context.NaoConformidades
            .GroupBy(n => n.Status)
            .Select(g => new { Status = g.Key, Quantidade = g.Count() })
            .ToListAsync();

        var resultado = statusValues.Select(s => new StatusContagemDto
        {
            Status = s.ToString(),
            Quantidade = contagens.FirstOrDefault(c => c.Status == s)?.Quantidade ?? 0
        }).ToList();

        return Ok(resultado);
    }

    /// <summary>
    /// Retorna a distribuição dos Lotes de produção por Status
    /// </summary>
    [HttpGet("status-lotes")]
    public async Task<ActionResult<IEnumerable<StatusContagemDto>>> ObterStatusLotes()
    {
        var statusValues = Enum.GetValues<StatusLote>();
        var contagens = await _context.Lotes
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key, Quantidade = g.Count() })
            .ToListAsync();

        var resultado = statusValues.Select(s => new StatusContagemDto
        {
            Status = s.ToString(),
            Quantidade = contagens.FirstOrDefault(c => c.Status == s)?.Quantidade ?? 0
        }).ToList();

        return Ok(resultado);
    }

    /// <summary>
    /// Retorna a evolução histórica das inspeções e taxa de conformidade por mês
    /// </summary>
    [HttpGet("evolucao-mensal")]
    public async Task<ActionResult<IEnumerable<EvolucaoMensalDto>>> ObterEvolucaoMensal()
    {
        var dataLimite = DateTime.UtcNow.AddMonths(-6);

        var inspecoes = await _context.Inspecoes
            .Where(i => i.DataInspecao >= dataLimite)
            .AsNoTracking()
            .ToListAsync();

        var grupos = inspecoes
            .GroupBy(i => new { i.DataInspecao.Year, i.DataInspecao.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                int totalInspecionado = g.Sum(x => x.QuantidadeInspecionada);
                int totalAprovado = g.Sum(x => x.QuantidadeAprovada);
                int totalRejeitado = g.Sum(x => x.QuantidadeRejeitada);

                return new EvolucaoMensalDto
                {
                    MesAno = $"{g.Key.Month:D2}/{g.Key.Year}",
                    TotalInspecoes = g.Count(),
                    TotalPecasInspecionadas = totalInspecionado,
                    TotalPecasAprovadas = totalAprovado,
                    TotalPecasRejeitadas = totalRejeitado,
                    TaxaAprovacao = totalInspecionado > 0 ? Math.Round((double)totalAprovado / totalInspecionado * 100, 2) : 0
                };
            })
            .ToList();

        return Ok(grupos);
    }

    /// <summary>
    /// Retorna o ranking dos produtos com maior índice de reprovação
    /// </summary>
    [HttpGet("ranking-produtos-criticos")]
    public async Task<ActionResult<IEnumerable<ProdutoQualidadeRankingDto>>> ObterRankingProdutos()
    {
        var dados = await _context.Inspecoes
            .Include(i => i.Lote)
                .ThenInclude(l => l!.Produto)
            .GroupBy(i => new { i.Lote!.ProdutoId, i.Lote.Produto!.Codigo, i.Lote.Produto.Nome })
            .Select(g => new
            {
                ProdutoId = g.Key.ProdutoId,
                Codigo = g.Key.Codigo,
                Nome = g.Key.Nome,
                TotalInspecionado = g.Sum(x => x.QuantidadeInspecionada),
                TotalRejeitado = g.Sum(x => x.QuantidadeRejeitada)
            })
            .ToListAsync();

        var resultado = dados.Select(d => new ProdutoQualidadeRankingDto
        {
            ProdutoId = d.ProdutoId,
            CodigoProduto = d.Codigo,
            NomeProduto = d.Nome,
            TotalInspecionado = d.TotalInspecionado,
            TotalRejeitado = d.TotalRejeitado,
            TaxaRejeicaoPercentual = d.TotalInspecionado > 0
                ? Math.Round((double)d.TotalRejeitado / d.TotalInspecionado * 100, 2)
                : 0
        })
        .OrderByDescending(r => r.TaxaRejeicaoPercentual)
        .ToList();

        return Ok(resultado);
    }
}
