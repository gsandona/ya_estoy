using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Uncaught exception intercepted by middleware.");
            await HandleExceptionAsync(context, ex, serviceProvider);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception, IServiceProvider serviceProvider)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<RestauranteDbContext>();
            var currentUserService = scope.ServiceProvider.GetService<ICurrentUserService>();

            var errorLog = new ErrorLog
            {
                Mensaje = exception.Message,
                StackTrace = exception.StackTrace ?? string.Empty,
                RutaAPI = context.Request.Path,
                UsuarioInvolucrado = currentUserService?.GetUserEmail(),
                FechaHora = DateTime.UtcNow
            };

            dbContext.ErrorLogs.Add(errorLog);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception dbEx)
        {
            _logger.LogError(dbEx, "Failed to save error log to database.");
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new { message = "An internal server error occurred." });
    }
}
