using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class ImagesController : ControllerBase
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg" };

    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ImagesController> _logger;

    public ImagesController(IWebHostEnvironment env, ILogger<ImagesController> logger)
    {
        _env = env;
        _logger = logger;
    }

    private string GetUploadsFolder()
    {
        var webRootPath = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRootPath))
        {
            webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
        }
        var uploadsFolder = Path.Combine(webRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }
        return uploadsFolder;
    }

    [HttpGet]
    public IActionResult GetImages()
    {
        try
        {
            var uploadsFolder = GetUploadsFolder();
            var files = Directory.GetFiles(uploadsFolder)
                                 .Select(f => new FileInfo(f))
                                 .Select(f => new
                                 {
                                     name = f.Name,
                                     url = $"/uploads/{f.Name}",
                                     sizeBytes = f.Length,
                                     createdAt = f.CreationTimeUtc
                                 })
                                 .OrderByDescending(f => f.createdAt)
                                 .ToList();

            return Ok(files);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al listar las imágenes.");
            return StatusCode(500, new { message = "Error al listar las imágenes." });
        }
    }

    [HttpPost("upload")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No se proporcionó ningún archivo válido." });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new { message = "El archivo supera el tamaño máximo permitido de 5 MB." });
        }

        try
        {
            var safeOriginalFileName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(safeOriginalFileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Extensión de archivo no permitida." });
            }

            var uploadsFolder = GetUploadsFolder();
            var fileName = Path.GetFileName($"{Guid.NewGuid()}{extension}");
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new
            {
                name = fileName,
                url = $"/uploads/{fileName}",
                sizeBytes = file.Length,
                createdAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al subir la imagen.");
            return StatusCode(500, new { message = "Error al subir la imagen." });
        }
    }

    [HttpDelete("{filename}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public IActionResult DeleteImage(string filename)
    {
        if (string.IsNullOrWhiteSpace(filename))
        {
            return BadRequest(new { message = "Nombre de archivo inválido." });
        }

        var safeFileName = Path.GetFileName(filename);
        if (string.IsNullOrEmpty(safeFileName) || safeFileName != filename || safeFileName.Contains(".."))
        {
            return BadRequest(new { message = "Nombre de archivo inválido." });
        }

        var extension = Path.GetExtension(safeFileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Extensión de archivo no permitida." });
        }

        try
        {
            var uploadsFolder = GetUploadsFolder();
            var filePath = Path.Combine(uploadsFolder, safeFileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "Archivo no encontrado." });
            }

            System.IO.File.Delete(filePath);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar la imagen {FileName}.", safeFileName);
            return StatusCode(500, new { message = "Error al eliminar la imagen." });
        }
    }
}
