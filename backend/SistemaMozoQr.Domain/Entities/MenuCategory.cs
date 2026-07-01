using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SistemaMozoQr.Domain.Entities;

public class MenuCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Emoji { get; set; } = string.Empty;

    public Guid? ParentCategoryId { get; set; }

    [JsonIgnore]
    public MenuCategory? ParentCategory { get; set; }

    public List<MenuCategory> SubCategories { get; set; } = new();

    [JsonIgnore]
    public List<MenuItem> MenuItems { get; set; } = new();
}
