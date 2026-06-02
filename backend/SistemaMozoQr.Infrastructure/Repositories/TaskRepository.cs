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
}
