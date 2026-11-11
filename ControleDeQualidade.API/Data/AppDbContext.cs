using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Maquina> Maquinas => Set<Maquina>();
    public DbSet<Vistoria> Vistorias => Set<Vistoria>();
    public DbSet<Pendencia> Pendencias => Set<Pendencia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Usuario configuration
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Senha).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Cargo).HasMaxLength(100);
        });

        // Maquina configuration
        modelBuilder.Entity<Maquina>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroPatrimonio).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.NumeroPatrimonio).IsUnique();
            entity.Property(e => e.NomeModelo).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Responsavel).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Setor).HasMaxLength(100);
            entity.Property(e => e.Categoria).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        // Vistoria configuration
        modelBuilder.Entity<Vistoria>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodigoVistoria).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ResponsavelVistoria).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(e => e.Maquina)
                .WithMany(m => m.Vistorias)
                .HasForeignKey(e => e.MaquinaId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Pendencia configuration
        modelBuilder.Entity<Pendencia>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodigoPendencia).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Responsavel).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Setor).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(e => e.Maquina)
                .WithMany(m => m.Pendencias)
                .HasForeignKey(e => e.MaquinaId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
