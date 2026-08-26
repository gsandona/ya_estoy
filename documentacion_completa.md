# Documentación Completa del Sistema - MozoGo (KDS & Multi-Tenant QR)

Este documento sirve como la guía técnica y funcional definitiva del sistema **MozoGo** para su comercialización y mantenimiento técnico profesional.

---

## 1. Resumen Ejecutivo del Producto
**MozoGo** es una solución integral de digitalización de mesas, comanda digital y notificaciones en tiempo real para el sector gastronómico. 
El sistema permite a los comensales:
1. Escanear un código QR asignado a una mesa física.
2. Ingresar un código PIN dinámico de seguridad de 4 dígitos proporcionado por el personal del local para abrir una sesión activa.
3. Explorar el menú digital del restaurante.
4. Enviar pedidos a cocina, solicitar asistencia del mozo o pedir la cuenta de forma directa.

Las alertas son enviadas de inmediato por **SignalR** al panel del personal (caja/mozos) y, en el caso de comisiones de platos, a la pantalla de la cocina.

---

## 2. Arquitectura de Software

El sistema utiliza una arquitectura desacoplada moderna:

```
                  +-----------------------------------+
                  |        Cliente Móvil (QR)         |
                  |     (Angular + Capacitor App)     |
                  +-----------------+-----------------+
                                    | HTTP / SignalR
                                    v
                  +-----------------+-----------------+
                  |   Backend ASP.NET Core Web API    |
                  |       (Clean Architecture)        |
                  +-----------------+-----------------+
                                    | EF Core ORM
                                    v
                  +-----------------+-----------------+
                  |  Base de Datos (PGSQL / SQLite)   |
                  +-----------------------------------+
```

### 2.1. Backend (ASP.NET Core 10 Web API)
Sigue los principios de **Clean Architecture** (Arquitectura Limpia) y **Domain-Driven Design (DDD)** para garantizar mantenibilidad e independencia de infraestructura:
- **`SistemaMozoQr.Domain`**: Contiene las entidades principales, enums básicos e interfaces de negocio puros, libres de dependencias de terceros.
- **`SistemaMozoQr.Application`**: Contiene la lógica de aplicación, casos de uso, DTOs de entrada/salida y contratos de interfaces de servicios (ej. `IAuthService`, `IPedidoService`).
- **`SistemaMozoQr.Infrastructure`**: Implementa el acceso a datos mediante Entity Framework Core, repositorios concretos, migraciones y la lógica de SignalR para notificaciones en tiempo real.
- **`SistemaMozoQr.WebApi`**: Capa de presentación que aloja controladores REST, middlewares de control de excepciones y los Hubs de SignalR.

### 2.2. Frontend (Angular 18)
Implementa una Single Page Application (SPA) móvil-primera optimizada para rendimiento y facilidad de uso:
- **Componentes Standalone**: Arquitectura moderna de Angular 18 sin módulos intermedios.
- **Angular Signals**: Manejo reactivo de estado para respuestas instantáneas en la UI.
- **Capacitor**: Empaquetado nativo para exportar la aplicación del cliente o el mozo directamente a Android (.apk) e iOS.
- **Tailwind CSS**: Diseño responsivo premium, estilizado en base a una paleta oscura sofisticada y animaciones fluidas.

---

## 3. Modelo de Base de Datos y Aislamiento Multi-Tenant

El sistema utiliza un esquema **Multi-Tenant (Single Database, Shared Schema)** con aislamiento riguroso:

### 3.1. Aislamiento por EF Core Global Query Filters
Toda entidad asociada a un comercio específico implementa la interfaz `IMustHaveTenant` y declara una clave `RestauranteId`. 
En el `RestauranteDbContext.cs`, se define un filtro global de consulta:
```csharp
modelBuilder.Entity<Mesa>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
```
- **`CurrentTenantId`**: Se extrae dinámicamente en cada petición mediante `CurrentUserService` a partir de los claims del token JWT (`TenantId`) para mozos y administradores locales, o desde la cabecera `X-Tenant-ID` en el caso del `SuperAdmin`.
- **`BypassTenantFilter`**: Se evalúa como `true` si el usuario tiene rol de `SuperAdmin`, permitiendo una visión global.

