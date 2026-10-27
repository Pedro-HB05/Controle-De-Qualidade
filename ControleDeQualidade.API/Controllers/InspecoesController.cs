using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Entities;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/inspecoes")]
public class InspecoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InspecoesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista inspeções de qualidade com filtros opcionais
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InspecaoRespostaDto>>> ObterTodas(
        [FromQuery] int? loteId,
        [FromQuery] StatusInspecao? status,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] string? inspetor)
    {
        var query = _context.Inspecoes
            .Include(i => i.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(i => i.DefeitosIdentificados)
                .ThenInclude(d => d.TipoDefeito)
            .Include(i => i.NaoConformidades)
            .AsNoTracking()
            .AsQueryable();

        if (loteId.HasValue)
        {
            query = query.Where(i => i.LoteId == loteId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(i => i.DataInspecao >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(i => i.DataInspecao <= dataFim.Value);
        }

        if (!string.IsNullOrWhiteSpace(inspetor))
        {
            query = query.Where(i => i.Inspetor.ToLower().Contains(inspetor.Trim().ToLower()));
        }

        var lista = await query
            .OrderByDescending(i => i.DataInspecao)
            .Select(i => new InspecaoRespostaDto
            {
                Id = i.Id,
                CodigoInspecao = i.CodigoInspecao,
                LoteId = i.LoteId,
                NumeroLote = i.Lote != null ? i.Lote.NumeroLote : string.Empty,
                ProdutoNome = i.Lote != null && i.Lote.Produto != null ? i.Lote.Produto.Nome : string.Empty,
                ProdutoCodigo = i.Lote != null && i.Lote.Produto != null ? i.Lote.Produto.Codigo : string.Empty,
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
                    CodigoDefeito = d.TipoDefeito != null ? d.TipoDefeito.Codigo : string.Empty,
                    NomeDefeito = d.TipoDefeito != null ? d.TipoDefeito.Nome : string.Empty,
                    CategoriaDefeito = d.TipoDefeito != null ? d.TipoDefeito.Categoria.ToString() : string.Empty,
                    Quantidade = d.Quantidade,
                    Gravidade = d.Gravidade,
                    Observacao = d.Observacoes
                }).ToList(),
                RncGeradaId = i.NaoConformidades.Select(r => (int?)r.Id).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(lista);
    }

    /// <summary>
    /// Obtém detalhes de uma inspeção por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InspecaoRespostaDto>> ObterPorId(int id)
    {
        var i = await _context.Inspecoes
            .Include(i => i.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(i => i.DefeitosIdentificados)
                .ThenInclude(d => d.TipoDefeito)
            .Include(i => i.NaoConformidades)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (i == null)
        {
            return NotFound(new { mensagem = $"Inspeção com ID {id} não encontrada." });
        }

        return Ok(new InspecaoRespostaDto
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
        });
    }

    /// <summary>
    /// Registra uma nova inspeção de qualidade com defeitos identificados
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InspecaoRespostaDto>> Criar([FromBody] InspecaoCriacaoDto dto)
    {
        var lote = await _context.Lotes
            .Include(l => l.Produto)
            .FirstOrDefaultAsync(l => l.Id == dto.LoteId);

        if (lote == null)
        {
            return BadRequest(new { mensagem = $"Lote com ID {dto.LoteId} não encontrado." });
        }

        if (dto.QuantidadeAprovada + dto.QuantidadeRejeitada > dto.QuantidadeInspecionada)
        {
            return BadRequest(new { mensagem = "A soma das peças aprovadas e rejeitadas não pode ultrapassar a quantidade inspecionada." });
        }

        // Determinar código da inspeção
        string codigoInspecao = dto.CodigoInspecao?.Trim().ToUpper() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(codigoInspecao))
        {
            var totalHoje = await _context.Inspecoes.CountAsync() + 1;
            codigoInspecao = $"INSP-{DateTime.UtcNow.Year}-{totalHoje:D4}";
        }
        else if (await _context.Inspecoes.AnyAsync(i => i.CodigoInspecao == codigoInspecao))
        {
            return BadRequest(new { mensagem = $"Já existe uma inspeção com o código '{codigoInspecao}'." });
        }

        // Determinar status da inspeção
        var statusInspecao = dto.Status ?? (dto.QuantidadeRejeitada == 0
            ? StatusInspecao.Aprovado
            : (dto.QuantidadeAprovada > 0 ? StatusInspecao.AprovadoComRestricao : StatusInspecao.Reprovado));

        var inspecao = new Inspecao
        {
            CodigoInspecao = codigoInspecao,
            LoteId = dto.LoteId,
            DataInspecao = dto.DataInspecao == default ? DateTime.UtcNow : dto.DataInspecao,
            Inspetor = dto.Inspetor.Trim(),
            QuantidadeInspecionada = dto.QuantidadeInspecionada,
            QuantidadeAprovada = dto.QuantidadeAprovada,
            QuantidadeRejeitada = dto.QuantidadeRejeitada,
            Status = statusInspecao,
            Observacoes = dto.Observacoes.Trim()
        };

        // Adicionar defeitos identificados
        if (dto.DefeitosIdentificados.Any())
        {
            var tipoIds = dto.DefeitosIdentificados.Select(d => d.TipoDefeitoId).Distinct().ToList();
            var tiposValidos = await _context.TiposDefeitos.Where(t => tipoIds.Contains(t.Id)).ToListAsync();

            if (tiposValidos.Count != tipoIds.Count)
            {
                return BadRequest(new { mensagem = "Um ou mais IDs de tipos de defeitos fornecidos são inválidos." });
            }

            foreach (var item in dto.DefeitosIdentificados)
            {
                inspecao.DefeitosIdentificados.Add(new DefeitoIdentificado
                {
                    TipoDefeitoId = item.TipoDefeitoId,
                    Quantidade = item.Quantidade,
                    Gravidade = item.Gravidade,
                    Observacoes = item.Observacao.Trim()
                });
            }
        }

        // Atualizar status do Lote
        if (statusInspecao == StatusInspecao.Aprovado)
        {
            lote.Status = StatusLote.Aprovado;
        }
        else if (statusInspecao == StatusInspecao.Reprovado)
        {
            lote.Status = StatusLote.Reprovado;
        }
        else if (statusInspecao == StatusInspecao.AprovadoComRestricao)
        {
            lote.Status = StatusLote.AprovadoComRestricao;
        }

        _context.Inspecoes.Add(inspecao);
        await _context.SaveChangesAsync();

        int? rncCriadaId = null;

        // Se solicitado e houver reprovação ou restrição, abre RNC automaticamente
        if (dto.GerarRncSeReprovado && statusInspecao != StatusInspecao.Aprovado)
        {
            var rncCount = await _context.NaoConformidades.CountAsync() + 1;
            var novaRnc = new NaoConformidade
            {
                NumeroRnc = $"RNC-{DateTime.UtcNow.Year}-{rncCount:D3}",
                Titulo = $"Não conformidade gerada na inspeção {inspecao.CodigoInspecao} (Lote: {lote.NumeroLote})",
                Descricao = $"Identificadas {inspecao.QuantidadeRejeitada} peças com defeito de {inspecao.QuantidadeInspecionada} inspecionadas.",
                Origem = "Inspeção de Qualidade",
                InspecaoId = inspecao.Id,
                LoteId = lote.Id,
                ResponsavelTratativa = inspecao.Inspetor,
                Status = StatusNaoConformidade.Aberta,
                Gravidade = statusInspecao == StatusInspecao.Reprovado ? GravidadeDefeito.Grave : GravidadeDefeito.Media,
                DataAbertura = DateTime.UtcNow,
                PrazoConclusao = DateTime.UtcNow.AddDays(7),
                Observacoes = "RNC gerada automaticamente pelo módulo de inspeção de qualidade."
            };

            _context.NaoConformidades.Add(novaRnc);
            await _context.SaveChangesAsync();
            rncCriadaId = novaRnc.Id;
        }

        var resposta = new InspecaoRespostaDto
        {
            Id = inspecao.Id,
            CodigoInspecao = inspecao.CodigoInspecao,
            LoteId = inspecao.LoteId,
            NumeroLote = lote.NumeroLote,
            ProdutoNome = lote.Produto?.Nome ?? string.Empty,
            ProdutoCodigo = lote.Produto?.Codigo ?? string.Empty,
            DataInspecao = inspecao.DataInspecao,
            Inspetor = inspecao.Inspetor,
            QuantidadeInspecionada = inspecao.QuantidadeInspecionada,
            QuantidadeAprovada = inspecao.QuantidadeAprovada,
            QuantidadeRejeitada = inspecao.QuantidadeRejeitada,
            Status = inspecao.Status,
            Observacoes = inspecao.Observacoes,
            Defeitos = inspecao.DefeitosIdentificados.Select(d => new DefeitoIdentificadoRespostaDto
            {
                Id = d.Id,
                TipoDefeitoId = d.TipoDefeitoId,
                CodigoDefeito = _context.TiposDefeitos.Find(d.TipoDefeitoId)?.Codigo ?? string.Empty,
                NomeDefeito = _context.TiposDefeitos.Find(d.TipoDefeitoId)?.Nome ?? string.Empty,
                CategoriaDefeito = _context.TiposDefeitos.Find(d.TipoDefeitoId)?.Categoria.ToString() ?? string.Empty,
                Quantidade = d.Quantidade,
                Gravidade = d.Gravidade,
                Observacao = d.Observacoes
            }).ToList(),
            RncGeradaId = rncCriadaId
        };

        return CreatedAtAction(nameof(ObterPorId), new { id = inspecao.Id }, resposta);
    }

    /// <summary>
    /// Exclui uma inspeção
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var inspecao = await _context.Inspecoes
            .Include(i => i.DefeitosIdentificados)
            .Include(i => i.NaoConformidades)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inspecao == null)
        {
            return NotFound(new { mensagem = $"Inspeção com ID {id} não encontrada." });
        }

        _context.Inspecoes.Remove(inspecao);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
