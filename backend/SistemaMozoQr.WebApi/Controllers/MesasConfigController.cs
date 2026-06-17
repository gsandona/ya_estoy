using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaMozoQr.Domain.Entities;
using SistemaMozoQr.Domain.Interfaces;
using SistemaMozoQr.Application.DTOs;
using Microsoft.AspNetCore.SignalR;
using SistemaMozoQr.Infrastructure.SignalR;
using SistemaMozoQr.Application.Interfaces;

namespace SistemaMozoQr.WebApi.Controllers;

[ApiController]
[Route("api/mesas")]
[Authorize(Roles = "Admin,SuperAdmin,Mozo")]
public class MesasConfigController : ControllerBase
{
    private readonly IMesaRepository _mesaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IHubContext<RestauranteHub, IRestauranteHubClient> _hubContext;

    public MesasConfigController(
        IMesaRepository mesaRepository, 
        IUsuarioRepository usuarioRepository, 
        ITaskRepository taskRepository,
        IPedidoRepository pedidoRepository,
        IHubContext<RestauranteHub, IRestauranteHubClient> hubContext)
    {
        _mesaRepository = mesaRepository;
        _usuarioRepository = usuarioRepository;
        _taskRepository = taskRepository;
        _pedidoRepository = pedidoRepository;
        _hubContext = hubContext;
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
    [Authorize(Roles = "Admin,SuperAdmin")]
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
    [Authorize(Roles = "Admin,SuperAdmin")]
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
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        await _mesaRepository.DeleteAsync(mesa);
        return NoContent();
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,SuperAdmin")]
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
                      var user = usuarios.FirstOrDefault(u => u.Email == dto.MozoId);
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
    [Authorize(Roles = "Admin,SuperAdmin,Mozo")]
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
    [Authorize(Roles = "Admin,SuperAdmin,Mozo")]
    public async Task<IActionResult> Cerrar(Guid id)
    {
        var mesa = await _mesaRepository.GetByIdAsync(id);
        if (mesa == null) return NotFound();

        mesa.Estado = SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible;
        mesa.CodigoAcceso = null; // Se invalida el PIN
        mesa.MontoConsumo = null; // Reset billing amount for new customers
        
        await _mesaRepository.UpdateAsync(mesa);

        // 1. Clear/complete all pending tasks for this table in DB & notify via SignalR in real-time
        var pendingTasks = await _taskRepository.GetPendingTasksIgnoreQueryFiltersAsync();
        var mesaTasks = pendingTasks.Where(t => t.TableId == mesa.Numero && t.RestauranteId == mesa.RestauranteId).ToList();
        foreach (var task in mesaTasks)
        {
            task.Status = "Completed";
            await _taskRepository.UpdateAsync(task);
            await _hubContext.Clients.All.TareaCompletada(task.Id.ToString());
        }

        // 2. Mark all active/pending orders for this table as delivered
        var orders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        foreach (var order in orders)
        {
            if (order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Recibido ||
                order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.EnPreparacion ||
                order.Estado == SistemaMozoQr.Domain.Enums.EstadoPedido.Listo)
            {
                order.Estado = SistemaMozoQr.Domain.Enums.EstadoPedido.Entregado;
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
                mesa = await _mesaRepository.GetByIdAsync(parsedId);
            }
        }

        if (mesa == null) 
            return NotFound("La mesa solicitada no existe o parámetros incompletos.");

        // Validar que la mesa esté activa (PIN configurado)
        if (string.IsNullOrEmpty(mesa.CodigoAcceso) || mesa.Estado == SistemaMozoQr.Domain.Enums.EstadoMesa.Disponible)
            return BadRequest(new { message = "La mesa se encuentra inactiva. Solicite al mozo que la habilite.", code = "INACTIVA" });

        // Si no envía PIN, retornamos 401 para que el front pida el PIN
        if (string.IsNullOrEmpty(pin))
        {
            return Unauthorized(new { message = "Se requiere el PIN de la mesa.", mesaId = mesa.Id, numero = mesa.Numero });
        }

        if (mesa.CodigoAcceso != pin)
        {
            return BadRequest(new { message = "PIN incorrecto.", code = "PIN_INVALIDO" });
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

        // Obtener todos los items consumidos en la mesa (excluyendo cancelados)
        var orders = await _pedidoRepository.GetByMesaIdAsync(mesa.Id);
        var activeOrders = orders.Where(o => o.Estado != SistemaMozoQr.Domain.Enums.EstadoPedido.Cancelado).ToList();
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
            itemsConsumidos = itemsRes
        });
    }

    [HttpPost("{id:guid}/monto")]
    [Authorize(Roles = "Admin,SuperAdmin,Mozo")]
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
}
