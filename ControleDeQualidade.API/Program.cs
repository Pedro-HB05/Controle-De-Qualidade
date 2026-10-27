using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ControleDeQualidade.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Configuração do contexto em memória
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("ControleQualidadeDb"));

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
        Title = "API - Sistema de Controle de Qualidade",
        Version = "v1",
        Description = "API REST para gerenciamento de processos de qualidade produtivos.\n\n" +
                      "Módulos:\n" +
                      "- Produtos e Lotes de Fabricação\n" +
                      "- Inspeções de Qualidade Estruturadas\n" +
                      "- Identificação e Catálogo de Defeitos\n" +
                      "- Gerenciamento de Não Conformidades (RNC)\n" +
                      "- Indicadores de Desempenho (KPIs, Pareto 80/20, Defeitos por Categoria)\n" +
                      "- Relatórios Gerenciais"
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
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Controle de Qualidade API v1");
    c.RoutePrefix = "swagger"; // Disponibiliza no padrão /swagger
});

// Redireciona a raiz "/" para "/swagger" para que funcione em ambos os endereços
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
