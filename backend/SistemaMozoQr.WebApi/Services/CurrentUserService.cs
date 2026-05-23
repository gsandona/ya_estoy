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
}
