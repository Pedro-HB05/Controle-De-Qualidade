using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
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
                    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
{
    connectionString = "postgresql://" + connectionString.Substring("postgres://".Length);
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseNpgsql(connectionString)
               .UseSnakeCaseNamingConvention();
    }
    else
    {
        options.UseInMemoryDatabase("ControleQualidadeDb");
    }
});

// Serialização de Enums como texto e controle de ciclos de referência
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Configuração de CORS
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
        Title = "ControlDesk API",
        Version = "v1",
        Description = "API REST do ControlDesk para gerenciamento de patrimônio, vistorias e controle de prazos.\n\n" +
                      "Módulos:\n" +
                      "- Autenticação e Usuários\n" +
                      "- Controle de Máquinas e Patrimônio\n" +
                      "- Controle de Checagens e Vistorias\n" +
                      "- Controle de Prazos e Pendências\n" +
                      "- Painel de Indicadores e KPIs"
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Habilita o Swagger em qualquer ambiente (Development, Production, etc.)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ControlDesk API v1");
    c.RoutePrefix = "swagger"; // Disponibiliza no padrão /swagger
});

// Redireciona a raiz "/" para "/swagger" para que funcione em ambos os endereços
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Garante criação das tabelas e dados iniciais
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (db.Database.IsRelational())
        {
            if (File.Exists("../reset_database.sql"))
            {
                var sql = File.ReadAllText("../reset_database.sql");
                db.Database.ExecuteSqlRaw(sql);
                File.Delete("../reset_database.sql");
                Console.WriteLine("BANCO RESETADO COM SUCESSO!");
            }
            else
            {
                const string createTablesSql = @"
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(150) NOT NULL UNIQUE,
                    senha VARCHAR(100) NOT NULL,
                    cargo VARCHAR(100) DEFAULT 'Colaborador',
                    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

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
