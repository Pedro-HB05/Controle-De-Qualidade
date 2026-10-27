using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Entities;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/nao-conformidades")]
public class NaoConformidadesController : ControllerBase
{
    private readonly AppDbContext _context;

    public NaoConformidadesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista não conformidades com filtros por status, gravidade ou lote
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NaoConformidadeRespostaDto>>> ObterTodas(
        [FromQuery] StatusNaoConformidade? status,
        [FromQuery] GravidadeDefeito? gravidade,
        [FromQuery] int? loteId,
        [FromQuery] bool? apenasAtrasadas,
        [FromQuery] string? termoBusca)
    {
        var query = _context.NaoConformidades
            .Include(n => n.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(n => n.Inspecao)
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(n => n.Status == status.Value);
        }

        if (gravidade.HasValue)
        {
            query = query.Where(n => n.Gravidade == gravidade.Value);
        }

        if (loteId.HasValue)
        {
            query = query.Where(n => n.LoteId == loteId.Value);
        }

        if (apenasAtrasadas.HasValue && apenasAtrasadas.Value)
        {
            var agora = DateTime.UtcNow;
            query = query.Where(n => n.Status != StatusNaoConformidade.Resolvida &&
                                     n.Status != StatusNaoConformidade.Cancelada &&
                                     n.PrazoConclusao.HasValue &&
                                     n.PrazoConclusao.Value < agora);
        }

        if (!string.IsNullOrWhiteSpace(termoBusca))
        {
            var termo = termoBusca.Trim().ToLower();
            query = query.Where(n => n.NumeroRnc.ToLower().Contains(termo) ||
                                     n.Titulo.ToLower().Contains(termo) ||
                                     n.Descricao.ToLower().Contains(termo) ||
                                     n.ResponsavelTratativa.ToLower().Contains(termo));
        }

        var lista = await query
            .OrderByDescending(n => n.DataAbertura)
            .Select(n => new NaoConformidadeRespostaDto
            {
                Id = n.Id,
                NumeroRnc = n.NumeroRnc,
                Titulo = n.Titulo,
                Descricao = n.Descricao,
                Origem = n.Origem,
                InspecaoId = n.InspecaoId,
                CodigoInspecao = n.Inspecao != null ? n.Inspecao.CodigoInspecao : null,
                LoteId = n.LoteId,
                NumeroLote = n.Lote != null ? n.Lote.NumeroLote : null,
                NomeProduto = n.Lote != null && n.Lote.Produto != null ? n.Lote.Produto.Nome : null,
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
            })
            .ToListAsync();

        return Ok(lista);
    }

    /// <summary>
    /// Obtém detalhes de uma Não Conformidade (RNC)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<NaoConformidadeRespostaDto>> ObterPorId(int id)
    {
        var n = await _context.NaoConformidades
            .Include(n => n.Lote)
                .ThenInclude(l => l!.Produto)
            .Include(n => n.Inspecao)
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id);

        if (n == null)
        {
            return NotFound(new { mensagem = $"Não conformidade com ID {id} não encontrada." });
        }

