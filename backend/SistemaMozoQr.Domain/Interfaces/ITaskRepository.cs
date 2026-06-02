using SistemaMozoQr.Domain.Entities;

namespace SistemaMozoQr.Domain.Interfaces;

public interface ITaskRepository
{
    Task<IEnumerable<MesaTask>> GetPendingTasksAsync();
    Task<IEnumerable<MesaTask>> GetPendingTasksIgnoreQueryFiltersAsync();
    Task<MesaTask?> GetByIdAsync(Guid id);
    Task AddAsync(MesaTask task);
    Task UpdateAsync(MesaTask task);
}
