namespace SistemaMozoQr.Application.Interfaces;

public interface ICurrentUserService
{
    string? GetUsername();
    string? GetUserId();
    Guid? GetRestauranteId();
    bool IsSuperAdmin();
}