        return Ok(new NaoConformidadeRespostaDto
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
        });
    }

    /// <summary>
    /// Abre um novo registro de Não Conformidade (RNC)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<NaoConformidadeRespostaDto>> Criar([FromBody] NaoConformidadeCriacaoDto dto)
    {
        string numeroRnc = dto.NumeroRnc?.Trim().ToUpper() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(numeroRnc))
        {
            var total = await _context.NaoConformidades.CountAsync() + 1;
            numeroRnc = $"RNC-{DateTime.UtcNow.Year}-{total:D3}";
        }
        else if (await _context.NaoConformidades.AnyAsync(n => n.NumeroRnc == numeroRnc))
        {
            return BadRequest(new { mensagem = $"Já existe uma Não Conformidade com o número '{numeroRnc}'." });
        }

        if (dto.LoteId.HasValue && !await _context.Lotes.AnyAsync(l => l.Id == dto.LoteId.Value))
        {
            return BadRequest(new { mensagem = $"Lote com ID {dto.LoteId} não encontrado." });
        }

        if (dto.InspecaoId.HasValue && !await _context.Inspecoes.AnyAsync(i => i.Id == dto.InspecaoId.Value))
        {
            return BadRequest(new { mensagem = $"Inspeção com ID {dto.InspecaoId} não encontrada." });
        }

        var rnc = new NaoConformidade
        {
            NumeroRnc = numeroRnc,
            Titulo = dto.Titulo.Trim(),
            Descricao = dto.Descricao.Trim(),
            Origem = string.IsNullOrWhiteSpace(dto.Origem) ? "Inspeção de Qualidade" : dto.Origem.Trim(),
            InspecaoId = dto.InspecaoId,
            LoteId = dto.LoteId,
            CausaRaiz = dto.CausaRaiz?.Trim(),
            AcaoImediata = dto.AcaoImediata?.Trim(),
            AcaoCorretiva = dto.AcaoCorretiva?.Trim(),
            ResponsavelTratativa = dto.ResponsavelTratativa.Trim(),
            Status = dto.Status,
            Gravidade = dto.Gravidade,
            DataAbertura = dto.DataAbertura == default ? DateTime.UtcNow : dto.DataAbertura,
            PrazoConclusao = dto.PrazoConclusao,
            Observacoes = dto.Observacoes.Trim()
        };

        _context.NaoConformidades.Add(rnc);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = rnc.Id }, new NaoConformidadeRespostaDto
        {
            Id = rnc.Id,
            NumeroRnc = rnc.NumeroRnc,
            Titulo = rnc.Titulo,
            Descricao = rnc.Descricao,
            Origem = rnc.Origem,
            InspecaoId = rnc.InspecaoId,
            LoteId = rnc.LoteId,
            CausaRaiz = rnc.CausaRaiz,
            AcaoImediata = rnc.AcaoImediata,
            AcaoCorretiva = rnc.AcaoCorretiva,
            ResponsavelTratativa = rnc.ResponsavelTratativa,
            Status = rnc.Status,
            Gravidade = rnc.Gravidade,
            DataAbertura = rnc.DataAbertura,
            PrazoConclusao = rnc.PrazoConclusao,
            Observacoes = rnc.Observacoes
        });
    }

    /// <summary>
    /// Registra a análise de causa raiz e plano de ação corretiva (Tratativa de RNC)
    /// </summary>
    [HttpPatch("{id}/tratativa")]
    public async Task<IActionResult> RegistrarTratativa(int id, [FromBody] NaoConformidadeTratativaDto dto)
    {
        var rnc = await _context.NaoConformidades.FindAsync(id);
        if (rnc == null)
        {
            return NotFound(new { mensagem = $"Não conformidade com ID {id} não encontrada." });
        }

        rnc.CausaRaiz = dto.CausaRaiz.Trim();
        if (!string.IsNullOrWhiteSpace(dto.AcaoImediata))
        {
            rnc.AcaoImediata = dto.AcaoImediata.Trim();
        }
        rnc.AcaoCorretiva = dto.AcaoCorretiva.Trim();
        rnc.ResponsavelTratativa = dto.ResponsavelTratativa.Trim();
        if (dto.PrazoConclusao.HasValue)
        {
            rnc.PrazoConclusao = dto.PrazoConclusao.Value;
        }

        if (dto.ConcluirTratativa)
        {
            rnc.Status = StatusNaoConformidade.Resolvida;
            rnc.DataFechamento = DateTime.UtcNow;
        }
        else
        {
            rnc.Status = dto.Status;
        }

        if (!string.IsNullOrWhiteSpace(dto.Observacoes))
        {
            rnc.Observacoes = dto.Observacoes.Trim();
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensagem = $"Tratativa da RNC {rnc.NumeroRnc} registrada com sucesso. Status atual: {rnc.Status}." });
    }

    /// <summary>
    /// Atualiza dados cadastrais de uma RNC
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] NaoConformidadeAtualizacaoDto dto)
    {
        var rnc = await _context.NaoConformidades.FindAsync(id);
        if (rnc == null)
        {
            return NotFound(new { mensagem = $"Não conformidade com ID {id} não encontrada." });
        }

        rnc.Titulo = dto.Titulo.Trim();
        rnc.Descricao = dto.Descricao.Trim();
        rnc.Origem = dto.Origem.Trim();
        rnc.CausaRaiz = dto.CausaRaiz?.Trim();
        rnc.AcaoImediata = dto.AcaoImediata?.Trim();
        rnc.AcaoCorretiva = dto.AcaoCorretiva?.Trim();
        rnc.ResponsavelTratativa = dto.ResponsavelTratativa.Trim();
        rnc.Status = dto.Status;
        rnc.Gravidade = dto.Gravidade;
        rnc.PrazoConclusao = dto.PrazoConclusao;
        rnc.DataFechamento = dto.DataFechamento;
        rnc.Observacoes = dto.Observacoes.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Exclui um registro de Não Conformidade
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var rnc = await _context.NaoConformidades.FindAsync(id);
        if (rnc == null)
        {
            return NotFound(new { mensagem = $"Não conformidade com ID {id} não encontrada." });
        }

        _context.NaoConformidades.Remove(rnc);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
