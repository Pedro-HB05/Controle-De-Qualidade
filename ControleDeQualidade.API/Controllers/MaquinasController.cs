using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[Authorize]
[ApiController]
[Route("api/maquinas")]
public class MaquinasController : ControllerBase
{
    private readonly AppDbContext _context;

    public MaquinasController(AppDbContext context)
    {
        _context = context;
    }

    public record MaquinaInputDto(
        string NumeroPatrimonio,
        string NomeModelo,
        string Categoria,
        string Responsavel,
        string Setor,
        string Status,
        DateTime? DataAquisicao,
        DateTime? DataUltimaRevisao,
        DateTime? ProximaRevisao,
        string? Observacoes
    );

    [HttpGet]
    public async Task<IActionResult> ObterTodas([FromQuery] string? busca, [FromQuery] string? setor, [FromQuery] string? status)
    {
        var query = _context.Maquinas.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var b = busca.Trim().ToLower();
            query = query.Where(m => m.NumeroPatrimonio.ToLower().Contains(b) ||
                                     m.NomeModelo.ToLower().Contains(b) ||
                                     m.Responsavel.ToLower().Contains(b));
        }

        if (!string.IsNullOrWhiteSpace(setor) && setor != "todos")
        {
            query = query.Where(m => m.Setor == setor);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "todos")
        {
            query = query.Where(m => m.Status == status);
        }

        var lista = await query
            .OrderByDescending(m => m.Id)
            .Select(m => new
            {
                m.Id,
                m.NumeroPatrimonio,
                m.NomeModelo,
                m.Categoria,
                m.Responsavel,
                m.Setor,
                m.Status,
                m.DataAquisicao,
                m.DataUltimaRevisao,
                m.ProximaRevisao,
                m.Observacoes,
                m.DataCadastro,
                TotalVistorias = m.Vistorias.Count,
                TotalPendenciasAbertas = m.Pendencias.Count(p => p.Status != "Resolvida" && p.Status != "Cancelada")
            })
            .ToListAsync();

        return Ok(lista);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var m = await _context.Maquinas
            .Include(m => m.Vistorias)
            .Include(m => m.Pendencias)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return NotFound(new { mensagem = "Máquina ou equipamento não encontrado." });

        return Ok(m);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] MaquinaInputDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NumeroPatrimonio) || string.IsNullOrWhiteSpace(dto.NomeModelo))
            return BadRequest(new { mensagem = "Número de patrimônio e modelo são obrigatórios." });

        var existe = await _context.Maquinas.AnyAsync(m => m.NumeroPatrimonio.ToLower() == dto.NumeroPatrimonio.Trim().ToLower());
        if (existe)
            return BadRequest(new { mensagem = $"Já existe um equipamento cadastrado com o patrimônio {dto.NumeroPatrimonio}." });

        var maquina = new Maquina
        {
            NumeroPatrimonio = dto.NumeroPatrimonio.Trim().ToUpper(),
            NomeModelo = dto.NomeModelo.Trim(),
            Categoria = string.IsNullOrWhiteSpace(dto.Categoria) ? "Equipamento" : dto.Categoria.Trim(),
            Responsavel = string.IsNullOrWhiteSpace(dto.Responsavel) ? "Não atribuído" : dto.Responsavel.Trim(),
            Setor = string.IsNullOrWhiteSpace(dto.Setor) ? "Geral" : dto.Setor.Trim(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Ativo" : dto.Status.Trim(),
            DataAquisicao = dto.DataAquisicao?.ToUniversalTime(),
            DataUltimaRevisao = dto.DataUltimaRevisao?.ToUniversalTime(),
            ProximaRevisao = dto.ProximaRevisao?.ToUniversalTime(),
            Observacoes = dto.Observacoes ?? string.Empty,
            DataCadastro = DateTime.UtcNow
        };

        _context.Maquinas.Add(maquina);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = maquina.Id }, maquina);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] MaquinaInputDto dto)
    {
        var maquina = await _context.Maquinas.FindAsync(id);
        if (maquina == null) return NotFound(new { mensagem = "Máquina não encontrada." });

        maquina.NomeModelo = dto.NomeModelo.Trim();
        maquina.Categoria = dto.Categoria.Trim();
        maquina.Responsavel = dto.Responsavel.Trim();
        maquina.Setor = dto.Setor.Trim();
        maquina.Status = dto.Status.Trim();
        maquina.DataAquisicao = dto.DataAquisicao?.ToUniversalTime();
        maquina.DataUltimaRevisao = dto.DataUltimaRevisao?.ToUniversalTime();
        maquina.ProximaRevisao = dto.ProximaRevisao?.ToUniversalTime();
        maquina.Observacoes = dto.Observacoes ?? string.Empty;

        await _context.SaveChangesAsync();
        return Ok(maquina);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var maquina = await _context.Maquinas.FindAsync(id);
        if (maquina == null) return NotFound(new { mensagem = "Máquina não encontrada." });

        _context.Maquinas.Remove(maquina);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
