namespace SistemaMozoQr.Application.Interfaces;

public interface ICurrentUserService
{
    string? GetUserEmail();
    string? GetUserId();
}
