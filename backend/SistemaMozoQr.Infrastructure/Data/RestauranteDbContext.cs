using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Application.Interfaces;
using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Infrastructure.Data;

public class RestauranteDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public RestauranteDbContext(DbContextOptions<RestauranteDbContext> options, ICurrentUserService? currentUserService = null) : base(options) 
    { 
        _currentUserService = currentUserService;
    }

    public DbSet<Mesa> Mesas { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<PedidoItem> PedidoItems { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<MesaTask> Tasks { get; set; }
    public DbSet<SystemSetting> SystemSettings { get; set; }
    public DbSet<AuditoriaLog> Auditorias { get; set; }
    public DbSet<ErrorLog> ErrorLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // SystemSettings primary key
        modelBuilder.Entity<SystemSetting>().HasKey(s => s.Key);
        
        // Seed SystemSettings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "CleanupJobIntervalHours", Value = "24" }
        );
        
        // Seed initial data con valores deterministas
        modelBuilder.Entity<Mesa>().HasData(
            new Mesa { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Numero = 1, TokenQR = "MESA1_QR_TOKEN" },
            new Mesa { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Numero = 2, TokenQR = "MESA2_QR_TOKEN" }
        );

        modelBuilder.Entity<MenuItem>().HasData(
            new MenuItem { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Categoria = "Bebidas", Nombre = "Agua M.", Precio = 1500, Activo = true },
            new MenuItem { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Categoria = "Platos Principales", Nombre = "Milanesa con Papas", Precio = 8500, Activo = true }
        );

        // Seeding de admin por defecto
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario 
            { 
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), 
                NombreCompleto = "Administrador", 
                Email = "admin", 
                PasswordHash = "$2a$11$A9snZ9y7jC9Z6s8013gbAuj8k7rpdEhUM0GCmHrXao6vxqnhNC8ta", // admin123
                Rol = SistemaMozoQr.Domain.Enums.Rol.Admin 
            },
            new Usuario
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                NombreCompleto = "Gino Sandona",
                Email = "ginoSandona",
                PasswordHash = "$2a$11$OMRvNspLxRgV7BaauISU3.CubR7dtc.pjYcNCabaBpiPjQ.Z.C80C",
                Rol = SistemaMozoQr.Domain.Enums.Rol.SuperAdmin
            }
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = new List<AuditoriaLog>();
        var userEmail = _currentUserService?.GetUserEmail() ?? "Sistema";

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditoriaLog || entry.Entity is ErrorLog || entry.Entity is MesaTask || entry.Entity is SystemSetting)
                continue;

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var auditLog = new AuditoriaLog
                {
                    UsuarioEmail = userEmail,
                    Entidad = entry.Entity.GetType().Name,
                    Accion = entry.State.ToString(),
                    FechaHora = DateTime.UtcNow,
                    Detalles = $"Entity state changed to {entry.State}"
                };

                var idProperty = entry.Entity.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    var idVal = idProperty.GetValue(entry.Entity);
                    if (idVal != null) auditLog.EntidadId = idVal.ToString();
                }

                auditEntries.Add(auditLog);
            }
        }

        if (auditEntries.Any())
        {
            Auditorias.AddRange(auditEntries);
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
