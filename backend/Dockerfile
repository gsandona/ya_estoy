# 1. Usar la imagen oficial del SDK de .NET para construir la app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos todo el contenido de la carpeta backend
COPY . ./

# Compilamos la aplicación en modo Release
RUN dotnet publish SistemaMozoQr.WebApi/SistemaMozoQr.WebApi.csproj -c Release -o /app/out

# 2. Usar una imagen más liviana solo para ejecutar la app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render usa el puerto 8080 por defecto para los Web Services
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# ⚠️ IMPORTANTE: Cambiá "NombreDeTuAPI.dll" por el nombre real de tu proyecto
ENTRYPOINT ["dotnet", "SistemaMozoQr.WebApi.dll"]