# MozoGo • Documentación Funcional (Wiki de Referencia)

Este documento sirve como la wiki funcional oficial del sistema **MozoGo (Ya Estoy)**. Está diseñado para analistas funcionales, desarrolladores y personal operativo que requieran entender las reglas de negocio, los flujos de usuario, las restricciones del sistema y el comportamiento esperado de cada módulo.

---

## Índice de Contenidos
1. [Resumen del Sistema](#1-resumen-del-sistema)
2. [Roles de Usuario y Matriz de Permisos](#2-roles-de-usuario-y-matriz-de-permisos)
3. [Módulos del Sistema](#3-módulos-del-sistema)
   - [3.1 Módulo del Comensal (Pedido QR)](#31-módulo-del-comensal-pedido-qr)
   - [3.2 Módulo de Cocina](#32-módulo-de-cocina)
   - [3.3 Módulo de Administración y Caja (Dashboard)](#33-módulo-de-administración-y-caja-dashboard)
   - [3.4 Módulo de Mozos](#34-módulo-de-mozos)
   - [3.5 Módulo de Super Administrador](#35-módulo-de-super-administrador)
4. [Reglas de Negocio Críticas](#4-reglas-de-negocio-críticas)
5. [Flujos de Trabajo y Casos de Uso](#5-flujos-de-trabajo-y-casos-de-uso)
6. [Restricciones y Validaciones](#6-restricciones-y-validaciones)

---

## 1. Resumen del Sistema

**MozoGo** es una plataforma multi-inquilino (SaaS) orientada a la digitalización del servicio en el nicho de restaurantes, cervecerías y cafeterías. 

Su propuesta de valor radica en permitir que el cliente realice pedidos desde su mesa escaneando un código QR único, eliminando esperas y derivando tareas en tiempo real a la cocina, la caja y los mozos. El sistema es multi-tenant, lo que significa que múltiples restaurantes comparten la misma base de datos, pero la información está estrictamente aislada a nivel de software.

---

## 2. Roles de Usuario y Matriz de Permisos

El sistema se compone de los siguientes roles, cada uno con un acceso de nivel rígido:

| Rol | Descripción Funcional | Permisos Clave |
| :--- | :--- | :--- |
| **SuperAdmin** | Administrador global del sistema (SaaS). | ABM de Restaurantes, Inicializar datos (*seed*), lectura de logs globales del sistema (errores y auditorías). |
| **Admin** | Gerente o propietario del restaurante. | Gestión total de la carta (categorías e ítems), creación de mesas, asignación de mozos, visualización de métricas de ventas. |
| **Caja** | Operador de facturación y cobro. | Cierre de mesa definitivo, inserción de cargos extra manuales (ej. cubiertos, postres especiales), visualización de cobros del día. |
| **Mozo** | Personal de salón. | Gestión de tareas pendientes en tiempo real (llamados de mesa, pedidos listos, solicitudes de cuenta), reasignación de mesas. |
| **MozoPortal** | Cuenta genérica para terminales en salón. | Acceso rápido para que cualquier mozo elija su perfil y empiece a operar. |
| **Cocina** | Personal de preparación. | Vista en pantalla de pedidos en preparación, cambio de estado a "Listo" para retirar. |
| **Comensal** | Cliente final (sin login). | Escanear QR, auto-pedido, solicitar mozo, solicitar cuenta, dividir cuenta en pantalla. |

---

## 3. Módulos del Sistema

### 3.1 Módulo del Comensal (Pedido QR)
Se accede escaneando el código QR de la mesa. Genera una URL en formato `/mesa/{nombre-restaurante}/{numero-mesa}`.
* **Barra de Navegación Inferior (3 Barras):**
  1. **Inicio:** Muestra el número de mesa y el **Monto Consumido** actual (acumulado e histórico de la sesión actual de la mesa). Ofrece el botón para "Llamar al mozo" y "Pedir la cuenta".
  2. **Menú:** Muestra la carta del restaurante clasificada por categorías. Permite añadir productos al carrito interactivo.
  3. **Cuenta:** Desglosa todos los platos consumidos con sus precios unitarios y el total a pagar. Incluye la funcionalidad de **Dividir Cuenta** que calcula montos fraccionados por comensal en tiempo real.
* **Flujo del Carrito:** El comensal puede agregar ítems, modificar cantidades y enviar el pedido. Al confirmarse el pedido, este viaja a la base de datos y notifica instantáneamente a la Cocina y al Mozo asignado.

### 3.2 Módulo de Cocina
Diseñado para pantallas rígidas (KDS - Kitchen Display System) dentro de la cocina.
* **Pantalla de Pedidos:** Muestra tarjetas ordenadas cronológicamente con los pedidos confirmados por los comensales.
* **Detalle del Pedido:** Indica mesa, hora de ingreso y lista de platos con sus respectivas cantidades.
* **Estados de Preparación:**
  - **En Preparación:** El cocinero toma el pedido (cambia a color de alerta).
  - **Listo:** El pedido se marca como finalizado. Envía automáticamente una notificación push y una tarea por SignalR al mozo de la mesa avisándole que debe retirar y servir la comida.

### 3.3 Módulo de Administración y Caja (Dashboard)
El centro neurálgico del local.
* **Inicio (Métricas Rápidas):** Panel visual con el total facturado, tareas cerradas/pendientes en el día, mesas más utilizadas y rendimiento de mozos (tareas completadas).
* **Control de Mesas:** Mapeo del salón en tiempo real. Las mesas se muestran según su estado:
  - **Disponible (Gris):** Sin clientes activos. Código QR listo para escanear.
  - **Ocupada (Verde):** Clientes con un PIN de sesión activo y consumos en curso.
  - **Solicitó Cuenta (Rojo):** Clientes que pidieron la cuenta desde la web app. Alerta a la Caja para procesar el ticket.
* **POS de Caja:** Al seleccionar una mesa ocupada, permite:
  - Agregar consumos extra manualmente (platos que no se pidieron por el QR).
  - Aplicar recargos o bonificaciones directas al monto de la mesa.
  - Imprimir ticket de pre-cuenta.
  - **Cierre de Mesa:** Confirma el cobro de la mesa, liberando el PIN y marcándola nuevamente como "Disponible". Guarda la transacción histórica en el registro de ventas.
* **Configuración:** ABM de categorías del menú, ítems de la carta (con foto, precio, descripción, disponibilidad), ABM de usuarios/mozos y parámetros generales del restaurante.
* **Ventas:** Historial analítico de todas las mesas cerradas, exportación y desglose de recaudación por fecha.
* **Métricas de Menú:** Gráficos y tablas que muestran los platos más vendidos del restaurante y la recaudación que generan.

### 3.4 Módulo de Mozos
Vista móvil simplificada para el camarero del salón.
* **Switch Superior (Mesas / Tareas):**
  - **Tareas (Default):** Bandeja de entrada en tiempo real de lo que ocurre en el salón. Muestra llamados de mesa (pedir mozo), solicitudes de cuenta y pedidos listos en cocina. Las tareas se ordenan automáticamente por prioridad y antigüedad.
  - **Mesas:** Vista del estado del salón asignado a su perfil.
* **Acciones del Mozo:**
  - Marcar tarea como "En Proceso" o "Completada".
  - Reasignar tareas o mesas a otro mozo en caso de sobrecarga de trabajo.

### 3.5 Módulo de Super Administrador
Acceso global para el soporte técnico y facturación SaaS.
* **Creación de Restaurantes:** Permite dar de alta nuevos clientes asignándoles un subdominio y base de datos aislada.
* **Semillero (Seed):** Inicialización de datos modelo (categorías iniciales, mesas por defecto, usuarios de prueba).
* **Visor de Logs:** Auditoría en vivo de operaciones del sistema y traza de errores para mantenimiento rápido del servidor.

---

## 4. Reglas de Negocio Críticas

1. **Aislamiento Multi-Tenant (Seguridad de Datos):** Ningún usuario de un Restaurante A puede ver, modificar o conocer la existencia de datos del Restaurante B. Esto aplica a ventas, pedidos, configuración y usuarios. La verificación ocurre a través del token JWT y filtros globales en las bases de datos.
2. **Ciclo de Vida de una Mesa (Código de Acceso):**
   - Una mesa disponible no tiene sesión activa.
   - El primer escaneo del código QR genera un **Código de Acceso (PIN) de 4 dígitos** y cambia el estado de la mesa a **Ocupada**.
   - Los pedidos subsiguientes desde esa mesa requieren la validación de este PIN para evitar que personas fuera del local envíen pedidos falsos.
   - Al facturar y cerrar la mesa en la caja, el PIN se destruye, la mesa pasa a **Disponible** y el acumulador de consumo vuelve a cero.
3. **Persistencia de Precios en Pedidos:** Cuando un pedido es guardado, el precio unitario del ítem se congela en el registro `PedidoItem`. Si el administrador cambia el precio del menú posteriormente, los pedidos ya guardados o facturados mantienen el valor histórico correspondiente a la fecha en que se realizaron.
4. **Prioridad de Tareas de Mozos:** El algoritmo de ordenamiento en la bandeja de tareas del mozo tiene la siguiente prioridad rígida:
   1. *Pedido Listo* (Comida enfriándose, máxima prioridad).
   2. *Llamado de Mesa* (Cliente esperando atención).
   3. *Cuenta* (Cliente queriendo pagar).
   4. *Preparación* (Pedidos recibidos pendientes de proceso).

---

## 5. Flujos de Trabajo y Casos de Uso

### Caso de Uso 1: El Cliente realiza un Auto-Pedido
1. El comensal escanea el QR. La app web detecta que la mesa no tiene sesión y genera el PIN (ej: `1234`), mostrándolo en pantalla grande.
2. El comensal navega al **Menú**, agrega 2 Cervezas y 1 Pizza al carrito y pulsa "Confirmar Pedido".
3. El sistema solicita el PIN. El comensal lo ingresa.
4. El pedido se inserta con estado `Recibido`.
5. Se dispara una notificación por SignalR a la pantalla de **Cocina** y una tarea de tipo `Pedido` al **Mozo** asignado a esa mesa.

### Caso de Uso 2: Cierre de Mesa y Cobro
1. El comensal selecciona "Pedir la Cuenta" desde el móvil.
2. La mesa cambia de color a **Rojo** (Solicitó cuenta) en el Dashboard del Admin/Caja. Se genera una alerta sonora y visual.
3. El Mozo o el Cajero se acerca a confirmar el método de pago.
4. El Cajero abre el **POS de Caja**, añade opcionalmente 2 servicios de cubiertos (cargos manuales extras) y pulsa "Cerrar Mesa y Facturar".
5. El sistema genera el registro histórico en `Ventas` con el total de los pedidos + los cargos extra, limpia el PIN de la mesa y la vuelve a marcar como "Disponible".

---

## 6. Restricciones y Validaciones

* **Restricción de Categoría del Menú:** No se puede eliminar una categoría si tiene ítems de menú asociados (evita inconsistencias de huérfanos).
* **Validación de Rango de Mesas:** El número de mesa debe ser un valor entero entre `1` y `999`. No se permiten duplicados dentro del mismo inquilino (Restaurante).
* **Autenticación Expirada:** El token JWT del personal del restaurante expira cada 24 horas, forzando la renovación de credenciales por seguridad informática.
* **Control de Stock Dinámico (Ítem Activo):** Si el Administrador desmarca la casilla "Activo" en un plato de la carta, este desaparece en tiempo real del menú de todos los comensales que estén navegando la web app en ese momento.
