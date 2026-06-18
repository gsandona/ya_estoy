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
        ValidateIssuer = false, // En MVP desactivamos emisor local
        ValidateAudience = false // En MVP desactivamos audiencia local
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

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

    // Auto-add column CodigoAcceso to Pedidos table if not present (SQLite & PostgreSQL compatible)
    try
    {
        if (context.Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL")
        {
            context.Database.ExecuteSqlRaw("ALTER TABLE \"Pedidos\" ADD COLUMN \"CodigoAcceso\" varchar(10);");
        }
        else
        {
            context.Database.ExecuteSqlRaw("ALTER TABLE Pedidos ADD COLUMN CodigoAcceso TEXT;");
        }
    }
    catch (Exception)
    {
        // Column already exists or error ignored
    }

    try
    {
        context.Database.Migrate(); // <- Esto ejecuta los scripts de EF Migrations
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

app.Run();
