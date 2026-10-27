using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Entities;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/lotes")]
public class LotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LotesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista os lotes de produção com filtros opcionais
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoteRespostaDto>>> ObterTodos(
        [FromQuery] int? produtoId,
        [FromQuery] StatusLote? status,
        [FromQuery] string? termoBusca)
    {
        var query = _context.Lotes
            .Include(l => l.Produto)
            .Include(l => l.Inspecoes)
            .Include(l => l.NaoConformidades)
            .AsNoTracking()
            .AsQueryable();

        if (produtoId.HasValue)
        {
            query = query.Where(l => l.ProdutoId == produtoId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(termoBusca))
        {
            var termo = termoBusca.Trim().ToLower();
            query = query.Where(l => l.NumeroLote.ToLower().Contains(termo) ||
                                     l.LinhaProducao.ToLower().Contains(termo) ||
                                     (l.Produto != null && l.Produto.Nome.ToLower().Contains(termo)));
        }

        var lotes = await query
            .OrderByDescending(l => l.DataFabricacao)
            .Select(l => new LoteRespostaDto
            {
                Id = l.Id,
                NumeroLote = l.NumeroLote,
                ProdutoId = l.ProdutoId,
                NomeProduto = l.Produto != null ? l.Produto.Nome : string.Empty,
                CodigoProduto = l.Produto != null ? l.Produto.Codigo : string.Empty,
                QuantidadeTotal = l.QuantidadeTotal,
                DataFabricacao = l.DataFabricacao,
                LinhaProducao = l.LinhaProducao,
                Status = l.Status,
                Observacoes = l.Observacoes,
                TotalInspecoes = l.Inspecoes.Count,
                TotalNaoConformidades = l.NaoConformidades.Count
            })
            .ToListAsync();

        return Ok(lotes);
    }

    /// <summary>
    /// Obtém detalhes de um lote de produção
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LoteRespostaDto>> ObterPorId(int id)
    {
        var lote = await _context.Lotes
            .Include(l => l.Produto)
            .Include(l => l.Inspecoes)
            .Include(l => l.NaoConformidades)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lote == null)
        {
            return NotFound(new { mensagem = $"Lote com ID {id} não encontrado." });
        }

        return Ok(new LoteRespostaDto
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
        });
    }

    /// <summary>
    /// Cadastra um novo lote de fabricação
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<LoteRespostaDto>> Criar([FromBody] LoteCriacaoDto dto)
    {
        var produto = await _context.Produtos.FindAsync(dto.ProdutoId);
        if (produto == null)
        {
            return BadRequest(new { mensagem = $"Produto com ID {dto.ProdutoId} não existe." });
        }

        if (await _context.Lotes.AnyAsync(l => l.NumeroLote.ToLower() == dto.NumeroLote.Trim().ToLower()))
        {
            return BadRequest(new { mensagem = $"Já existe um lote cadastrado com o número '{dto.NumeroLote}'." });
        }

        var lote = new Lote
        {
            NumeroLote = dto.NumeroLote.Trim().ToUpper(),
            ProdutoId = dto.ProdutoId,
            QuantidadeTotal = dto.QuantidadeTotal,
            DataFabricacao = dto.DataFabricacao == default ? DateTime.UtcNow : dto.DataFabricacao,
            LinhaProducao = dto.LinhaProducao.Trim(),
            Status = dto.Status,
            Observacoes = dto.Observacoes.Trim()
        };

        _context.Lotes.Add(lote);
        await _context.SaveChangesAsync();

        var resposta = new LoteRespostaDto
        {
            Id = lote.Id,
            NumeroLote = lote.NumeroLote,
            ProdutoId = lote.ProdutoId,
            NomeProduto = produto.Nome,
            CodigoProduto = produto.Codigo,
            QuantidadeTotal = lote.QuantidadeTotal,
            DataFabricacao = lote.DataFabricacao,
            LinhaProducao = lote.LinhaProducao,
            Status = lote.Status,
            Observacoes = lote.Observacoes,
            TotalInspecoes = 0,
            TotalNaoConformidades = 0
        };

        return CreatedAtAction(nameof(ObterPorId), new { id = lote.Id }, resposta);
    }

    /// <summary>
    /// Atualiza dados de um lote
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] LoteAtualizacaoDto dto)
    {
        var lote = await _context.Lotes.FindAsync(id);
        if (lote == null)
        {
            return NotFound(new { mensagem = $"Lote com ID {id} não encontrado." });
        }

        lote.QuantidadeTotal = dto.QuantidadeTotal;
        lote.DataFabricacao = dto.DataFabricacao;
        lote.LinhaProducao = dto.LinhaProducao.Trim();
        lote.Status = dto.Status;
        lote.Observacoes = dto.Observacoes.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Atualiza rapidamente o status operacional de um lote
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> AtualizarStatus(int id, [FromBody] StatusLote novoStatus)
    {
        var lote = await _context.Lotes.FindAsync(id);
        if (lote == null)
        {
            return NotFound(new { mensagem = $"Lote com ID {id} não encontrado." });
        }

        lote.Status = novoStatus;
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = $"Status do lote {lote.NumeroLote} atualizado para {novoStatus}." });
    }

    /// <summary>
    /// Exclui um lote (se não houver inspeções vinculadas)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var lote = await _context.Lotes
            .Include(l => l.Inspecoes)
            .Include(l => l.NaoConformidades)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lote == null)
        {
            return NotFound(new { mensagem = $"Lote com ID {id} não encontrado." });
        }

        if (lote.Inspecoes.Any() || lote.NaoConformidades.Any())
        {
            return BadRequest(new { mensagem = "Não é possível excluir o lote pois ele possui registros históricos de inspeções ou não conformidades." });
        }

        _context.Lotes.Remove(lote);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
