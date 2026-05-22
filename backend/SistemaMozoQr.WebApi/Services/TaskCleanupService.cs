using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.WebApi.Services;

public class TaskCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TaskCleanupService> _logger;

    public TaskCleanupService(IServiceProvider serviceProvider, ILogger<TaskCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Task Cleanup Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                int delayHours = 24;

                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<RestauranteDbContext>();

                    // Retrieve configured interval
                    var setting = await dbContext.SystemSettings.FindAsync("CleanupJobIntervalHours");
                    if (setting != null && int.TryParse(setting.Value, out int hours) && hours > 0)
                    {
                        delayHours = hours;
                    }

                    // Perform cleanup
                    var oldTasks = await dbContext.Tasks
                        .Where(t => t.Status == "Completed" || t.Status == "Cancelled" || t.CreatedAt < DateTime.UtcNow.AddHours(-delayHours))
                        .ToListAsync(stoppingToken);

                    if (oldTasks.Any())
                    {
                        dbContext.Tasks.RemoveRange(oldTasks);
                        await dbContext.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation($"Cleaned up {oldTasks.Count} old or completed tasks from the database.");
                    }
                }

                _logger.LogInformation($"Task Cleanup Service will run again in {delayHours} hours.");
                await Task.Delay(TimeSpan.FromHours(delayHours), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing Task Cleanup.");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // Retry after 1 hour if error
            }
        }
    }
}
