using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Entities;
using ControleDeQualidade.API.Models.Enums;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/tipos-defeitos")]
public class TiposDefeitosController : ControllerBase
{
    private readonly AppDbContext _context;

    public TiposDefeitosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista os tipos de defeitos cadastrados no catálogo com filtros
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TipoDefeitoRespostaDto>>> ObterTodos(
        [FromQuery] CategoriaDefeito? categoria,
        [FromQuery] GravidadeDefeito? gravidade,
        [FromQuery] bool? apenasAtivos,
        [FromQuery] string? termoBusca)
    {
        var query = _context.TiposDefeitos
            .Include(t => t.DefeitosIdentificados)
            .AsNoTracking()
            .AsQueryable();

        if (apenasAtivos.HasValue && apenasAtivos.Value)
        {
            query = query.Where(t => t.Ativo);
        }

        if (categoria.HasValue)
        {
            query = query.Where(t => t.Categoria == categoria.Value);
        }

        if (gravidade.HasValue)
        {
            query = query.Where(t => t.Gravidade == gravidade.Value);
        }

        if (!string.IsNullOrWhiteSpace(termoBusca))
        {
            var termo = termoBusca.Trim().ToLower();
            query = query.Where(t => t.Nome.ToLower().Contains(termo) ||
                                     t.Codigo.ToLower().Contains(termo) ||
                                     t.Descricao.ToLower().Contains(termo));
        }

        var defeitos = await query
            .OrderBy(t => t.Categoria)
            .ThenBy(t => t.Nome)
            .Select(t => new TipoDefeitoRespostaDto
            {
                Id = t.Id,
                Codigo = t.Codigo,
                Nome = t.Nome,
                Descricao = t.Descricao,
                Categoria = t.Categoria,
                Gravidade = t.Gravidade,
                Ativo = t.Ativo,
                TotalOcorrenciasRegistradas = t.DefeitosIdentificados.Sum(d => d.Quantidade)
            })
            .ToListAsync();

        return Ok(defeitos);
    }

    /// <summary>
    /// Obtém detalhes de um tipo de defeito por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TipoDefeitoRespostaDto>> ObterPorId(int id)
    {
        var tipo = await _context.TiposDefeitos
            .Include(t => t.DefeitosIdentificados)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tipo == null)
        {
            return NotFound(new { mensagem = $"Tipo de defeito com ID {id} não encontrado." });
        }

        return Ok(new TipoDefeitoRespostaDto
        {
            Id = tipo.Id,
            Codigo = tipo.Codigo,
            Nome = tipo.Nome,
            Descricao = tipo.Descricao,
            Categoria = tipo.Categoria,
            Gravidade = tipo.Gravidade,
            Ativo = tipo.Ativo,
            TotalOcorrenciasRegistradas = tipo.DefeitosIdentificados.Sum(d => d.Quantidade)
        });
    }

    /// <summary>
    /// Cadastra um novo tipo de defeito no catálogo da qualidade
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TipoDefeitoRespostaDto>> Criar([FromBody] TipoDefeitoCriacaoDto dto)
    {
        if (await _context.TiposDefeitos.AnyAsync(t => t.Codigo.ToLower() == dto.Codigo.Trim().ToLower()))
        {
            return BadRequest(new { mensagem = $"Já existe um tipo de defeito com o código '{dto.Codigo}'." });
        }

        var tipo = new TipoDefeito
        {
            Codigo = dto.Codigo.Trim().ToUpper(),
            Nome = dto.Nome.Trim(),
            Descricao = dto.Descricao.Trim(),
            Categoria = dto.Categoria,
            Gravidade = dto.Gravidade,
            Ativo = true
        };

        _context.TiposDefeitos.Add(tipo);
        await _context.SaveChangesAsync();

        var resposta = new TipoDefeitoRespostaDto
        {
            Id = tipo.Id,
            Codigo = tipo.Codigo,
            Nome = tipo.Nome,
            Descricao = tipo.Descricao,
            Categoria = tipo.Categoria,
            Gravidade = tipo.Gravidade,
            Ativo = tipo.Ativo,
            TotalOcorrenciasRegistradas = 0
        };

        return CreatedAtAction(nameof(ObterPorId), new { id = tipo.Id }, resposta);
    }

    /// <summary>
    /// Atualiza dados de um tipo de defeito
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] TipoDefeitoAtualizacaoDto dto)
    {
        var tipo = await _context.TiposDefeitos.FindAsync(id);
        if (tipo == null)
        {
            return NotFound(new { mensagem = $"Tipo de defeito com ID {id} não encontrado." });
        }

        tipo.Nome = dto.Nome.Trim();
        tipo.Descricao = dto.Descricao.Trim();
        tipo.Categoria = dto.Categoria;
        tipo.Gravidade = dto.Gravidade;
        tipo.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Exclui um tipo de defeito (se não houver inspeções vinculadas)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var tipo = await _context.TiposDefeitos
            .Include(t => t.DefeitosIdentificados)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tipo == null)
        {
            return NotFound(new { mensagem = $"Tipo de defeito com ID {id} não encontrado." });
        }

        if (tipo.DefeitosIdentificados.Any())
        {
            return BadRequest(new { mensagem = "Não é possível excluir o defeito pois ele já foi apontado em inspeções registradas. Considere inativá-lo." });
        }

        _context.TiposDefeitos.Remove(tipo);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