### 3.2. Asignación Automática de Tenant en Inserción
En el método sobreescrito `SaveChangesAsync()`, se interceptan las entidades nuevas que implementan `IMustHaveTenant`. Si su `RestauranteId` es nulo o vacío, el sistema inyecta el `CurrentTenantId` del usuario en sesión, previniendo inyecciones maliciosas de datos cruzados entre comercios.

### 3.3. Índices Base de Alto Rendimiento
Para garantizar alta velocidad de respuesta, se definen los siguientes índices:
- `Mesa`: Índice único compuesto en `(RestauranteId, Numero)` e índice simple en `TokenQR`.
- `Usuario`: Índice único en `Username` e índice simple en `RestauranteId`.
- `Pedido`: Índices en `RestauranteId`, `MesaId`, y un índice compuesto en `(MesaId, Estado)`.
- `Venta`: Índice compuesto en `(RestauranteId, FechaHora)`.
- `MesaTask`: Índice compuesto en `(RestauranteId, Status)`.

---

## 4. Roles y Seguridad de Endpoints

### 4.1. Definición de Roles del Sistema
1. **SuperAdmin**: Control total sobre el software. Administra comercios (tenants), gestiona widgets de dashboard globales, visualiza logs de auditoría generales y de errores.
2. **Admin**: Propietario o encargado del local. Administra el menú digital, configura sucursales locales, Mozos y Cajeros, visualiza estadísticas financieras y de productos, y gestiona el salón (mesas).
3. **Caja / Responsable**: Encargado de mesa y cobros. Puede visualizar todas las alertas del local, reasignar mozos a tareas y realizar cierres de mesa directos.
4. **Mozo**: Personal de atención en salón. El sistema restringe su visibilidad: **solo ve sus mesas asignadas y sus tareas/alertas correspondientes**, aislando su flujo de trabajo.
5. **Cocina**: Operario de preparación de platos. Solo tiene acceso al panel KDS de comandas.
6. **Comensal (Anónimo)**: Cliente en mesa. Puede registrar escaneos QR, verificar PINs, leer el menú de forma pública y enviar pedidos.

### 4.2. Políticas de Seguridad de Endpoints
Para proteger la API contra accesos indebidos, se implementan las siguientes políticas:
- **Autenticación obligatoria**: Mediante JWT configurado y validado en `Program.cs` (`[Authorize]`).
- **Verificación de pertenencia en modificaciones (Anti-Bypass)**: En endpoints administrativos que manipulan recursos por ID (`MenuController.Editar`, `MenuController.Eliminar`, `MesasConfigController.Cerrar`), el sistema recupera la entidad ignorando los filtros y valida que:
  ```csharp
  if (!_currentUserService.IsSuperAdmin() && entidad.RestauranteId != _currentUserService.GetRestauranteId())
  {
      return Forbid();
  }
  ```
  Esto evita ataques de ID cruzados de restaurantes competidores.
- **Isolación en Reportes Financieros**: En `VentasController.cs` se ha corregido el claim lookup para asociarse a `"TenantId"`. Las consultas de estadísticas se resuelven en base a los filtros globales del DbContext, bloqueando la fuga de datos financieros.

---

## 5. Estrategia de Ramas Git y Entornos

El desarrollo del proyecto está organizado en tres ambientes estables de despliegue mediante Git:

```
 [ desarrollo ] (Local / SQLite / localhost)
       |
       v (Pull Request)
  [ PreProd ]  (Staging / Postgres de pruebas)
       |
       v (Merge)
   [ main ]    (Producción / Render / SSL)
```

### 5.1. Entorno de Desarrollo (`desarrollo`)
- **Base de Datos**: SQLite local (`Data Source=local_dev.db`).
- **URLs**: `http://localhost:5122` (Backend) y local de desarrollo en frontend.
- **Objetivo**: Implementación rápida de características sin afectar entornos en la nube.

### 5.2. Entorno de Pre-Producción (`PreProd`)
- **Base de Datos**: SQLite staging (`preprod_dev.db`) o Base de pruebas PostgreSQL.
- **Configuración Frontend**: Declarada en `environment.preprod.ts` con API URL apuntando a la infraestructura de pruebas. Integrado en `angular.json` para compilación vía `npx ng build --configuration=preproduction`.
- **Configuración Backend**: Almacenada en `appsettings.PreProd.json`.

