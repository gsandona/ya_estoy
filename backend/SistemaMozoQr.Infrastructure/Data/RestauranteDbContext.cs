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
    public DbSet<Usuario> Usuarios { get; set; }

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

        // Seeding de admin por defecto (PasswordHash es 'admin' pero en un entorno real debe ir hasheada, asumiendo hash simple o bypass por ahora, usaremos BCrypt)
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario 
            { 
                Id = Guid.NewGuid(), 
                NombreCompleto = "Administrador", 
                Email = "admin@r.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Rol = SistemaMozoQr.Domain.Enums.Rol.Admin 
            }
        );
    }
}
