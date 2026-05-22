# Script para generar la migración inicial de la Base de Datos

cd c:\SISTEMAS\ya_estoy\backend

echo "Instalando herramienta global dotnet-ef (por si no la tienes)..."
dotnet tool install --global dotnet-ef

echo "Generando Migración Inicial..."
# El proyecto que tiene el DbContext es Infrastructure, pero el que se ejecuta es WebApi
dotnet ef migrations add InitialCreate --project SistemaMozoQr.Infrastructure\SistemaMozoQr.Infrastructure.csproj --startup-project SistemaMozoQr.WebApi\SistemaMozoQr.WebApi.csproj --output-dir Data\Migrations

echo "¡Migración generada exitosamente en la carpeta Infrastructure/Data/Migrations!"
echo "Al ejecutar la WebApi, la base de datos se actualizará automáticamente."
pause
