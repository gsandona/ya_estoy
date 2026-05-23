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
                TimeSpan targetTime = new TimeSpan(4, 0, 0); // 04:00 AM por defecto

                TimeZoneInfo argTz;
                try { argTz = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires"); }
                catch { argTz = TimeZoneInfo.FindSystemTimeZoneById("Argentina Standard Time"); }

                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<RestauranteDbContext>();

                    // Retrieve configured interval
                    var setting = await dbContext.SystemSettings.FindAsync("CleanupJobIntervalHours");
                    if (setting != null && int.TryParse(setting.Value, out int hours) && hours > 0)
                    {
                        delayHours = hours;
                    }

                    // Retrieve configured time of day
                    var timeSetting = await dbContext.SystemSettings.FindAsync("CleanupJobTimeOfDay");
                    if (timeSetting != null && TimeSpan.TryParse(timeSetting.Value, out TimeSpan parsedTime))
                    {
                        targetTime = parsedTime;
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

                // Calcular próxima ejecución usando la zona horaria correcta
                var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, argTz);
                var nextRun = now.Date.Add(targetTime);

                // Si la hora ya pasó hoy, sumamos el intervalo (ej: 24 hs para el próximo día)
                while (nextRun <= now)
                {
                    nextRun = nextRun.AddHours(delayHours);
                }

                var delay = nextRun - now;
                _logger.LogInformation($"Task Cleanup Service will run again at {nextRun} (in {delay.TotalHours:F2} hours).");
                
                await Task.Delay(delay, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing Task Cleanup.");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // Retry after 1 hour if error
            }
        }
    }
}
