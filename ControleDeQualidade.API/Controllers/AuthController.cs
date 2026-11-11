using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    public record LoginDto(string Email, string Senha);
    public record RegisterDto(string Nome, string Email, string Senha, string? Cargo);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return BadRequest(new { mensagem = "E-mail e senha são obrigatórios." });

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower() && u.Senha == dto.Senha);

        if (usuario == null)
            return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });

        return Ok(new
        {
            token = Guid.NewGuid().ToString(),
            usuario = new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Cargo
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return BadRequest(new { mensagem = "Nome, e-mail e senha são obrigatórios." });

        var emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());
        if (emailExiste)
            return BadRequest(new { mensagem = "Este e-mail já está cadastrado no sistema." });

        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Senha = dto.Senha,
            Cargo = string.IsNullOrWhiteSpace(dto.Cargo) ? "Colaborador" : dto.Cargo.Trim(),
            DataCadastro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = Guid.NewGuid().ToString(),
            usuario = new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Cargo
            }
        });
    }

    [HttpGet("usuarios")]
    public async Task<IActionResult> ObterUsuarios()
    {
        var usuarios = await _context.Usuarios
            .OrderBy(u => u.Nome)
            .Select(u => new { u.Id, u.Nome, u.Email, u.Cargo })
            .ToListAsync();

        return Ok(usuarios);
    }
}
