using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/relatorios")]
public class RelatoriosController : ControllerBase
{
    private readonly AppDbContext _context;

    public RelatoriosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gera o Relatório Gerencial Consolidado de Qualidade para apoio à tomada de decisão
    /// </summary>
    [HttpGet("gerencial")]
    public async Task<ActionResult<RelatorioGerencialDto>> GerarRelatorioGerencial([FromQuery] FiltroRelatorioDto filtro)
    {
        var queryInspecoes = _context.Inspecoes
            .Include(i => i.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(i => i.DefeitosIdentificados)
                .ThenInclude(d => d.TipoDefeito)
            .Include(i => i.NaoConformidades)
            .AsNoTracking()
            .AsQueryable();

        var queryRncs = _context.NaoConformidades
            .Include(n => n.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(n => n.Inspecao)
            .AsNoTracking()
            .AsQueryable();

        if (filtro.DataInicio.HasValue)
        {
            queryInspecoes = queryInspecoes.Where(i => i.DataInspecao >= filtro.DataInicio.Value);
            queryRncs = queryRncs.Where(n => n.DataAbertura >= filtro.DataInicio.Value);
        }

        if (filtro.DataFim.HasValue)
        {
            queryInspecoes = queryInspecoes.Where(i => i.DataInspecao <= filtro.DataFim.Value);
            queryRncs = queryRncs.Where(n => n.DataAbertura <= filtro.DataFim.Value);
        }

        if (filtro.LoteId.HasValue)
        {
            queryInspecoes = queryInspecoes.Where(i => i.LoteId == filtro.LoteId.Value);
            queryRncs = queryRncs.Where(n => n.LoteId == filtro.LoteId.Value);
        }

        if (filtro.ProdutoId.HasValue)
        {
            queryInspecoes = queryInspecoes.Where(i => i.Lote != null && i.Lote.ProdutoId == filtro.ProdutoId.Value);
            queryRncs = queryRncs.Where(n => n.Lote != null && n.Lote.ProdutoId == filtro.ProdutoId.Value);
        }

        var inspecoes = await queryInspecoes.OrderByDescending(i => i.DataInspecao).ToListAsync();
        var rncs = await queryRncs.OrderByDescending(n => n.DataAbertura).ToListAsync();

        int totalInspecionado = inspecoes.Sum(i => i.QuantidadeInspecionada);
        int totalAprovado = inspecoes.Sum(i => i.QuantidadeAprovada);
        int totalRejeitado = inspecoes.Sum(i => i.QuantidadeRejeitada);

        double indiceGlobal = totalInspecionado > 0
            ? Math.Round((double)totalAprovado / totalInspecionado * 100, 2)
            : 0;

        string periodo = (filtro.DataInicio.HasValue && filtro.DataFim.HasValue)
            ? $"{filtro.DataInicio.Value:dd/MM/yyyy} até {filtro.DataFim.Value:dd/MM/yyyy}"
            : "Histórico Completo";

        // Pareto do período
        var defeitosAgrupados = inspecoes
            .SelectMany(i => i.DefeitosIdentificados)
            .GroupBy(d => new { d.TipoDefeitoId, d.TipoDefeito?.Codigo, d.TipoDefeito?.Nome, d.TipoDefeito?.Categoria })
            .Select(g => new
            {
                TipoDefeitoId = g.Key.TipoDefeitoId,
                Codigo = g.Key.Codigo ?? string.Empty,
                Nome = g.Key.Nome ?? string.Empty,
                Categoria = g.Key.Categoria.ToString() ?? string.Empty,
                Quantidade = g.Sum(x => x.Quantidade)
            })
            .OrderByDescending(x => x.Quantidade)
            .ToList();

        int totalDefeitos = defeitosAgrupados.Sum(x => x.Quantidade);
        double acumulado = 0;
        var pareto = new List<ParetoItemDto>();

        foreach (var def in defeitosAgrupados)
        {
            double pct = totalDefeitos > 0 ? Math.Round((double)def.Quantidade / totalDefeitos * 100, 2) : 0;
            acumulado += pct;

            pareto.Add(new ParetoItemDto
            {
                TipoDefeitoId = def.TipoDefeitoId,
                Codigo = def.Codigo,
                NomeDefeito = def.Nome,
                Categoria = def.Categoria,
                QuantidadeTotal = def.Quantidade,
                Percentual = pct,
                PercentualAcumulado = Math.Min(100.0, Math.Round(acumulado, 2))
            });
        }

        var relatorio = new RelatorioGerencialDto
        {
            DataGeracao = DateTime.UtcNow,
            PeriodoDescricao = periodo,
            TotalInspecoes = inspecoes.Count,
            TotalPecasInspecionadas = totalInspecionado,
            TotalPecasAprovadas = totalAprovado,
            TotalPecasRejeitadas = totalRejeitado,
            IndiceQualidadeGlobal = indiceGlobal,
            TotalRncsNoPeriodo = rncs.Count,
            TotalRncsResolvidasNoPeriodo = rncs.Count(r => r.Status == StatusNaoConformidade.Resolvida),
            PrincipaisDefeitos = pareto,
            Inspecoes = inspecoes.Select(i => new InspecaoRespostaDto
            {
                Id = i.Id,
                CodigoInspecao = i.CodigoInspecao,
                LoteId = i.LoteId,
                NumeroLote = i.Lote?.NumeroLote ?? string.Empty,
                ProdutoNome = i.Lote?.Produto?.Nome ?? string.Empty,
                ProdutoCodigo = i.Lote?.Produto?.Codigo ?? string.Empty,
                DataInspecao = i.DataInspecao,
                Inspetor = i.Inspetor,
                QuantidadeInspecionada = i.QuantidadeInspecionada,
                QuantidadeAprovada = i.QuantidadeAprovada,
                QuantidadeRejeitada = i.QuantidadeRejeitada,
                Status = i.Status,
                Observacoes = i.Observacoes,
                Defeitos = i.DefeitosIdentificados.Select(d => new DefeitoIdentificadoRespostaDto
                {
                    Id = d.Id,
                    TipoDefeitoId = d.TipoDefeitoId,
                    CodigoDefeito = d.TipoDefeito?.Codigo ?? string.Empty,
                    NomeDefeito = d.TipoDefeito?.Nome ?? string.Empty,
                    CategoriaDefeito = d.TipoDefeito?.Categoria.ToString() ?? string.Empty,
                    Quantidade = d.Quantidade,
                    Gravidade = d.Gravidade,
                    Observacao = d.Observacoes
                }).ToList(),
                RncGeradaId = i.NaoConformidades.Select(r => (int?)r.Id).FirstOrDefault()
            }).ToList(),
            NaoConformidades = rncs.Select(n => new NaoConformidadeRespostaDto
            {
                Id = n.Id,
                NumeroRnc = n.NumeroRnc,
                Titulo = n.Titulo,
                Descricao = n.Descricao,
                Origem = n.Origem,
                InspecaoId = n.InspecaoId,
                CodigoInspecao = n.Inspecao?.CodigoInspecao,
                LoteId = n.LoteId,
                NumeroLote = n.Lote?.NumeroLote,
                NomeProduto = n.Lote?.Produto?.Nome,
                CausaRaiz = n.CausaRaiz,
                AcaoImediata = n.AcaoImediata,
                AcaoCorretiva = n.AcaoCorretiva,
                ResponsavelTratativa = n.ResponsavelTratativa,
                Status = n.Status,
                Gravidade = n.Gravidade,
                DataAbertura = n.DataAbertura,
                PrazoConclusao = n.PrazoConclusao,
                DataFechamento = n.DataFechamento,
                Observacoes = n.Observacoes
            }).ToList()
        };

        return Ok(relatorio);
    }

    /// <summary>
    /// Gera o relatório consolidado de rastreabilidade de um lote específico
    /// </summary>
    [HttpGet("lote/{loteId}")]
    public async Task<ActionResult<RelatorioLoteConsolidadoDto>> GerarRelatorioPorLote(int loteId)
    {
        var lote = await _context.Lotes
            .Include(l => l.Produto)
            .Include(l => l.Inspecoes)
                .ThenInclude(i => i.DefeitosIdentificados)
                    .ThenInclude(d => d.TipoDefeito)
            .Include(l => l.NaoConformidades)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == loteId);

        if (lote == null)
        {
            return NotFound(new { mensagem = $"Lote com ID {loteId} não encontrado." });
        }

        int totalInspecionado = lote.Inspecoes.Sum(i => i.QuantidadeInspecionada);
        int totalAprovado = lote.Inspecoes.Sum(i => i.QuantidadeAprovada);
        int totalRejeitado = lote.Inspecoes.Sum(i => i.QuantidadeRejeitada);

        double taxaAprovacao = totalInspecionado > 0
            ? Math.Round((double)totalAprovado / totalInspecionado * 100, 2)
            : 0;

        var dto = new RelatorioLoteConsolidadoDto
        {
            Lote = new LoteRespostaDto
            {
                Id = lote.Id,
                NumeroLote = lote.NumeroLote,
                ProdutoId = lote.ProdutoId,
                NomeProduto = lote.Produto?.Nome ?? string.Empty,
                CodigoProduto = lote.Produto?.Codigo ?? string.Empty,
                QuantidadeTotal = lote.QuantidadeTotal,
                DataFabricacao = lote.DataFabricacao,
                LinhaProducao = lote.LinhaProducao,
                Status = lote.Status,
                Observacoes = lote.Observacoes,
                TotalInspecoes = lote.Inspecoes.Count,
                TotalNaoConformidades = lote.NaoConformidades.Count
            },
            TotalInspecoes = lote.Inspecoes.Count,
            QuantidadeTotalInspecionada = totalInspecionado,
            QuantidadeTotalAprovada = totalAprovado,
            QuantidadeTotalRejeitada = totalRejeitado,
            TaxaAprovacao = taxaAprovacao,
            Inspecoes = lote.Inspecoes.Select(i => new InspecaoRespostaDto
            {
                Id = i.Id,
                CodigoInspecao = i.CodigoInspecao,
                LoteId = i.LoteId,
                NumeroLote = lote.NumeroLote,
                ProdutoNome = lote.Produto?.Nome ?? string.Empty,
                ProdutoCodigo = lote.Produto?.Codigo ?? string.Empty,
                DataInspecao = i.DataInspecao,
                Inspetor = i.Inspetor,
                QuantidadeInspecionada = i.QuantidadeInspecionada,
                QuantidadeAprovada = i.QuantidadeAprovada,
                QuantidadeRejeitada = i.QuantidadeRejeitada,
                Status = i.Status,
                Observacoes = i.Observacoes,
                Defeitos = i.DefeitosIdentificados.Select(d => new DefeitoIdentificadoRespostaDto
                {
                    Id = d.Id,
                    TipoDefeitoId = d.TipoDefeitoId,
                    CodigoDefeito = d.TipoDefeito?.Codigo ?? string.Empty,
                    NomeDefeito = d.TipoDefeito?.Nome ?? string.Empty,
                    CategoriaDefeito = d.TipoDefeito?.Categoria.ToString() ?? string.Empty,
                    Quantidade = d.Quantidade,
                    Gravidade = d.Gravidade,
                    Observacao = d.Observacoes
                }).ToList()
            }).ToList(),
            NaoConformidades = lote.NaoConformidades.Select(n => new NaoConformidadeRespostaDto
            {
                Id = n.Id,
                NumeroRnc = n.NumeroRnc,
                Titulo = n.Titulo,
                Descricao = n.Descricao,
                Origem = n.Origem,
                InspecaoId = n.InspecaoId,
                LoteId = n.LoteId,
                NumeroLote = lote.NumeroLote,
                NomeProduto = lote.Produto?.Nome,
                CausaRaiz = n.CausaRaiz,
                AcaoImediata = n.AcaoImediata,
                AcaoCorretiva = n.AcaoCorretiva,
                ResponsavelTratativa = n.ResponsavelTratativa,
                Status = n.Status,
                Gravidade = n.Gravidade,
                DataAbertura = n.DataAbertura,
                PrazoConclusao = n.PrazoConclusao,
                DataFechamento = n.DataFechamento,
                Observacoes = n.Observacoes
            }).ToList()
        };

        return Ok(dto);
    }
}
