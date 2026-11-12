using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/pendencias")]
public class PendenciasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PendenciasController(AppDbContext context)
    {
        _context = context;
    }

    public record PendenciaInputDto(
        string Titulo,
        string Descricao,
        int? MaquinaId,
        string? Setor,
        string Responsavel,
        DateTime PrazoLimite,
        string? Status
    );

    public record ResolverInputDto(
        string SolucaoAplicada,
        string Status
    );

    [HttpGet]
    public async Task<IActionResult> ObterTodas([FromQuery] string? status, [FromQuery] string? busca)
    {
        var query = _context.Pendencias
            .Include(p => p.Maquina)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "todos")
        {
            if (status == "Atrasadas")
            {
                var agora = DateTime.UtcNow;
                query = query.Where(p => p.Status != "Resolvida" && p.Status != "Cancelada" && p.PrazoLimite < agora);
            }
            else
            {
                query = query.Where(p => p.Status == status);
            }
        }

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var b = busca.Trim().ToLower();
            query = query.Where(p => p.Titulo.ToLower().Contains(b) ||
                                     p.Responsavel.ToLower().Contains(b) ||
                                     p.CodigoPendencia.ToLower().Contains(b) ||
                                     (p.Maquina != null && p.Maquina.NumeroPatrimonio.ToLower().Contains(b)));
        }

        var lista = await query
            .OrderBy(p => p.Status == "Resolvida" ? 1 : 0)
            .ThenBy(p => p.PrazoLimite)
            .Select(p => new
            {
                p.Id,
                p.CodigoPendencia,
                p.Titulo,
                p.Descricao,
                p.MaquinaId,
                NumeroPatrimonio = p.Maquina != null ? p.Maquina.NumeroPatrimonio : "Geral",
                NomeModelo = p.Maquina != null ? p.Maquina.NomeModelo : "",
                p.Setor,
                p.Responsavel,
                p.PrazoLimite,
                p.Status,
                p.DataResolucao,
                p.SolucaoAplicada,
                p.DataCriacao,
                EstaAtrasada = (p.Status != "Resolvida" && p.Status != "Cancelada" && p.PrazoLimite < DateTime.UtcNow)
            })
            .ToListAsync();

        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] PendenciaInputDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Titulo) || string.IsNullOrWhiteSpace(dto.Responsavel))
            return BadRequest(new { mensagem = "Título e responsável são obrigatórios." });

        var total = await _context.Pendencias.CountAsync();
        var codigo = $"PND-{(total + 1):D4}";

        string setorFinal = dto.Setor ?? "Geral";
        if (dto.MaquinaId.HasValue && dto.MaquinaId.Value > 0)
        {
            var maquina = await _context.Maquinas.FindAsync(dto.MaquinaId.Value);
            if (maquina != null && string.IsNullOrWhiteSpace(dto.Setor))
            {
                setorFinal = maquina.Setor;
            }
        }

        var pendencia = new Pendencia
        {
            CodigoPendencia = codigo,
            Titulo = dto.Titulo.Trim(),
            Descricao = dto.Descricao ?? string.Empty,
            MaquinaId = dto.MaquinaId > 0 ? dto.MaquinaId : null,
            Setor = setorFinal,
            Responsavel = dto.Responsavel.Trim(),
            PrazoLimite = dto.PrazoLimite.ToUniversalTime(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Aberta" : dto.Status.Trim(),
            DataCriacao = DateTime.UtcNow
        };

        _context.Pendencias.Add(pendencia);
        await _context.SaveChangesAsync();

        return Ok(pendencia);
    }

    [HttpPut("{id}/resolver")]
    public async Task<IActionResult> Resolver(int id, [FromBody] ResolverInputDto dto)
    {
        var pendencia = await _context.Pendencias.Include(p => p.Maquina).FirstOrDefaultAsync(p => p.Id == id);
        if (pendencia == null) return NotFound(new { mensagem = "Pendência não encontrada." });

        pendencia.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Resolvida" : dto.Status.Trim();
        pendencia.SolucaoAplicada = dto.SolucaoAplicada ?? string.Empty;
        pendencia.DataResolucao = DateTime.UtcNow;

        // Se estiver vinculada a uma máquina que estava em manutenção, reativa a máquina
        if (pendencia.Maquina != null && pendencia.Maquina.Status == "Em Manutenção")
        {
            pendencia.Maquina.Status = "Ativo";
        }

        // Opção 1: Atualiza automaticamente a revisão técnica vinculada para "Aprovado"
        var vistoriaVinculada = await _context.Vistorias.FirstOrDefaultAsync(v => v.PendenciaGeradaId == id);
        if (vistoriaVinculada == null && pendencia.MaquinaId.HasValue)
        {
            vistoriaVinculada = await _context.Vistorias
                .Where(v => v.MaquinaId == pendencia.MaquinaId.Value && v.Status != "Aprovado")
                .OrderByDescending(v => v.DataVistoria)
                .FirstOrDefaultAsync();
        }

        if (vistoriaVinculada != null)
        {
            vistoriaVinculada.Status = "Aprovado";
            var solucaoTexto = !string.IsNullOrWhiteSpace(dto.SolucaoAplicada)
                ? dto.SolucaoAplicada.Trim()
                : "Manutenção concluída e testada com sucesso.";

            if (string.IsNullOrWhiteSpace(vistoriaVinculada.Observacoes))
            {
                vistoriaVinculada.Observacoes = $"[Reparado]: {solucaoTexto}";
            }
            else if (!vistoriaVinculada.Observacoes.Contains("[Reparo Concluído"))
            {
                vistoriaVinculada.Observacoes += $" — [Reparo Concluído: {solucaoTexto}]";
            }
        }

        await _context.SaveChangesAsync();
        return Ok(pendencia);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var pendencia = await _context.Pendencias.FindAsync(id);
        if (pendencia == null) return NotFound(new { mensagem = "Pendência não encontrada." });

        _context.Pendencias.Remove(pendencia);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
