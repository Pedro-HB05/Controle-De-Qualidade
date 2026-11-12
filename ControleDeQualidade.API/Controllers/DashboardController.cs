using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;

namespace ControleDeQualidade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("resumo")]
    public async Task<IActionResult> ObterResumo()
    {
        var agora = DateTime.UtcNow;

        // 1. Métricas de Máquinas / Patrimônio
        var totalMaquinas = await _context.Maquinas.CountAsync();
        var maquinasAtivas = await _context.Maquinas.CountAsync(m => m.Status == "Ativo");
        var maquinasManutencao = await _context.Maquinas.CountAsync(m => m.Status == "Em Manutenção");
        var maquinasDisponiveis = await _context.Maquinas.CountAsync(m => m.Status == "Disponível");

        // 2. Métricas de Vistorias
        var totalVistorias = await _context.Vistorias.CountAsync();
        var vistoriasAprovadas = await _context.Vistorias.CountAsync(v => v.Status == "Aprovado");
        var vistoriasReprovadas = await _context.Vistorias.CountAsync(v => v.Status == "Reprovado");
        var taxaAprovacao = totalVistorias > 0 ? ((double)vistoriasAprovadas / totalVistorias) * 100 : 100.0;

        // 3. Métricas de Prazos e Pendências
        var totalPendencias = await _context.Pendencias.CountAsync();
        var pendenciasAbertas = await _context.Pendencias.CountAsync(p => p.Status != "Resolvida" && p.Status != "Cancelada");
        var pendenciasResolvidas = await _context.Pendencias.CountAsync(p => p.Status == "Resolvida");
        var pendenciasAtrasadas = await _context.Pendencias.CountAsync(p => p.Status != "Resolvida" && p.Status != "Cancelada" && p.PrazoLimite < agora);

        // 4. Pendências Urgentes (Top 5 próximas a vencer ou atrasadas)
        var urgentes = await _context.Pendencias
            .Include(p => p.Maquina)
            .Where(p => p.Status != "Resolvida" && p.Status != "Cancelada")
            .OrderBy(p => p.PrazoLimite)
            .Take(5)
            .Select(p => new
            {
                p.Id,
                p.CodigoPendencia,
                p.Titulo,
                Patrimonio = p.Maquina != null ? p.Maquina.NumeroPatrimonio : "Geral",
                p.Responsavel,
                p.PrazoLimite,
                p.Status,
                EstaAtrasada = p.PrazoLimite < agora
            })
            .ToListAsync();

        // 5. Distribuição por Setor
        var porSetor = await _context.Maquinas
            .GroupBy(m => string.IsNullOrWhiteSpace(m.Setor) ? "Geral" : m.Setor)
            .Select(g => new
            {
                Setor = g.Key,
                Quantidade = g.Count()
            })
            .OrderByDescending(x => x.Quantidade)
            .ToListAsync();

        return Ok(new
        {
            kpis = new
            {
                totalMaquinas,
                maquinasAtivas,
                maquinasManutencao,
                maquinasDisponiveis,
                totalVistorias,
                vistoriasAprovadas,
                vistoriasReprovadas,
                taxaAprovacao = Math.Round(taxaAprovacao, 1),
                totalPendencias,
                pendenciasAbertas,
                pendenciasResolvidas,
                pendenciasAtrasadas
            },
            pendenciasUrgentes = urgentes,
            distribuicaoSetores = porSetor
        });
    }
}
