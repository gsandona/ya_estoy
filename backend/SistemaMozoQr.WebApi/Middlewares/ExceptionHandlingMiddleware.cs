using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
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
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Uncaught exception intercepted by middleware. TraceId: {TraceId}", context.TraceIdentifier);
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
                UsuarioInvolucrado = currentUserService?.GetUsername(),
                FechaHora = DateTime.UtcNow,
                RestauranteId = currentUserService?.GetRestauranteId() ?? Guid.Parse("11111111-1111-1111-1111-111111111111")
            };

            dbContext.ErrorLogs.Add(errorLog);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception dbEx)
        {
            _logger.LogError(dbEx, "Failed to save error log to database.");
        }

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                string.IsNullOrWhiteSpace(exception.Message) ? "No autorizado para realizar esta acción." : exception.Message
            ),
            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                string.IsNullOrWhiteSpace(exception.Message) ? "El recurso solicitado no fue encontrado." : exception.Message
            ),
            ArgumentException => (
                StatusCodes.Status400BadRequest,
                string.IsNullOrWhiteSpace(exception.Message) ? "Los datos proporcionados no son válidos." : exception.Message
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                _env.IsDevelopment()
                    ? exception.Message
                    : "Ocurrió un error interno en el servidor."
            )
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new
        {
            statusCode,
            message,
            traceId = context.TraceIdentifier
        });
    }
}
