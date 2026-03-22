using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Infrastructure.Data;

public class RestauranteDbContext : DbContext
{
    public RestauranteDbContext(DbContextOptions<RestauranteDbContext> options) : base(options) { }

    public DbSet<Mesa> Mesas { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<PedidoItem> PedidoItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed initial data
        modelBuilder.Entity<Mesa>().HasData(
            new Mesa { Id = Guid.NewGuid(), Numero = 1, TokenQR = "MESA1_QR_TOKEN" },
            new Mesa { Id = Guid.NewGuid(), Numero = 2, TokenQR = "MESA2_QR_TOKEN" }
        );

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = Guid.NewGuid(), Categoria = "Bebidas", Nombre = "Agua M.", Precio = 1500, Activo = true },
            new MenuItem { Id = Guid.NewGuid(), Categoria = "Platos Principales", Nombre = "Milanesa con Papas", Precio = 8500, Activo = true }
        );
    }
}
