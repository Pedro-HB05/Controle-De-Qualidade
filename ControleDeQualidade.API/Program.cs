using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ControleDeQualidade.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Suporte para porta dinâmica do Render e ambientes em nuvem (PORT)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Configuração do Banco de Dados (PostgreSQL no Neon / Render com suporte a Snake Case)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
{
    connectionString = "postgresql://" + connectionString.Substring("postgres://".Length);
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase("ControleQualidadeDb"));
    }
    else
    {
        throw new InvalidOperationException(
            "ERRO CRÍTICO DE CONFIGURAÇÃO: A string de conexão com o banco de dados (variável DATABASE_URL ou ConnectionStrings__DefaultConnection) não foi configurada nas variáveis de ambiente do Render.");
    }
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString)
               .UseSnakeCaseNamingConvention());
}

// Autenticação Segura JWT (JSON Web Tokens)
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
          ?? Environment.GetEnvironmentVariable("Jwt__Key");
}

if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = "ControlDesk_Dev_Secret_Key_Enterprise_2026_Local_Only_9876543210!";
    }
    else
    {
        throw new InvalidOperationException(
            "ERRO CRÍTICO DE SEGURANÇA: A chave secreta JWT (variável JWT_KEY) não foi configurada nas variáveis de ambiente do Render. Configure uma chave com no mínimo 32 caracteres.");
    }
}
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ControlDesk",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ControlDeskUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Proteção contra Força Bruta (Rate Limiting para Login e Cadastro)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth-policy", opt =>
    {
        opt.PermitLimit = 5; // Limita a 5 tentativas
        opt.Window = TimeSpan.FromMinutes(1); // por minuto
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Serialização de Enums como texto e controle de ciclos de referência
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Configuração de CORS Seguro
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ControlDesk API - Help Desk & Gestão de TI",
        Version = "v1",
        Description = "API REST corporativa do ControlDesk com autenticação JWT e criptografia de senhas BCrypt."
    });

    // Suporte para testar autenticação Bearer JWT no Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT desta maneira: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Headers de Segurança HTTP (Proteção contra clickjacking, MIME sniffing e XSS)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// Habilita o Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ControlDesk API v1");
    c.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAll");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Garante criação e migração das tabelas no banco de dados
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (db.Database.IsRelational())
        {
            const string createTablesSql = @"
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                cargo VARCHAR(100) DEFAULT 'Colaborador',
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Garante que a coluna de senha comporte o hash seguro BCrypt
            ALTER TABLE usuarios ALTER COLUMN senha TYPE VARCHAR(255);

            CREATE TABLE IF NOT EXISTS maquinas (
                id SERIAL PRIMARY KEY,
                numero_patrimonio VARCHAR(50) NOT NULL UNIQUE,
                nome_modelo VARCHAR(150) NOT NULL,
                categoria VARCHAR(100) DEFAULT 'Equipamento',
                responsavel VARCHAR(100) NOT NULL,
                setor VARCHAR(100) DEFAULT 'Geral',
                status VARCHAR(50) NOT NULL DEFAULT 'Ativo',
                data_aquisicao TIMESTAMP WITH TIME ZONE,
                data_ultima_revisao TIMESTAMP WITH TIME ZONE,
                proxima_revisao TIMESTAMP WITH TIME ZONE,
                observacoes TEXT,
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS vistorias (
                id SERIAL PRIMARY KEY,
                codigo_vistoria VARCHAR(50) NOT NULL,
                maquina_id INTEGER NOT NULL REFERENCES maquinas(id) ON DELETE CASCADE,
                responsavel_vistoria VARCHAR(100) NOT NULL,
                data_vistoria TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) NOT NULL DEFAULT 'Aprovado',
                observacoes TEXT,
                pendencia_gerada_id INTEGER,
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS pendencias (
                id SERIAL PRIMARY KEY,
                codigo_pendencia VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                descricao TEXT,
                maquina_id INTEGER REFERENCES maquinas(id) ON DELETE SET NULL,
                setor VARCHAR(100) DEFAULT 'Geral',
                responsavel VARCHAR(100) NOT NULL,
                prazo_limite TIMESTAMP WITH TIME ZONE NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Aberta',
                data_resolucao TIMESTAMP WITH TIME ZONE,
                solucao_aplicada TEXT,
                data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );";

            db.Database.ExecuteSqlRaw(createTablesSql);
        }
        else
        {
            db.Database.EnsureCreated();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Aviso inicialização do banco: {ex.Message}");
    }
}

app.Run();
