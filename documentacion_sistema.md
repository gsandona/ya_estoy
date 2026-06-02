# Documentación Técnica y Funcional del Sistema - MozoGo

Esta documentación describe la arquitectura, el modelo de datos, las reglas de negocio y la guía de APIs para el sistema **MozoGo**.

---

## 1. Arquitectura del Sistema

El sistema está desarrollado con tecnologías modernas y sigue patrones de diseño estándar para garantizar escalabilidad, mantenibilidad y segregación de datos.

### 1.1. Backend (ASP.NET Core Web API)
El backend está estructurado bajo los principios de **Clean Architecture** (Arquitectura Limpia) y **Domain-Driven Design (DDD)**, dividido en cuatro capas principales:

```
[ SistemaMozoQr.WebApi ]  --> Capa de presentación (Controllers, Middlewares, SignalR Hubs)
         |
         v
[ SistemaMozoQr.Application ] --> Casos de uso (Interfaces, Servicios, DTOs, validaciones)
         |
         v
[ SistemaMozoQr.Infrastructure ] -> Acceso a datos (EF Core, Repositorios, Migraciones)
         |
         v
[ SistemaMozoQr.Domain ]     --> Lógica del dominio (Entidades, Enums, Interfaces de negocio)
```

- **Multi-Tenant (Aislamiento de Datos):** Implementado mediante **Global Query Filters** en EF Core. Todos los inquilinos (restaurantes) comparten la misma base de datos física, pero sus datos se filtran automáticamente a nivel de repositorio usando la cabecera `X-Tenant-ID` (para administradores) o la propiedad `TenantId` incrustada en los JWT (para mozos).
- **Notificaciones en Tiempo Real:** Utiliza **SignalR** para conectar el cliente (mesa) con el dashboard de administración, permitiendo a los mozos recibir notificaciones instantáneas de llamados, pedidos y pedidos de cuentas.

### 1.2. Frontend (Angular + Capacitor)
El frontend es una Single Page Application (SPA) responsiva y moderna:
- **Angular 18:** Utiliza *Standalone Components*, *Signals* para manejo de estados reactivos rápidos, y *Router Component Input Bindings*.
- **Tailwind CSS:** Diseño UI móvil-primero de alto impacto estético, transiciones suaves y micro-animaciones premium.
- **Capacitor:** Permite empaquetar el frontend como aplicación nativa en plataformas Android e iOS.

---

## 2. Modelo de Base de Datos y Conexión

El backend utiliza **Entity Framework Core** para el mapeo objeto-relacional (ORM). 

### 2.1. Cadena de Conexión
La configuración de base de datos se encuentra en `appsettings.json` o `appsettings.Development.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=SistemaMozoQrDb;User Id=postgres;Password=admin"
}
```

### 2.2. Entidades Principales
- **Restaurante (Tenant):** El centro del multi-inquilinato. Representa un comercio.
- **Usuario:** Empleados del comercio con roles asociados: `Admin` (gestor del local), `Mozo` (atención a mesas) y `SuperAdmin` (gestión global del sistema).
- **Mesa:** Puntos de atención al cliente. Tienen un número, una ubicación y un código de acceso de 4 dígitos (PIN) que cambia dinámicamente cuando la mesa es abierta.
- **MenuItem:** Platos o bebidas que conforman el menú digital de un restaurante.
- **Pedido:** Compra orquestada de productos realizada por una mesa.
- **PedidoItem:** Líneas individuales del pedido con cantidad y precio unitario.
- **MesaTask:** Tareas en segundo plano o notificaciones activas para los mozos (Llamados, Cuentas, Pedidos).

### 2.3. Auditoría Automática
En el método `SaveChangesAsync` de `RestauranteDbContext`, el sistema intercepta las entidades modificadas antes de guardarse en la base de datos y:
- Registra automáticamente las operaciones (Inserción, Modificación, Eliminación) en la tabla `Auditorias`.
- Vincula automáticamente el `RestauranteId` correcto a la auditoría, evitando filtraciones de registros entre locales.

---

## 3. Análisis Funcional y Reglas de Negocio

El sistema automatiza el flujo de atención al cliente en restaurantes mediante códigos QR dinámicos.

### 3.1. Flujo de Habilitación de Mesas (Negocio)
1. **Estado Inactivo (Disponible):** Por defecto, la mesa está "libre" y su `CodigoAcceso` es `null`. Si un cliente escanea el QR en este estado, el sistema **no le permite** ordenar y le muestra un error informando que la mesa se encuentra inactiva.
2. **Apertura de Mesa:** Un Mozo o Administrador inicia la mesa desde el panel de control. El backend realiza las siguientes operaciones:
   - Cambia el estado a `Ocupada`.
   - Genera un **PIN aleatorio de 4 dígitos** (por ejemplo, `5821`).
   - Retorna el PIN para que el mozo se lo brinde al cliente.
