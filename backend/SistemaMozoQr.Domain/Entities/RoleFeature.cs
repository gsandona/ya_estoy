using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaMozoQr.Domain.Entities;

public class RoleFeature
{
    public Guid Id { get; set; }
    
    public int RoleId { get; set; }
    public Role? Role { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string FeatureKey { get; set; } = string.Empty;
    
    public bool Activo { get; set; } = true;
}
