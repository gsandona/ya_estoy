# MozoGo • Documentación Técnica del Sistema

Esta documentación describe la arquitectura de software, infraestructura, tecnologías, configuración local y la referencia completa de la API HTTP del sistema **MozoGo (Ya Estoy)**. Está dirigida a desarrolladores, DevOps y arquitectos de software.

---

## Índice de Contenidos
1. [Arquitectura General y Tecnologías](#1-arquitectura-general-y-tecnologías)
2. [Estructura del Backend (.NET 10)](#2-estructura-del-backend-net-10)
3. [Estructura del Frontend (Angular)](#3-estructura-del-frontend-angular)
4. [Estrategia Multi-Tenant y Seguridad](#4-estrategia-multi-tenant-y-seguridad)
5. [Configuración de Entornos y Despliegue](#5-configuración-de-entornos-y-despliegue)
6. [Referencia Completa de API (Guía Postman)](#6-referencia-completa-de-api-guía-postman)
7. [Comunicación en Tiempo Real (SignalR)](#7-comunicación-en-tiempo-real-signalr)

---

## 1. Arquitectura General y Tecnologías

El sistema está construido bajo un enfoque de **Arquitectura Limpia (Clean Architecture)** con una separación clara de responsabilidades en capas.

* **Backend:** ASP.NET Core Web API ejecutándose sobre **.NET 10.0**.
* **Base de Datos:** 
  - **PostgreSQL** en entornos de producción.
  - **SQLite** en desarrollo local (`local.db`) para máxima portabilidad sin dependencias externas complejas.
* **Frontend:** **Angular 18+** utilizando *Standalone Components*, *Signals API* para el control reactivo del estado, y *Tailwind CSS* para el diseño visual.
* **Tiempo Real:** **ASP.NET Core SignalR** para la sincronización instantánea bidireccional entre comensal, mozo, cocina y caja.
* **Notificaciones Push:** Integración del protocolo VAPID / Web Push para avisar a los mozos incluso con la pantalla bloqueada.

---

## 2. Estructura del Backend (.NET 10)

El backend está organizado en cuatro proyectos principales:

1. **SistemaMozoQr.Domain (Dominio):**
   - Contiene las entidades puras de negocio (`Pedido`, `Mesa`, `MenuItem`, `Venta`, `Usuario`, `Restaurante`, etc.).
   - Define las interfaces del core (`IMustHaveTenant`, `ICurrentUserService`).
   - Libre de dependencias externas o de base de datos.
2. **SistemaMozoQr.Application (Aplicación):**
   - Aloja la lógica de negocio, validaciones de PIN y el servicio principal de orquestación de pedidos (`PedidoService`).
   - Define las interfaces de repositorios y servicios externos.
3. **SistemaMozoQr.Infrastructure (Infraestructura):**
   - Implementa el acceso a datos mediante **Entity Framework Core**.
   - Contiene las migraciones de base de datos (`Migrations`), el DbContext (`RestauranteDbContext`) y las implementaciones de repositorios.
   - Configura el soporte multi-tenant con filtros globales.
4. **SistemaMozoQr.WebApi (API de Entrada):**
   - Contiene los controladores REST (`Controllers`), los middlewares (manejo de excepciones globales, extracción de tenant) y la configuración de inyección de dependencias (`Program.cs`).

---

## 3. Estructura del Frontend (Angular)

El frontend está estructurado de manera modular y perezosa (lazy-loaded):
* **`/core`:** Contiene servicios transversales e inmutables (`AuthService`, `SignalrService`, `RestauranteService`), modelos de datos e interceptores HTTP.
* **`/features`:** Agrupa las pantallas y componentes funcionales por áreas de negocio:
  - `/client`: Experiencia del comensal (`PedidoComponent`).
  - `/auth`: Login y selección de mozo.
  - `/admin`: Dashboard, caja, cocina, ventas y métricas.
* **`/shared`:** Componentes reutilizables de UI (botones, modales, alertas, tuberías).

---

## 4. Estrategia Multi-Tenant y Seguridad

### 4.1 Aislamiento de Base de Datos
El sistema implementa un enfoque de **Base de Datos Compartida con Esquema Compartido** (Shared Database, Shared Schema). La separación se garantiza mediante:
1. La interfaz `IMustHaveTenant`:
   ```csharp
   public interface IMustHaveTenant
   {
       public Guid RestauranteId { get; set; }
   }
   ```
2. Un filtro de consulta global en `RestauranteDbContext.cs` que inyecta automáticamente el tenant actual a menos que el usuario sea `SuperAdmin` con bypass activado:
   ```csharp
   modelBuilder.Entity<Mesa>().HasQueryFilter(e => BypassTenantFilter || e.RestauranteId == CurrentTenantId);
   ```

### 4.2 Extracción de Tenant
Cada petición HTTP (excepto login y escaneo inicial de QR) viaja con un encabezado `Authorization: Bearer <JWT>`. El token contiene un *claim* llamado `"RestauranteId"`. 
El servicio `CurrentUserService` extrae este valor de los *claims* en cada request, lo que alimenta dinámicamente al filtro de EF Core para esa transacción.

---

## 5. Configuración de Entornos y Despliegue

### 5.1 Entorno Local (Desarrollo)
En desarrollo local, el sistema se autoconfigura para correr sin configurar Postgres:
* Si la cadena de conexión en `appsettings.json` o `appsettings.Development.json` no apunta a un servidor real, EF Core usa SQLite sobre `local.db`.
* Al iniciar (`Program.cs`), si detecta SQLite, ejecuta `context.Database.EnsureCreated()` para crear las tablas instantáneamente sin aplicar migraciones complejas incompatibles de Postgres.

### 5.2 Producción
* Servidor Postgres real.
* Configuración del middleware de base de datos para correr `context.Database.Migrate()` en el arranque (aplica los scripts SQL generados por el control de versiones).

---

## 6. Referencia Completa de API (Guía Postman)

### 6.1 Autenticación (Auth)
#### `POST /api/auth/login`
Autentica a un usuario del personal (mozo, admin, caja) y devuelve el token JWT.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "username": "admin_demo",
    "password": "demo1234"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin_demo",
    "role": "Admin",
    "restauranteId": "77777777-7777-7777-7777-777777777777",
    "restauranteNombre": "TuRestaurante Demo"
  }
  ```

---

### 6.2 Comensal y Escaneo de Mesa
#### `POST /api/mesa/escanear/{tokenQR}`
Verifica un código QR al ser escaneado por el comensal. Si la mesa está libre, abre una nueva sesión y devuelve un PIN de 4 dígitos.
* **URL Params:** `tokenQR` (Ej. `PASIVA_QR_1`)
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "mesaId": "88888888-8888-8888-8888-000000000001",
    "numero": 1,
    "codigoAcceso": "3829",
    "estado": "Ocupada",
    "restauranteNombre": "La Pasiva",
    "restauranteId": "33333333-3333-3333-3333-333333333333"
  }
  ```

#### `POST /api/mesa/{mesaId}/llamar-mozo`
Crea una alerta/tarea en el sistema notificando que la mesa necesita atención.
* **URL Params:** `mesaId` (Guid)
* **Headers:** `X-Mesa-PIN: 3829` (PIN devuelto en el escaneo)
* **Respuesta (200 OK):** `"Llamado registrado correctamente."`

---

### 6.3 Pedidos
#### `POST /api/pedido`
Envía una orden de comida y bebida desde la mesa del cliente. Requiere validación del PIN.
* **Headers:** `X-Mesa-PIN: 3829`
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "mesaId": "88888888-8888-8888-8888-000000000001",
    "items": [
      {
        "menuItemId": "55555555-5555-5555-5555-555555555555",
        "cantidad": 2
      },
      {
        "menuItemId": "66666666-6666-6666-6666-666666666666",
        "cantidad": 1
      }
    ]
  }
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "pedidoId": "99999999-9999-9999-9999-999999999999",
    "estado": "Recibido",
    "total": 4500.00
  }
  ```

---

### 6.4 POS y Administración de Mesas (Caja/Admin)
*Todos los endpoints de esta sección requieren la cabecera `Authorization: Bearer <JWT>`.*

#### `GET /api/mesasconfig`
Obtiene la lista de todas las mesas del restaurante con su estado, consumos y mozos asignados.
* **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "88888888-8888-8888-8888-000000000001",
      "numero": 1,
      "ubicacion": "Terraza",
      "estado": "Ocupada",
      "montoConsumo": 4500.00,
      "codigoAcceso": "3829",
      "mozoId": "99999999-9999-9999-9999-999999999999"
    }
  ]
  ```

#### `POST /api/mesasconfig/{id}/agregar-consumo`
Añade un consumo manual o plato extra a la mesa sin que pase por el QR del cliente.
* **URL Params:** `id` (Mesa Id)
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "menuItemId": "55555555-5555-5555-5555-555555555555",
    "cantidad": 1
  }
  ```

#### `POST /api/mesasconfig/{id}/cerrar`
Registra el pago, vacía la mesa, archiva la venta y restablece el estado a "Disponible".
* **URL Params:** `id` (Mesa Id)
* **Respuesta (200 OK):** `"Mesa cerrada y cobro registrado con éxito."`

---

### 6.5 Métricas y Ventas
#### `GET /api/ventas/productos`
Devuelve el desglose de productos vendidos agregados y ordenados de mayor a menor cantidad.
* **Query Params:** `startUtc` (ISO Date), `endUtc` (ISO Date)
* **Respuesta (200 OK):**
  ```json
  [
    {
      "producto": "Hamburguesa Completa",
      "cantidad": 42,
      "recaudacion": 189000.00
    },
    {
      "producto": "Pinta IPA",
      "cantidad": 38,
      "recaudacion": 76000.00
    }
  ]
  ```

---

## 7. Comunicación en Tiempo Real (SignalR)

El Hub de comunicación en tiempo real está expuesto en `/hubs/mozo`.

### Eventos del Servidor (Server-to-Client):
* `"MesaActualizada"`: Avisa a las terminales de administración que el estado de una mesa cambió (ej. de Disponible a Ocupada o Solicitó Cuenta).
* `"NuevaTarea"`: Notifica a los mozos que hay una tarea pendiente (Llamado de mesa, Pedido Listo).
* `"PedidoActualizado"`: Avisa a los comensales que el estado de su orden cambió (ej. de Recibido a En Preparación o Listo).
