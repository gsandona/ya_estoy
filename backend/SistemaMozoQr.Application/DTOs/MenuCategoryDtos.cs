using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Application.DTOs;

public class CrearMenuCategoryDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El emoji/logo es obligatorio")]
    [MaxLength(10, ErrorMessage = "El emoji no puede superar los 10 caracteres")]
    public string Emoji { get; set; } = string.Empty;

    public Guid? ParentCategoryId { get; set; }
}

public class EditarMenuCategoryDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El emoji/logo es obligatorio")]
    [MaxLength(10, ErrorMessage = "El emoji no puede superar los 10 caracteres")]
    public string Emoji { get; set; } = string.Empty;

    public Guid? ParentCategoryId { get; set; }
}

public class MenuCategoryDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public List<MenuCategoryDto> SubCategories { get; set; } = new();
}