### 5.3. Entorno de Producción (`main`)
- **Base de Datos**: PostgreSQL alojada en la nube (Render / AWS). El backend parsea automáticamente URLs tipo `postgres://` al formato nativo ADO.NET.
- **Configuración Frontend**: Archivo `environment.ts` apuntando a `https://yaestoy.onrender.com`.
- **Configuración Backend**: Archivo `appsettings.json` general y variables de entorno del servidor para secretos de firma de tokens JWT.

---

## 6. Flujo del Sistema Detallado

### 6.1. Habilitación de Mesas
1. El mozo/cajero ve la Mesa 3 en estado *Disponible* (Código de acceso `null`). El cliente que intente escanear verá una pantalla de "Mesa Inactiva".
2. El mozo pulsa "Habilitar Mesa". El backend genera un código PIN de 4 dígitos aleatorio (ej: `5821`), cambia el estado a *Ocupada* y lo retorna al mozo.
3. El mozo le comunica el PIN de 4 dígitos al cliente.

### 6.2. Acceso y Compras del Cliente
1. El cliente escanea el código QR de la mesa (URL: `/mesa/restaurante-nombre/3`).
2. Se le solicita el PIN. Al ingresar `5821`, la sesión queda validada temporalmente y se carga el menú digital del comercio de forma pública.
3. El cliente añade platos al carrito de compras y pulsa "Enviar Pedido".
4. El sistema realiza una llamada HTTP POST a `/api/pedido` enviando los IDs de platos y cantidades con el PIN. El backend crea la comanda en estado `Recibido`, genera una tarea de mesa tipo `Pedido` y avisa vía SignalR.

### 6.3. Aprobación y Cocina (KDS)
1. El mozo o caja visualiza la tarea `Pedido` en su panel en estado "Por Aprobar". Cuenta con los botones:
   - **Aprobar**: Pasa el pedido al estado `Aprobado` y lo envía a la Cocina.
   - **Cancelar**: Pasa el pedido a `Cancelado` (eliminando la tarea).
2. En la Cocina (KDS), los pedidos aparecen en el panel moderno con fondo oscuro neutro (`bg-slate-900`/`bg-slate-950`). Cada pedido se identifica con un borde coloreado sutil según su etapa:
   - **En Cola (Aprobados)**: `border-l-sky-500` (Azul/Celeste). El cocinero puede presionar *Empezar a cocinar*.
   - **Preparando**: `border-l-amber-500` (Naranja). Al finalizar el plato, presiona *Terminar*.
   - **Listo**: `border-l-emerald-500` (Verde). Se envía notificación al mozo para retirar.
3. El mozo entrega la comida y marca la tarea como finalizada, actualizando el estado de la mesa a `Entregado`. El consumo del pedido se acumula automáticamente en el total de consumo de la mesa.

### 6.4. Cierre de Mesa Directo
1. Para cerrar la mesa, el mozo/cajero presiona "Cerrar Mesa" en su pantalla de mesas.
2. El sistema salta directamente el complejo flujo del POS/Factura manual (que solía mostrar estado de cuenta, cargos manuales, extras y ticket de pago). En su lugar, lanza un diálogo modal simple: *"¿Está seguro que desea cerrar la Mesa X?"*.
3. Al confirmar:
   - Se realiza la petición `POST /api/mesas/{id}/cerrar?sinFacturar=false`.
   - El backend recopila todos los pedidos entregados de la sesión activa, registra automáticamente el registro financiero de `Venta` en la base de datos (únicamente para estadísticas y métricas), y luego restablece el estado de la mesa a `Disponible` y el PIN a `null` (limpiando sesiones activas del cliente).
   - Se completan automáticamente todas las tareas pendientes de llamados o pedidos asociadas a la mesa.

---

## 7. Manual de Mantenimiento y Despliegue en Producción
Para desplegar el sistema en producción:
1. Clonar o descargar la rama `main` en el servidor.
2. Configurar la cadena de conexión de PostgreSQL en las variables de entorno de la máquina como `ConnectionStrings__DefaultConnection`.
3. Configurar la clave secreta JWT como `JwtSettings__Secret` en las variables de entorno para proteger la firma de tokens.
4. Construir y compilar el frontend Angular (`npm run build`). Colocar la carpeta `dist/frontend` en el servidor web.
5. Iniciar la aplicación backend .NET (`dotnet run` o configurar el servicio Kestrel con un proxy inverso como Nginx).
