using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/vistorias")]
public class VistoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public VistoriasController(AppDbContext context)
    {
        _context = context;
    }

    public record VistoriaInputDto(
        int MaquinaId,
        string ResponsavelVistoria,
        DateTime DataVistoria,
        string Status,
        string? Observacoes,
        bool CriarPendenciaSeReprovado,
        string? TituloPendencia,
        string? ResponsavelTratativa,
        DateTime? PrazoPendencia
    );

    [HttpGet]
    public async Task<IActionResult> ObterTodas([FromQuery] int? maquinaId, [FromQuery] string? status)
    {
        // Sincroniza revisões de máquinas que já tiveram suas manutenções resolvidas
        var vistoriasComPendenciaResolvida = await _context.Vistorias
            .Where(v => v.Status != "Aprovado" && v.PendenciaGeradaId != null)
            .Join(_context.Pendencias.Where(p => p.Status == "Resolvida"),
                  v => v.PendenciaGeradaId,
                  p => p.Id,
                  (v, p) => new { Vistoria = v, Pendencia = p })
            .ToListAsync();

        if (vistoriasComPendenciaResolvida.Count > 0)
        {
            foreach (var item in vistoriasComPendenciaResolvida)
            {
                item.Vistoria.Status = "Aprovado";
                var solucao = !string.IsNullOrWhiteSpace(item.Pendencia.SolucaoAplicada)
                    ? item.Pendencia.SolucaoAplicada
                    : "Manutenção concluída e aprovada.";
                if (!item.Vistoria.Observacoes.Contains("[Reparo Concluído"))
                {
                    item.Vistoria.Observacoes += $" — [Reparo Concluído: {solucao}]";
                }
            }
            await _context.SaveChangesAsync();
        }

        var query = _context.Vistorias
            .Include(v => v.Maquina)
            .AsNoTracking()
            .AsQueryable();

        if (maquinaId.HasValue && maquinaId.Value > 0)
        {
            query = query.Where(v => v.MaquinaId == maquinaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "todos")
        {
            query = query.Where(v => v.Status == status);
        }

        var lista = await query
            .OrderByDescending(v => v.DataVistoria)
            .Select(v => new
            {
                v.Id,
                v.CodigoVistoria,
                v.MaquinaId,
                NumeroPatrimonio = v.Maquina != null ? v.Maquina.NumeroPatrimonio : "N/A",
                NomeModelo = v.Maquina != null ? v.Maquina.NomeModelo : "N/A",
                Setor = v.Maquina != null ? v.Maquina.Setor : "N/A",
                v.ResponsavelVistoria,
                v.DataVistoria,
                v.Status,
                v.Observacoes,
                v.PendenciaGeradaId,
                v.DataCadastro
            })
            .ToListAsync();

        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] VistoriaInputDto dto)
    {
        var maquina = await _context.Maquinas.FindAsync(dto.MaquinaId);
        if (maquina == null)
            return BadRequest(new { mensagem = "A máquina selecionada não existe." });

        var total = await _context.Vistorias.CountAsync();
        var codigo = $"VST-{(total + 1):D4}";

        var vistoria = new Vistoria
        {
            CodigoVistoria = codigo,
            MaquinaId = dto.MaquinaId,
            ResponsavelVistoria = string.IsNullOrWhiteSpace(dto.ResponsavelVistoria) ? "Fiscal" : dto.ResponsavelVistoria.Trim(),
            DataVistoria = dto.DataVistoria.ToUniversalTime(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Aprovado" : dto.Status.Trim(),
            Observacoes = dto.Observacoes ?? string.Empty,
            DataCadastro = DateTime.UtcNow
        };

        // Atualiza a data da última revisão na máquina
        maquina.DataUltimaRevisao = dto.DataVistoria.ToUniversalTime();

        // Se foi reprovada e o usuário marcou para abrir pendência
        if (dto.Status == "Reprovado" || dto.Status == "Aprovado com Restrição")
        {
            if (dto.Status == "Reprovado") maquina.Status = "Em Manutenção";

            if (dto.CriarPendenciaSeReprovado)
            {
                var totalPend = await _context.Pendencias.CountAsync();
                var pnd = new Pendencia
                {
                    CodigoPendencia = $"PND-{(totalPend + 1):D4}",
                    Titulo = !string.IsNullOrWhiteSpace(dto.TituloPendencia)
                        ? dto.TituloPendencia.Trim()
                        : $"Falha identificada na vistoria {codigo} ({maquina.NumeroPatrimonio})",
                    Descricao = dto.Observacoes ?? "Falha apontada durante vistoria.",
                    MaquinaId = maquina.Id,
                    Setor = maquina.Setor,
                    Responsavel = !string.IsNullOrWhiteSpace(dto.ResponsavelTratativa)
                        ? dto.ResponsavelTratativa.Trim()
                        : maquina.Responsavel,
                    PrazoLimite = dto.PrazoPendencia?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(5),
                    Status = "Aberta",
                    DataCriacao = DateTime.UtcNow
                };

                _context.Pendencias.Add(pnd);
                await _context.SaveChangesAsync();
                vistoria.PendenciaGeradaId = pnd.Id;
            }
        }
        else if (dto.Status == "Aprovado")
        {
            if (maquina.Status == "Em Manutenção") maquina.Status = "Ativo";
        }

        _context.Vistorias.Add(vistoria);
        await _context.SaveChangesAsync();

        return Ok(vistoria);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var vistoria = await _context.Vistorias.FindAsync(id);
        if (vistoria == null) return NotFound(new { mensagem = "Vistoria não encontrada." });

        _context.Vistorias.Remove(vistoria);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
