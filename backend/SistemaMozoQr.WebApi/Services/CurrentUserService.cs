using System.Security.Claims;
using SistemaMozoQr.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace SistemaMozoQr.WebApi.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? GetUserEmail()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email) 
            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name) 
            ?? "Sistema/Anonimo";
    }

    public string? GetUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    public Guid? GetRestauranteId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        if (IsSuperAdmin())
        {
            if (httpContext.Request.Headers.TryGetValue("X-Tenant-ID", out var tenantHeader) && Guid.TryParse(tenantHeader, out var parsedTenantId))
            {
                return parsedTenantId;
            }
            return null; // SuperAdmin con vista global (sin restaurante especifico)
        }

        var tenantClaim = httpContext.User?.FindFirst("TenantId")?.Value;
        if (Guid.TryParse(tenantClaim, out var tenantId))
        {
            return tenantId;
        }
        return null;
    }

    public bool IsSuperAdmin()
    {
        var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        return role == "SuperAdmin";
    }
}
