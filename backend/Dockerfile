# 1. Usar la imagen oficial del SDK de .NET 10.0 para construir la app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos todo el contenido de la carpeta backend
COPY . ./

# Compilamos la aplicación apuntando al proyecto WebApi
RUN dotnet publish SistemaMozoQr.WebApi/SistemaMozoQr.WebApi.csproj -c Release -o /app/out

# 2. Usar la imagen de .NET 10.0 para ejecutar la app
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# Render usa el puerto 8080 por defecto para los Web Services
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Arrancamos el .dll correcto
ENTRYPOINT ["dotnet", "SistemaMozoQr.WebApi.dll"]