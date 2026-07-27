using SistemaMozoQr.Application;
using SistemaMozoQr.Infrastructure;
using SistemaMozoQr.Infrastructure.Data;
using SistemaMozoQr.Infrastructure.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();

// Configuración de Swagger
builder.Services.AddSwaggerGen();

// Configurar JWT Bearer
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "clave_secreta_super_larga_de_ejemplo_jwt_123");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "MozoGo.Server",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "MozoGo.Clients"
    };
});

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// Dependency Injection de Clean Architecture
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<SistemaMozoQr.Application.Interfaces.ICurrentUserService, SistemaMozoQr.WebApi.Services.CurrentUserService>();
builder.Services.AddApplicationServices();
builder.Services.AddHostedService<SistemaMozoQr.WebApi.Services.TaskCleanupService>();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS para SignalR y frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .SetIsOriginAllowed(origin => true) // Permitir cualquier origen
              .AllowCredentials(); // Necesario para SignalR
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<SistemaMozoQr.WebApi.Middlewares.ExceptionHandlingMiddleware>();

// Importante: User Authentication antes de Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<RestauranteHub>("/hubs/restaurante");

// Inicializar DB y aplicar migraciones pendientes (para SQL Server local)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RestauranteDbContext>();
    // context.Database.EnsureCreated(); // <- Esto era para InMemory
    
    // Auto-fix for PostgreSQL column type if migration was previously run with wrong TEXT type
    if (context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
    {
        try
        {
            context.Database.ExecuteSqlRaw("ALTER TABLE \"Mesas\" ALTER COLUMN \"MontoConsumo\" TYPE numeric USING \"MontoConsumo\"::numeric;");
        }
        catch (Exception)
        {
            // Ignore if column doesn't exist yet
        }
    }

    if (context.Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
    {
        // Para SQLite (local) usamos EnsureCreated y NO ejecutamos las migraciones que son de Postgres
        context.Database.EnsureCreated();
    }
    else
    {
        try
        {
            context.Database.Migrate(); // <- Esto ejecuta los scripts de EF Migrations (Postgres)
        }
        catch (Exception ex) when (ex.Message.Contains("42P07") || ex.Message.Contains("already exists"))
        {
            if (context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                // Wipe old schema and retry (only for Postgres in dev/staging reset scenarios)
                context.Database.ExecuteSqlRaw("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
                context.Database.Migrate();
            }
            else
            {
                throw;
            }
        }
    }

    // Generar e inicializar llaves VAPID si no existen en la base de datos
    try
    {
        var pubKeySetting = context.SystemSettings.IgnoreQueryFilters().FirstOrDefault(s => s.Key == "VapidPublicKey");
        var privKeySetting = context.SystemSettings.IgnoreQueryFilters().FirstOrDefault(s => s.Key == "VapidPrivateKey");
        if (pubKeySetting == null || privKeySetting == null)
        {
            var vapidKeys = WebPush.VapidHelper.GenerateVapidKeys();
            
            if (pubKeySetting == null)
            {
                context.SystemSettings.Add(new SistemaMozoQr.Domain.Entities.SystemSetting { Key = "VapidPublicKey", Value = vapidKeys.PublicKey });
            }
            if (privKeySetting == null)
            {
                context.SystemSettings.Add(new SistemaMozoQr.Domain.Entities.SystemSetting { Key = "VapidPrivateKey", Value = vapidKeys.PrivateKey });
            }
            
            var subjectSetting = context.SystemSettings.IgnoreQueryFilters().FirstOrDefault(s => s.Key == "VapidSubject");
            if (subjectSetting == null)
            {
                context.SystemSettings.Add(new SistemaMozoQr.Domain.Entities.SystemSetting { Key = "VapidSubject", Value = "mailto:admin@mozogo.com" });
            }

            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error al inicializar llaves VAPID: {ex.Message}");
    }
}

app.Run();