3. **Acceso del Cliente:** El cliente escanea el código QR de la mesa `1`. La aplicación le solicita el PIN de 4 dígitos. Al ingresar el PIN correcto, el cliente queda autenticado temporalmente contra esa mesa y se le despliega el menú digital.
4. **Cierre de Mesa:** Cuando el cliente paga y se retira, el mozo pulsa "Cerrar" en el dashboard. Esto:
   - Restablece el estado de la mesa a `Disponible`.
   - Borra el PIN (`CodigoAcceso = null`), invalidando cualquier sesión activa del cliente.

### 3.2. Solicitudes de Servicio
El cliente autenticado en la mesa puede realizar tres acciones principales en tiempo real:
- **🛎️ Llamar Mozo:** Registra una tarea tipo `Llamado`. El mozo asignado a la mesa recibe una alerta sonora/visual instantánea en el dashboard.
- **📖 Enviar Pedido:** Envía la lista del canasto de compras a la cocina, registrando una tarea tipo `Pedido`.
- **💳 Pedir Cuenta:** Solicita el cobro registrando una tarea tipo `Cuenta`.

---

## 4. Guía de APIs y Uso con Postman

A continuación se detallan los endpoints clave para utilizar el sistema desde Postman.

> [!IMPORTANT]
> - Para endpoints de administración/staff, es requerido enviar la cabecera `Authorization: Bearer <token_jwt>`.
> - Para administradores o SuperAdmins que deseen interactuar con un comercio específico, deben añadir la cabecera `X-Tenant-ID: <GUID_DEL_RESTAURANTE>`.

### 4.1. Autenticación (Login)
- **Endpoint:** `POST /api/auth/login`
- **Cabeceras:** `Content-Type: application/json`
- **Cuerpo (JSON):**
```json
{
  "email": "mozo@sabor.com",
  "password": "1234"
}
```
- **Respuesta exitosa (200 OK):**
```json
{
  "id": "10000000-0000-0000-0000-000000000002",
  "email": "mozo@sabor.com",
  "role": "Mozo",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4.2. Abrir Mesa (Waiters/Staff Only)
- **Endpoint:** `POST /api/mesas/{id}/abrir`
- **Cabeceras:** 
  - `Authorization: Bearer <token_jwt>`
- **Cuerpo:** Vacío.
- **Respuesta exitosa (200 OK):**
```json
{
  "id": "11111000-0000-0000-0000-000000000001",
  "numero": 1,
  "estado": 1,
  "codigoAcceso": "4952"
}
```

### 4.3. Verificar Mesa (Anonymous / Client App)
- **Endpoint:** `GET /api/mesas/verify?mesaId={mesaId}&pin={pin}`
- **Parámetros de consulta (Query params):**
  - `mesaId` (puede ser el GUID o el número de la mesa, ej. `1`)
  - `pin` (PIN opcional. Si no se envía y la mesa está abierta, devolverá `401 Unauthorized` para que el front solicite el PIN).
- **Ejemplo de llamada sin PIN:** `GET /api/mesas/verify?mesaId=1`
- **Respuesta requerida de PIN (401 Unauthorized):**
```json
{
  "message": "Se requiere el PIN de la mesa.",
  "mesaId": "11111000-0000-0000-0000-000000000001",
  "numero": 1
}
```
- **Ejemplo de llamada con PIN correcto:** `GET /api/mesas/verify?mesaId=1&pin=4952`
- **Respuesta exitosa (200 OK):**
```json
{
  "mesaId": "11111000-0000-0000-0000-000000000001",
  "numero": 1,
  "estado": 1,
  "validado": true,
  "hasLlamado": false,
  "hasCuenta": false
}
```

### 4.4. Crear Pedido (Client App)
- **Endpoint:** `POST /api/pedido`
- **Cabeceras:** `Content-Type: application/json`
- **Cuerpo (JSON):**
```json
{
  "mesaId": "11111000-0000-0000-0000-000000000001",
  "items": [
    {
      "menuItemId": "88888888-8888-8888-8888-000000000015",
      "cantidad": 2
    },
    {
      "menuItemId": "88888888-8888-8888-8888-000000000014",
      "cantidad": 1
    }
  ]
}
```
- **Respuesta exitosa (200 OK):**
```json
{
  "pedidoId": "552a8b22-8610-410a-b32c-396df5d4529f",
  "total": 18500,
  "fecha": "2026-06-02T22:45:00Z"
}
```
