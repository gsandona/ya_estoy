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

            // Excluir entidades de control e items individuales de pedido (evita sobrecargar el log)
            if (entry.Entity is AuditoriaLog || entry.Entity is ErrorLog || entry.Entity is MesaTask || entry.Entity is SystemSetting || entry.Entity is PedidoItem)
                continue;

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                string detalles = $"Cambio de estado de entidad a {entry.State}";

                if (entry.Entity is Restaurante rest)
                {
                    detalles = entry.State == EntityState.Added ? $"Se creó el restaurante '{rest.Nombre}'"
                             : entry.State == EntityState.Deleted ? $"Se eliminó el restaurante '{rest.Nombre}'"
                             : $"Se modificaron datos del restaurante '{rest.Nombre}'";
                }
                else if (entry.Entity is Usuario user)
                {
                    detalles = entry.State == EntityState.Added ? $"Se creó el usuario '{user.Email}' (Rol: {user.Rol})"
                             : entry.State == EntityState.Deleted ? $"Se eliminó el usuario '{user.Email}'"
                             : $"Se actualizaron datos del usuario '{user.Email}'";
                }
                else if (entry.Entity is Mesa mesa)
                {
                    detalles = entry.State == EntityState.Added ? $"Se creó la Mesa {mesa.Numero} ({mesa.Ubicacion})"
                             : entry.State == EntityState.Deleted ? $"Se eliminó la Mesa {mesa.Numero}"
                             : $"Se actualizó la Mesa {mesa.Numero} (Estado: {mesa.Estado}, PIN: {mesa.CodigoAcceso ?? "N/A"})";
                }
                else if (entry.Entity is MenuItem item)
                {
                    detalles = entry.State == EntityState.Added ? $"Se agregó el item de menú '{item.Nombre}' (${item.Precio})"
                             : entry.State == EntityState.Deleted ? $"Se eliminó el item de menú '{item.Nombre}'"
                             : $"Se modificó el item de menú '{item.Nombre}' (${item.Precio})";
                }
                else if (entry.Entity is Pedido pedido)
                {
                    var mesaEntity = entry.Context.Set<Mesa>().Local.FirstOrDefault(m => m.Id == pedido.MesaId);
                    int? tableNum = mesaEntity?.Numero;
                    detalles = entry.State == EntityState.Added 
                        ? $"Nuevo pedido ingresado para la Mesa {(tableNum.HasValue ? tableNum.Value.ToString() : "ID: " + pedido.MesaId)}"
                        : entry.State == EntityState.Deleted ? $"Se eliminó/canceló el pedido"
                        : $"Pedido actualizado (Estado: {pedido.Estado})";
                }

                var auditLog = new AuditoriaLog
                {
                    UsuarioEmail = userEmail,
                    Entidad = entry.Entity.GetType().Name,
                    Accion = entry.State.ToString(),
                    FechaHora = DateTime.UtcNow,
                    Detalles = detalles,
                    RestauranteId = entry.Entity is IMustHaveTenant t ? t.RestauranteId 
                                    : (entry.Entity is Restaurante r ? r.Id 
                                    : (CurrentTenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111")))
                };

                var idProperty = entry.Entity.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    var idVal = idProperty.GetValue(entry.Entity);
                    if (idVal != null) auditLog.EntidadId = idVal.ToString() ?? string.Empty;
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
