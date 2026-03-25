using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Application.DTOs;

public class CrearMenuItemDto
{
    [Required(ErrorMessage = "La categoría es obligatoria")]
    [MaxLength(100, ErrorMessage = "La categoría no puede superar los 100 caracteres")]
    [RegularExpression("^(Aderezos|Postres|Bebidas calientes|Bebidas frias|Bebidas Calientes|Bebidas Frias)$", ErrorMessage = "La categoría debe ser Aderezos, Postres, Bebidas calientes o Bebidas frias")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar los 200 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio")]
    [Range(0, 1000000, ErrorMessage = "El precio debe ser mayor o igual a 0")]
    public decimal Precio { get; set; }

    [MaxLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres")]
    public string? Descripcion { get; set; }

    public bool Activo { get; set; } = true;
}

public class EditarMenuItemDto
{
    [Required(ErrorMessage = "La categoría es obligatoria")]
    [MaxLength(100, ErrorMessage = "La categoría no puede superar los 100 caracteres")]
    [RegularExpression("^(Aderezos|Postres|Bebidas calientes|Bebidas frias|Bebidas Calientes|Bebidas Frias)$", ErrorMessage = "La categoría debe ser Aderezos, Postres, Bebidas calientes o Bebidas frias")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar los 200 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio")]
    [Range(0, 1000000, ErrorMessage = "El precio debe ser mayor o igual a 0")]
    public decimal Precio { get; set; }

    [MaxLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres")]
    public string? Descripcion { get; set; }

    public bool Activo { get; set; }
}

public class BulkMenuItemDto
{
    public Guid? Id { get; set; }
    
    [Required(ErrorMessage = "La categoría es obligatoria")]
    [MaxLength(100, ErrorMessage = "La categoría no puede superar los 100 caracteres")]
    [RegularExpression("^(Aderezos|Postres|Bebidas calientes|Bebidas frias|Bebidas Calientes|Bebidas Frias)$", ErrorMessage = "La categoría debe ser Aderezos, Postres, Bebidas calientes o Bebidas frias")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres")]
    [MaxLength(200, ErrorMessage = "El nombre no puede superar los 200 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio")]
    [Range(0, 1000000, ErrorMessage = "El precio debe ser mayor o igual a 0")]
    public decimal Precio { get; set; }

    [MaxLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres")]
    public string? Descripcion { get; set; }

    public bool Activo { get; set; } = true;
}
