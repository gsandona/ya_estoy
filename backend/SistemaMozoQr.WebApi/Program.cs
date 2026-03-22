using SistemaMozoQr.Application;
using SistemaMozoQr.Infrastructure;
using SistemaMozoQr.Infrastructure.Data;
using SistemaMozoQr.Infrastructure.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SignalR
builder.Services.AddSignalR();

// Dependency Injection de Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS para SignalR y frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyMethod()
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

app.UseAuthorization();

app.MapControllers();

// Mapeo del Hub de SignalR
app.MapHub<RestauranteHub>("/hubs/restaurante");

// Inicializar DB en memoria y ejecutar Seeders (para entorno de desarrollo/prueba)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RestauranteDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
