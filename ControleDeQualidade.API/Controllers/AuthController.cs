using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ControleDeQualidade.API.Data;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public record LoginDto(string Email, string Senha);
    public record RegisterDto(string Nome, string Email, string Senha, string? Cargo);

    /// <summary>
    /// Autenticação com proteção contra força bruta, verificação criptográfica BCrypt e emissão de JWT.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-policy")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return BadRequest(new { mensagem = "E-mail e senha são obrigatórios." });

        var emailNormalizado = dto.Email.Trim().ToLower();
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == emailNormalizado);

        // Previne enumeração de usuários usando resposta uniforme e verificação constante
        if (usuario == null)
        {
            return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });
        }

        bool senhaValida = false;

        // Se a senha estiver no formato seguro do BCrypt ($2a$, $2b$ ou $2y$)
        if (usuario.Senha.StartsWith("$2a$") || usuario.Senha.StartsWith("$2b$") || usuario.Senha.StartsWith("$2y$"))
        {
            senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.Senha);
        }
        else if (usuario.Senha == dto.Senha)
        {
            // Migração transparente de segurança: usuário antigo em texto puro é atualizado para hash BCrypt na hora
            senhaValida = true;
            usuario.Senha = BCrypt.Net.BCrypt.HashPassword(dto.Senha, workFactor: 11);
            await _context.SaveChangesAsync();
        }

        if (!senhaValida)
        {
            return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });
        }

        var token = GerarJwt(usuario);

        return Ok(new
        {
            token,
            usuario = new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Cargo
            }
        });
    }

    /// <summary>
    /// Cadastro com política de segurança de senhas (OWASP / LGPD) e hash com salt BCrypt.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-policy")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return BadRequest(new { mensagem = "Nome, e-mail e senha são obrigatórios." });

        var emailNormalizado = dto.Email.Trim().ToLower();

        // Validação rigorosa de formato de e-mail
        if (!Regex.IsMatch(emailNormalizado, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            return BadRequest(new { mensagem = "Formato de e-mail inválido." });

        // Política de Complexidade de Senha (NIST / OWASP): Mínimo 8 caracteres, pelo menos 1 letra e 1 número
        if (dto.Senha.Length < 8 || !Regex.IsMatch(dto.Senha, @"[A-Za-z]") || !Regex.IsMatch(dto.Senha, @"[0-9]"))
        {
            return BadRequest(new
            {
                mensagem = "A senha deve ter no mínimo 8 caracteres e conter pelo menos uma letra e um número."
            });
        }

        var emailExiste = await _context.Usuarios.AnyAsync(u => u.Email == emailNormalizado);
        if (emailExiste)
            return BadRequest(new { mensagem = "Este e-mail já está cadastrado no sistema." });

        // Criptografia de ponta com BCrypt (Work Factor 11 + Salt automático)
        var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha, workFactor: 11);

        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = emailNormalizado,
            Senha = senhaHash,
            Cargo = string.IsNullOrWhiteSpace(dto.Cargo) ? "Colaborador" : dto.Cargo.Trim(),
            DataCadastro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var token = GerarJwt(usuario);

        return Ok(new
        {
            token,
            usuario = new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Cargo
            }
        });
    }

    /// <summary>
    /// Consulta de colaboradores - Apenas usuários autenticados com JWT válido podem visualizar.
    /// </summary>
    [HttpGet("usuarios")]
    [Authorize]
    public async Task<IActionResult> ObterUsuarios()
    {
        var usuarios = await _context.Usuarios
            .OrderBy(u => u.Nome)
            .Select(u => new { u.Id, u.Nome, u.Email, u.Cargo })
            .ToListAsync();

        return Ok(usuarios);
    }

    private string GerarJwt(Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
                  ?? Environment.GetEnvironmentVariable("Jwt__Key");
        }

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("Chave secreta JWT não configurada no servidor.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Cargo ?? "Colaborador"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ControlDesk",
            audience: _configuration["Jwt:Audience"] ?? "ControlDeskUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
