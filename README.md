# MyLogist - Gestión Inteligente de Inventarios & Ventas 🚀

**MyLogist** es una plataforma SaaS integral diseñada para optimizar la logística y administración de comercios en tiempo real. Desarrollada bajo una arquitectura moderna y desacoplada, MyLogist ofrece una experiencia de usuario fluida, robusta y preparada para la nube.

---

## 🌟 ¿Qué hace a MyLogist diferente? (v2.0)

He transformado una herramienta de gestión tradicional en una solución de alto rendimiento, enfocada en la eficiencia y la escalabilidad:

* **Dashboards de Carga Instantánea:** Gracias a la implementación de **DTOs** y consultas optimizadas a nivel de base de datos, el resumen del negocio se carga en milisegundos, ideal para dueños que necesitan información al paso.
* **Experiencia Multiplataforma:** Interfaz 100% **responsive**. Gestioná tu stock, revisá ventas y auditá movimientos desde tu smartphone con la misma potencia que en una PC.
* **Control Total y Auditoría:** * **RBAC (Role-Based Access Control):** Definí qué puede ver y hacer cada empleado (Ventas, Inventario, Proveedores).
    * **Historial de Movimientos:** Un registro inalterable de quién realizó cada acción para garantizar la transparencia del negocio.
* **Ciclo de Caja Profesional:** * Control de apertura y cierre de turnos con validación física.
    * Generación automática de tickets de venta profesionales.
    * Analítica de ventas mediante gráficos dinámicos de evolución mensual.
* **Infraestructura DevOps:** Proyecto totalmente **Dockerizado**, lo que garantiza un despliegue rápido y seguro en servidores AWS.

---

## 🛠️ Stack Tecnológico

* **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Hibernate.
* **Frontend:** React (Hooks & Context API), Axios, CSS3 Modular.
* **Base de Datos:** MySQL.
* **Infraestructura:** Docker & Docker Compose, AWS (EC2).

---

## 📊 Arquitectura de Datos Eficiente

MyLogist utiliza un modelo de transferencia de datos optimizado que evita el envío de objetos pesados al cliente. Mediante el uso de **Data Transfer Objects (DTOs)**, el frontend solo recibe la información exacta que necesita mostrar, eliminando cuellos de botella y reduciendo drásticamente el consumo de datos móviles.

---

## 🚀 Despliegue en Producción

El software está diseñado para ser puesto en marcha en segundos gracias a la contenedorización:

```bash
docker-compose up -d --build
