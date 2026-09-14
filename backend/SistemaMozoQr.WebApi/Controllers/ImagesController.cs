using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class ImagesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public ImagesController(IWebHostEnvironment env)
    {
        _env = env;
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
            return StatusCode(500, new { message = "Error al listar las imágenes", error = ex.Message });
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No se proporcionó ningún archivo válido." });
        }

        try
        {
            var extension = Path.GetExtension(file.FileName);
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            if (!allowedExtensions.Contains(extension.ToLower()))
            {
                return BadRequest(new { message = "Extensión de archivo no permitida." });
            }

            var uploadsFolder = GetUploadsFolder();
            var fileName = $"{Guid.NewGuid()}{extension}";
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
            return StatusCode(500, new { message = "Error al subir la imagen", error = ex.Message });
        }
    }

    [HttpDelete("{filename}")]
    public IActionResult DeleteImage(string filename)
    {
        if (string.IsNullOrEmpty(filename) || filename.Contains("..") || filename.Contains("/") || filename.Contains("\\"))
        {
            return BadRequest(new { message = "Nombre de archivo inválido." });
        }

        try
        {
            var uploadsFolder = GetUploadsFolder();
            var filePath = Path.Combine(uploadsFolder, filename);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "Archivo no encontrado." });
            }

            System.IO.File.Delete(filePath);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al eliminar la imagen", error = ex.Message });
        }
    }
}
