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
    public DbSet<MesaTask> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed initial data con valores deterministas
        modelBuilder.Entity<Mesa>().HasData(
            new Mesa { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Numero = 1, TokenQR = "MESA1_QR_TOKEN" },
            new Mesa { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Numero = 2, TokenQR = "MESA2_QR_TOKEN" }
        );

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Categoria = "Bebidas", Nombre = "Agua M.", Precio = 1500, Activo = true },
            new MenuItem { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Categoria = "Platos Principales", Nombre = "Milanesa con Papas", Precio = 8500, Activo = true }
        );

        // Seeding de admin por defecto con hash estático generado pre-calculado para "admin123"
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario 
            { 
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), 
                NombreCompleto = "Administrador", 
                Email = "admin@r.com", 
                PasswordHash = "$2a$11$eGPDhy51VNdhBOm9/5zoBeTPuPW9QSYI7UIloW4dm1iyq.NYrK7eO",
                Rol = SistemaMozoQr.Domain.Enums.Rol.Admin 
            }
        );
    }
}
