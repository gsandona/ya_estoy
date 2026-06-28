using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly RestauranteDbContext _context;

    public TaskRepository(RestauranteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MesaTask>> GetPendingTasksAsync()
    {
        return await _context.Tasks
            .Where(t => t.Status == "Pending")
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MesaTask>> GetPendingTasksIgnoreQueryFiltersAsync()
    {
        return await _context.Tasks
            .IgnoreQueryFilters()
            .Where(t => t.Status == "Pending")
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<MesaTask?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<MesaTask?> GetByIdIgnoreQueryFiltersAsync(Guid id)
    {
        return await _context.Tasks.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task AddAsync(MesaTask task)
    {
        await _context.Tasks.AddAsync(task);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(MesaTask task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
    }

    public async Task<object> GetAnalyticsStatsAsync()
    {
        // 1. Tareas Cerradas y Pendientes
        var tasks = await _context.Tasks.ToListAsync();
        var totalCerradas = tasks.Count(t => t.Status == "Completed");
        var totalPendientes = tasks.Count(t => t.Status == "Pending");

        // 2. Mesas más utilizadas (Top 5)
        var mesasMasUtilizadas = tasks
            .GroupBy(t => t.TableId)
            .Select(g => new { NumeroMesa = g.Key, TotalServicios = g.Count() })
            .OrderByDescending(x => x.TotalServicios)
            .Take(5)
            .ToList();

        // 3. Horarios de mayor frecuencia (Agrupado por hora 0-23)
        var horariosFrecuentes = tasks
            .GroupBy(t => t.CreatedAt.AddHours(-3).Hour) // Ajuste aproximado para hora local si es UTC
            .Select(g => new { Hora = g.Key, TotalServicios = g.Count() })
            .OrderBy(x => x.Hora)
            .ToList();

        // 4. Estadísticas de Mozos (Desempeño)
        var mozos = await _context.Usuarios
            .Where(u => u.Rol == SistemaMozoQr.Domain.Enums.Rol.Mozo)
            .ToListAsync();

        var mesas = await _context.Mesas.ToListAsync();

        var mozoPerformance = mozos.Select(m => {
            var mIdStr = m.Id.ToString();
            var tareasCompletadas = tasks.Count(t => t.AssignedMozoId == mIdStr && t.Status == "Completed");
            var mesasAsignadasActualmente = mesas.Count(mesa => mesa.MozoId == m.Id && mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Ocupada);
            return new {
                MozoEmail = m.Username,
                TareasCompletadas = tareasCompletadas,
                MesasAsignadasActualmente = mesasAsignadasActualmente
            };
        })
        .OrderByDescending(x => x.TareasCompletadas)
        .ToList();

        // 5. Ventas y pedidos
        var pedidos = await _context.Pedidos.Include(p => p.Items).ToListAsync();
        var totalVentasFacturadas = pedidos.Sum(p => p.Items.Sum(item => item.Cantidad * item.PrecioUnitario));
        var totalPedidosCocina = pedidos.Count;

        return new
        {
            TotalTareasCerradas = totalCerradas,
            TotalTareasPendientes = totalPendientes,
            MesasMasUtilizadas = mesasMasUtilizadas,
            HorariosFrecuentes = horariosFrecuentes,
            MozoPerformance = mozoPerformance,
            TotalVentasFacturadas = totalVentasFacturadas,
            TotalPedidosCocina = totalPedidosCocina
        };
    }
}
