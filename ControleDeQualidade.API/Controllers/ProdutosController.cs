using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.DTOs;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todos os produtos cadastrados
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProdutoRespostaDto>>> ObterTodos([FromQuery] string? termoBusca, [FromQuery] bool? apenasAtivos)
    {
        var query = _context.Produtos.Include(p => p.Lotes).AsNoTracking().AsQueryable();

        if (apenasAtivos.HasValue && apenasAtivos.Value)
        {
            query = query.Where(p => p.Ativo);
        }

        if (!string.IsNullOrWhiteSpace(termoBusca))
        {
            var termo = termoBusca.Trim().ToLower();
            query = query.Where(p => p.Nome.ToLower().Contains(termo) || 
                                     p.Codigo.ToLower().Contains(termo) || 
                                     p.Categoria.ToLower().Contains(termo));
        }

        var produtos = await query
            .OrderBy(p => p.Nome)
            .Select(p => new ProdutoRespostaDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nome = p.Nome,
                Descricao = p.Descricao,
                Categoria = p.Categoria,
                UnidadeMedida = p.UnidadeMedida,
                Ativo = p.Ativo,
                DataCadastro = p.DataCadastro,
                TotalLotesCadastrados = p.Lotes.Count
            })
            .ToListAsync();

        return Ok(produtos);
    }

    /// <summary>
    /// Obtém um produto pelo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProdutoRespostaDto>> ObterPorId(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Lotes)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });
        }

        return Ok(new ProdutoRespostaDto
        {
            Id = produto.Id,
            Codigo = produto.Codigo,
            Nome = produto.Nome,
            Descricao = produto.Descricao,
            Categoria = produto.Categoria,
            UnidadeMedida = produto.UnidadeMedida,
            Ativo = produto.Ativo,
            DataCadastro = produto.DataCadastro,
            TotalLotesCadastrados = produto.Lotes.Count
        });
    }

    /// <summary>
    /// Cadastra um novo produto no catálogo
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProdutoRespostaDto>> Criar([FromBody] ProdutoCriacaoDto dto)
    {
        if (await _context.Produtos.AnyAsync(p => p.Codigo.ToLower() == dto.Codigo.Trim().ToLower()))
        {
            return BadRequest(new { mensagem = $"Já existe um produto com o código '{dto.Codigo}'." });
        }

        var produto = new Produto
        {
            Codigo = dto.Codigo.Trim().ToUpper(),
            Nome = dto.Nome.Trim(),
            Descricao = dto.Descricao.Trim(),
            Categoria = dto.Categoria.Trim(),
            UnidadeMedida = string.IsNullOrWhiteSpace(dto.UnidadeMedida) ? "UN" : dto.UnidadeMedida.Trim().ToUpper(),
            Ativo = true,
            DataCadastro = DateTime.UtcNow
        };

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        var resposta = new ProdutoRespostaDto
        {
            Id = produto.Id,
            Codigo = produto.Codigo,
            Nome = produto.Nome,
            Descricao = produto.Descricao,
            Categoria = produto.Categoria,
            UnidadeMedida = produto.UnidadeMedida,
            Ativo = produto.Ativo,
            DataCadastro = produto.DataCadastro,
            TotalLotesCadastrados = 0
        };

        return CreatedAtAction(nameof(ObterPorId), new { id = produto.Id }, resposta);
    }

    /// <summary>
    /// Atualiza dados de um produto
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ProdutoAtualizacaoDto dto)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });
        }

        produto.Nome = dto.Nome.Trim();
        produto.Descricao = dto.Descricao.Trim();
        produto.Categoria = dto.Categoria.Trim();
        produto.UnidadeMedida = dto.UnidadeMedida.Trim().ToUpper();
        produto.Ativo = dto.Ativo;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Remove um produto (se não houver lotes vinculados)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var produto = await _context.Produtos.Include(p => p.Lotes).FirstOrDefaultAsync(p => p.Id == id);
        if (produto == null)
        {
            return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });
        }

        if (produto.Lotes.Any())
        {
            return BadRequest(new { mensagem = "Não é possível excluir o produto pois existem lotes de produção vinculados a ele. Considere inativá-lo." });
        }

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
