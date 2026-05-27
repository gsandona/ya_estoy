using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.Infrastructure.Data;

public class RestauranteDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public RestauranteDbContext(DbContextOptions<RestauranteDbContext> options, ICurrentUserService? currentUserService = null) : base(options) 
    { 
        _currentUserService = currentUserService;
    }

    public Guid? CurrentTenantId => _currentUserService?.GetRestauranteId();
    public bool IsSuperAdmin => _currentUserService?.IsSuperAdmin() ?? false;
    public bool BypassTenantFilter => IsSuperAdmin && CurrentTenantId == null;

    public DbSet<Restaurante> Restaurantes { get; set; }

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

        // Global Query Filters para Multi-Tenant
        modelBuilder.Entity<Usuario>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<Mesa>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<MenuItem>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<Pedido>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<MesaTask>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<AuditoriaLog>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
        modelBuilder.Entity<ErrorLog>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);

        // Self-referencing relationship for Sucursales
        modelBuilder.Entity<Restaurante>()
            .HasOne<Restaurante>()
            .WithMany()
            .HasForeignKey(r => r.ParentRestauranteId)
            .OnDelete(DeleteBehavior.Restrict);

        // SystemSettings primary key
        modelBuilder.Entity<SystemSetting>().HasKey(s => s.Key);
        
        // Seed SystemSettings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Key = "CleanupJobIntervalHours", Value = "24" }
        );
        
        // --- SEED DATA MULTI-TENANT ---
        modelBuilder.SeedData();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = new List<AuditoriaLog>();
        var userEmail = _currentUserService?.GetUserEmail() ?? "Sistema";

        foreach (var entry in ChangeTracker.Entries())
        {
            // Inyectar TenantId automáticamente a las entidades nuevas (IMustHaveTenant)
            if (entry.State == EntityState.Added && entry.Entity is IMustHaveTenant tenantEntity)
            {
                if (tenantEntity.RestauranteId == Guid.Empty && CurrentTenantId.HasValue)
                {
                    tenantEntity.RestauranteId = CurrentTenantId.Value;
                }
            }

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
