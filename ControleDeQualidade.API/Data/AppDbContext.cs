using Microsoft.EntityFrameworkCore;
using ControleDeQualidade.API.Models.Entities;

namespace ControleDeQualidade.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Lote> Lotes => Set<Lote>();
    public DbSet<TipoDefeito> TiposDefeitos => Set<TipoDefeito>();
    public DbSet<Inspecao> Inspecoes => Set<Inspecao>();
    public DbSet<DefeitoIdentificado> DefeitosIdentificados => Set<DefeitoIdentificado>();
    public DbSet<NaoConformidade> NaoConformidades => Set<NaoConformidade>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Produto configuration
        modelBuilder.Entity<Produto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Codigo).IsUnique();
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Categoria).HasMaxLength(100);
            entity.Property(e => e.UnidadeMedida).HasMaxLength(20);
        });

        // Lote configuration
        modelBuilder.Entity<Lote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroLote).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.NumeroLote).IsUnique();
            entity.Property(e => e.LinhaProducao).HasMaxLength(100);

            entity.HasOne(e => e.Produto)
                .WithMany(p => p.Lotes)
                .HasForeignKey(e => e.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TipoDefeito configuration
        modelBuilder.Entity<TipoDefeito>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Codigo).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Codigo).IsUnique();
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(150);
        });

        // Inspecao configuration
        modelBuilder.Entity<Inspecao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodigoInspecao).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.CodigoInspecao).IsUnique();
            entity.Property(e => e.Inspetor).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Lote)
                .WithMany(l => l.Inspecoes)
                .HasForeignKey(e => e.LoteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.DefeitosIdentificados)
                .WithOne(d => d.Inspecao)
                .HasForeignKey(d => d.InspecaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // DefeitoIdentificado configuration
        modelBuilder.Entity<DefeitoIdentificado>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.TipoDefeito)
                .WithMany(t => t.DefeitosIdentificados)
                .HasForeignKey(e => e.TipoDefeitoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // NaoConformidade configuration
        modelBuilder.Entity<NaoConformidade>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroRnc).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.NumeroRnc).IsUnique();
            entity.Property(e => e.Titulo).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Origem).HasMaxLength(100);
            entity.Property(e => e.ResponsavelTratativa).HasMaxLength(100);

            entity.HasOne(e => e.Inspecao)
                .WithMany(i => i.NaoConformidades)
                .HasForeignKey(e => e.InspecaoId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Lote)
                .WithMany(l => l.NaoConformidades)
                .HasForeignKey(e => e.LoteId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
