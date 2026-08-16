using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.DTOs;
using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Infrastructure.SignalR;
using SistemaMozoQr.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using SistemaMozoQr.Infrastructure.Data;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/mesas")]
[Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
public class MesasConfigController : ControllerBase
{
    private readonly IMesaRepository _mesaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IHubContext<RestauranteHub, IRestauranteHubClient> _hubContext;
    private readonly RestauranteDbContext _dbContext;

    public MesasConfigController(
        IMesaRepository mesaRepository, 
        IUsuarioRepository usuarioRepository, 
        ITaskRepository taskRepository,
        IPedidoRepository pedidoRepository,
        IHubContext<RestauranteHub, IRestauranteHubClient> hubContext,
        RestauranteDbContext dbContext)
    {
        _mesaRepository = mesaRepository;
        _usuarioRepository = usuarioRepository;
        _taskRepository = taskRepository;
        _pedidoRepository = pedidoRepository;
        _hubContext = hubContext;
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var mesas = await _mesaRepository.GetAllAsync();
        return Ok(mesas);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();
        return Ok(mesa);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin,Caja")]
    public async Task<IActionResult> Crear([FromBody] CrearMesaDto dto)
    {
        var mesa = new Mesa
        {
            Id = dto.Id ?? Guid.NewGuid(),
            Numero = dto.Numero,
            Ubicacion = dto.Ubicacion,
            MozoId = dto.MozoId,
            TokenQR = dto.TokenQR,
            Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible
        };
        await _mesaRepository.AddAsync(mesa);
        return Ok(mesa);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin,Caja")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarMesaDto dto)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Numero = dto.Numero;
        mesa.Ubicacion = dto.Ubicacion;
        mesa.MozoId = dto.MozoId;
        mesa.TokenQR = dto.TokenQR;

        await _mesaRepository.UpdateAsync(mesa);
        return Ok(mesa);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin,Caja")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        await _mesaRepository.DeleteAsync(mesa);
        return NoContent();
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,SuperAdmin,Caja")]
    public async Task<IActionResult> BulkSync([FromBody] List<BulkMesaDto> dtos)
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        var mesas = new List<Mesa>();

        foreach (var dto in dtos)
        {
             Guid? realMozoId = null;
             if (!string.IsNullOrWhiteSpace(dto.MozoId))
             {
                  if (Guid.TryParse(dto.MozoId, out Guid parsedId)) {
                      realMozoId = parsedId;
                  } else {
                      var user = usuarios.FirstOrDefault(u => u.Username == dto.MozoId);
                      if (user != null) realMozoId = user.Id;
                  }
             }

             mesas.Add(new Mesa
             {
                 Id = dto.Id,
                 Numero = dto.Numero,
                 Ubicacion = dto.Ubicacion,
                 MozoId = realMozoId,
                 Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible
             });
        }
        await _mesaRepository.BulkSyncAsync(mesas);
        return Ok(mesas);
    }

    [HttpPost("{id:guid}/abrir")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
    public async Task<IActionResult> Abrir(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Ocupada;
        // Generar PIN de 4 dígitos aleatorio
        var random = new Random();
        mesa.CodigoAcceso = random.Next(1000, 9999).ToString();
        
        await _mesaRepository.UpdateAsync(mesa);
        return Ok(new { mesa.Id, mesa.Numero, mesa.Estado, mesa.CodigoAcceso });
    }

    [HttpPost("{id:guid}/cerrar")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
    public async Task<IActionResult> Cerrar(Guid id, [FromQuery] bool sinFacturar = false)
    {
        var mesa = await _dbContext.Mesas.IgnoreQueryFilters().Include(m => m.Mozo).FirstOrDefaultAsync(m => m.Id == id);
        if (mesa == null) return NotFound();

        // 1. Registrar la Venta en el histórico antes de limpiar la sesión (solo si no es sinFacturar)
        if (!sinFacturar && !string.IsNullOrEmpty(mesa.CodigoAcceso))
        {
            var ordersList = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
            var activeOrders = ordersList.Where(o => o.Estado != SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado && o.CodigoAcceso == mesa.CodigoAcceso).ToList();
            
            var itemsList = activeOrders.SelectMany(o => o.Items).Select(i => new {
                nombre = i.MenuItem?.Nombre ?? "Item",
                cantidad = i.Cantidad,
                precioUnitario = i.PrecioUnitario,
                total = i.Cantidad * i.PrecioUnitario
            }).ToList();

            decimal totalFinal = itemsList.Sum(i => i.total);

            if (totalFinal > 0)
            {
                var detallesJson = System.Text.Json.JsonSerializer.Serialize(itemsList);

                var venta = new Venta
                {
                    Id = Guid.NewGuid(),
                    RestauranteId = mesa.RestauranteId,
                    MesaNumero = mesa.Numero,
                    CodigoAcceso = mesa.CodigoAcceso,
                    FechaHora = DateTime.UtcNow,
                    Total = totalFinal,
                    DetallesJson = detallesJson,
                    MozoNombre = mesa.Mozo?.NombreCompleto ?? "Sin mozo asignado"
                };

                _dbContext.Ventas.Add(venta);
                await _dbContext.SaveChangesAsync();
            }
        }

        // 2. Liberar la mesa
        mesa.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible;
        mesa.CodigoAcceso = null; // Se invalida el PIN
        mesa.MontoConsumo = null; // Reset billing amount for new customers
        
        await _mesaRepository.UpdateAsync(mesa);

        // 3. Clear/complete all pending tasks for this table in DB & notify via SignalR in real-time
        var pendingTasks = await _taskRepository.GetPendingTasksIgnoreQueryFiltersAsync();
        var mesaTasks = pendingTasks.Where(t => t.TableId == mesa.Numero && t.RestauranteId == mesa.RestauranteId).ToList();
        foreach (var task in mesaTasks)
        {
            task.Status = "Completed";
            await _taskRepository.UpdateAsync(task);
            await _hubContext.Clients.All.TareaCompletada(task.Id.ToString());
        }

        // 4. Mark all active/pending orders for this table as delivered or canceled
        var orders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        foreach (var order in orders)
        {
            if (order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Recibido ||
                order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.EnPreparacion ||
                order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Listo ||
                order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Aprobado)
            {
                order.Estado = sinFacturar 
                    ? SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado 
                    : SistemaMozoQr.Domain.Enums.EstadoPedido.Entregado;
                await _pedidoRepository.UpdateAsync(order);
            }
            else if (sinFacturar && order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Entregado)
            {
                order.Estado = SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado;
                await _pedidoRepository.UpdateAsync(order);
            }
        }

        return Ok(new { mesa.Id, mesa.Numero, mesa.Estado, mesa.CodigoAcceso, mesa.MontoConsumo });
    }

    [HttpGet("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyMesa([FromQuery] string? mesaId, [FromQuery] string? pin, [FromQuery] string? restaurante, [FromQuery] int? numero)
    {
        Mesa? mesa = null;

        if (restaurante != null && numero.HasValue)
        {
            mesa = await _mesaRepository.GetByRestauranteAndNumeroAsync(restaurante, numero.Value);
        }
        else if (!string.IsNullOrWhiteSpace(mesaId))
        {
            if (int.TryParse(mesaId, out int parsedNum))
            {
                mesa = await _mesaRepository.GetByNumeroIgnoreQueryFiltersAsync(parsedNum);
            }
            else if (Guid.TryParse(mesaId, out Guid parsedId))
            {
                mesa = await _mesaRepository.GetByIdIgnoreQueryFiltersAsync(parsedId);
            }
        }

        if (mesa == null) 
            return NotFound("La mesa solicitada no existe o parámetros incompletos.");

        // Validar que la mesa esté activa (PIN configurado)
        if (string.IsNullOrEmpty(mesa.CodigoAcceso) || mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible)
            return BadRequest(new { 
                message = "La mesa se encuentra inactiva. Solicite al mozo que la habilite.", 
                code = "INACTIVA",
                restauranteNombre = mesa.Restaurante?.Nombre,
                restauranteLogo = mesa.Restaurante?.LogoUrl,
                restauranteIcon = mesa.Restaurante?.IconoPrincipal,
                restauranteFondo = mesa.Restaurante?.ImagenFondoUrl,
                colorPrimario = mesa.Restaurante?.ColorPrimario,
                colorSecundario = mesa.Restaurante?.ColorSecundario,
                colorFondo = mesa.Restaurante?.ColorFondo
            });

        // Si no envía PIN, retornamos 401 para que el front pida el PIN
        if (string.IsNullOrEmpty(pin))
        {
            return Unauthorized(new { 
                message = "Se requiere el PIN de la mesa.", 
                mesaId = mesa.Id, 
                numero = mesa.Numero,
                restauranteNombre = mesa.Restaurante?.Nombre,
                restauranteLogo = mesa.Restaurante?.LogoUrl,
                restauranteIcon = mesa.Restaurante?.IconoPrincipal,
                restauranteFondo = mesa.Restaurante?.ImagenFondoUrl,
                colorPrimario = mesa.Restaurante?.ColorPrimario,
                colorSecundario = mesa.Restaurante?.ColorSecundario,
                colorFondo = mesa.Restaurante?.ColorFondo
            });
        }

        if (mesa.CodigoAcceso != pin)
        {
            return BadRequest(new { 
                message = "PIN incorrecto.", 
                code = "PIN_INVALIDO",
                restauranteNombre = mesa.Restaurante?.Nombre,
                restauranteLogo = mesa.Restaurante?.LogoUrl,
                restauranteIcon = mesa.Restaurante?.IconoPrincipal,
                restauranteFondo = mesa.Restaurante?.ImagenFondoUrl,
                colorPrimario = mesa.Restaurante?.ColorPrimario,
                colorSecundario = mesa.Restaurante?.ColorSecundario,
                colorFondo = mesa.Restaurante?.ColorFondo
            });
        }

        var pendingTasks = await _taskRepository.GetPendingTasksIgnoreQueryFiltersAsync();
        var mesaTasks = pendingTasks.Where(t => t.TableId == mesa.Numero && t.RestauranteId == mesa.RestauranteId).ToList();
        
        var llamoTask = mesaTasks.FirstOrDefault(t => t.Type == "Llamado");
        var cuentaTask = mesaTasks.FirstOrDefault(t => t.Type == "Cuenta");
        var pedidoTask = mesaTasks.FirstOrDefault(t => t.Type == "Pedido");

        string? pedidoEstado = null;
        if (pedidoTask != null)
        {
            var pedido = await _pedidoRepository.GetByIdAsync(pedidoTask.Id);
            if (pedido != null)
            {
                pedidoEstado = pedido.Estado.ToString();
            }
        }

        // Obtener todos los items consumidos en la mesa de la sesión actual (mismo PIN)
        var orders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        var activeOrders = orders.Where(o => o.Estado != SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado && o.CodigoAcceso == pin).ToList();
        var itemsRes = activeOrders.SelectMany(o => o.Items).Select(i => new {
            id = i.Id,
            nombre = i.MenuItem?.Nombre ?? "Item",
            cantidad = i.Cantidad,
            precioUnitario = i.PrecioUnitario,
            total = i.Cantidad * i.PrecioUnitario
        }).ToList();

        return Ok(new { 
            mesaId = mesa.Id, 
            restauranteId = mesa.RestauranteId,
            numero = mesa.Numero, 
            estado = mesa.Estado, 
            montoConsumo = mesa.MontoConsumo,
            validado = true,
            hasLlamado = llamoTask != null,
            hasCuenta = cuentaTask != null,
            llamoTaskId = llamoTask?.Id,
            cuentaTaskId = cuentaTask?.Id,
            pedidoTaskId = pedidoTask?.Id,
            pedidoDetails = pedidoTask?.Details,
            pedidoEstado = pedidoEstado,
            itemsConsumidos = itemsRes,
            restauranteNombre = mesa.Restaurante?.Nombre,
            restauranteLogo = mesa.Restaurante?.LogoUrl,
            restauranteIcon = mesa.Restaurante?.IconoPrincipal,
            restauranteFondo = mesa.Restaurante?.ImagenFondoUrl,
            colorPrimario = mesa.Restaurante?.ColorPrimario,
            colorSecundario = mesa.Restaurante?.ColorSecundario,
            colorFondo = mesa.Restaurante?.ColorFondo
        });
    }

    [HttpPost("{id:guid}/monto")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
    public async Task<IActionResult> ActualizarMonto(Guid id, [FromBody] decimal? monto)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.MontoConsumo = monto;
        await _mesaRepository.UpdateAsync(mesa);

        // Notificar en tiempo real a los comensales
        await _hubContext.Clients.All.NotificarMontoConsumoActualizado(id.ToString(), monto);

        return Ok(new { mesa.Id, mesa.Numero, mesa.MontoConsumo });
    }

    [HttpGet("{id:guid}/consumos")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
    public async Task<IActionResult> GetConsumos(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound("Mesa no encontrada.");
        if (string.IsNullOrEmpty(mesa.CodigoAcceso)) 
            return Ok(new { mesaId = id, total = 0, items = new List<object>() });

        var orders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        var activeOrders = orders.Where(o => o.Estado != SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado && o.CodigoAcceso == mesa.CodigoAcceso).ToList();
        var itemsRes = activeOrders.SelectMany(o => o.Items).Select(i => new {
            id = i.Id,
            menuItemId = i.MenuItemId,
            nombre = i.MenuItem?.Nombre ?? "Item",
            cantidad = i.Cantidad,
            precioUnitario = i.PrecioUnitario,
            total = i.Cantidad * i.PrecioUnitario
        }).ToList();

        decimal total = itemsRes.Sum(i => i.total);
        return Ok(new { 
            mesaId = id, 
            codigoAcceso = mesa.CodigoAcceso,
            total = total, 
            items = itemsRes 
        });
    }

    [HttpPost("{id:guid}/agregar-consumo")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo,Caja")]
    public async Task<IActionResult> AgregarConsumo(Guid id, [FromBody] AgregarConsumoDto dto)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound("Mesa no encontrada.");
        if (string.IsNullOrEmpty(mesa.CodigoAcceso))
            return BadRequest("La mesa no está abierta (no tiene una sesión activa).");

        if (dto.Items == null || !dto.Items.Any())
            return BadRequest("No se enviaron items para agregar.");

        // 1. Crear un Pedido en estado Entregado
        var pedido = new Pedido
        {
            Id = Guid.NewGuid(),
            MesaId = mesa.Id,
            Estado = SistemaMozoQr.Domain.Enums.EstadoPedido.Entregado,
            Fecha = DateTime.UtcNow,
            CodigoAcceso = mesa.CodigoAcceso,
            RestauranteId = mesa.RestauranteId,
            Items = new List<PedidoItem>()
        };

        foreach (var itemDto in dto.Items)
        {
            if (itemDto.MenuItemId.HasValue && itemDto.Cantidad.HasValue && itemDto.Cantidad.Value > 0)
            {
                // Es un plato de la carta
                var menuItem = await _dbContext.MenuItems.FindAsync(itemDto.MenuItemId.Value);
                if (menuItem != null)
                {
                    pedido.Items.Add(new PedidoItem
                    {
                        Id = Guid.NewGuid(),
                        RestauranteId = mesa.RestauranteId,
                        PedidoId = pedido.Id,
                        MenuItemId = menuItem.Id,
                        Cantidad = itemDto.Cantidad.Value,
                        PrecioUnitario = menuItem.Precio
                    });
                }
            }
            else if (!string.IsNullOrWhiteSpace(itemDto.Descripcion) && itemDto.Monto.HasValue)
            {
                // Es un cargo manual
                var manualItemName = itemDto.Descripcion.Trim();
                var manualItem = await _dbContext.MenuItems.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(m => m.Nombre == manualItemName && m.RestauranteId == mesa.RestauranteId);
                
                if (manualItem == null)
                {
                    manualItem = new MenuItem
                    {
                        Id = Guid.NewGuid(),
                        Nombre = manualItemName,
                        Descripcion = "Cargo manual en caja",
                        Precio = 0,
                        RestauranteId = mesa.RestauranteId,
                        Activo = false // oculto
                    };
                    _dbContext.MenuItems.Add(manualItem);
                    await _dbContext.SaveChangesAsync();
                }

                pedido.Items.Add(new PedidoItem
                {
                    Id = Guid.NewGuid(),
                    RestauranteId = mesa.RestauranteId,
                    PedidoId = pedido.Id,
                    MenuItemId = manualItem.Id,
                    Cantidad = 1,
                    PrecioUnitario = itemDto.Monto.Value
                });
            }
        }

        if (!pedido.Items.Any())
        {
            return BadRequest("Ningún item de consumo es válido.");
        }

        _dbContext.Pedidos.Add(pedido);
        await _dbContext.SaveChangesAsync();

        // 2. Recalcular el MontoConsumo de la mesa
        var allOrders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        var activeOrders = allOrders.Where(o => o.Estado != SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado && o.CodigoAcceso == mesa.CodigoAcceso).ToList();
        
        decimal totalConsumo = activeOrders.SelectMany(o => o.Items).Sum(i => i.Cantidad * i.PrecioUnitario);
        mesa.MontoConsumo = totalConsumo;

        await _mesaRepository.UpdateAsync(mesa);

        // 3. Notificar en tiempo real a los comensales
        await _hubContext.Clients.All.NotificarMontoConsumoActualizado(mesa.Id.ToString(), totalConsumo);

        return Ok(new { 
            mesaId = mesa.Id, 
            numero = mesa.Numero, 
            montoConsumo = totalConsumo,
            itemsAgregados = pedido.Items.Count 
        });
    }
}

public class AgregarConsumoDto
{
    public List<ConsumoItemDto> Items { get; set; } = new();
}

public class ConsumoItemDto
{
    public Guid? MenuItemId { get; set; }
    public int? Cantidad { get; set; }
    public string? Descripcion { get; set; }
    public decimal? Monto { get; set; }
}
