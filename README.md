<h1 align="center">📦 MyLogist - Smart Inventory & Sales Management</h1>

<p align="center">
  <em>Plataforma SaaS integral para la optimización logística, control de stock y administración de ventas en tiempo real.</em>
</p>

<p align="center">
  <a href="#-english-version">English version below</a> | <a href="#-versión-en-español">Versión en español abajo</a>
</p>

---

## 🇬🇧 English Version

> Transforming traditional management into a high-performance, scalable cloud solution.

**MyLogist** is a comprehensive SaaS platform built to solve real-world logistical bottlenecks. It handles real-time inventory control, secure role-based staff management, and sales tracking, all wrapped in a decoupled, cloud-ready architecture. 

### 🛠️ Tech Stack (The Engine)

Putting technology at the forefront, this project leverages a robust and modern stack:

* **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Hibernate / JPA.
* **Frontend:** React (Hooks & Context API), Axios, Modular CSS3.
* **Database:** MySQL.
* **Infrastructure & DevOps:** AWS EC2 (Amazon Linux 2023), native deployments & selective containerization (Docker).

### 🎯 Scope & Dimension

MyLogist isn't just a CRUD app; it's a full-fledged business tool designed for scale:
* **Multi-Platform Experience:** 100% responsive interface. Manage stock, audit movements, and review sales from a smartphone with the same power as a desktop.
* **Professional Cash Cycle:** Controls shift openings/closings with physical validation, automatic generation of professional sales receipts, and monthly dynamic sales analytics.
* **Traceability:** Immutable movement history to ensure complete business transparency.

### 🧠 Technical Challenges & Code Quality

To ensure enterprise-level quality, several technical challenges were tackled during development:

1. **Lightning-Fast Dashboards (Data Optimization):** 
   Avoided the "over-fetching" problem by implementing strict **Data Transfer Objects (DTOs)** and optimized database queries. The frontend only receives the exact payload needed, reducing mobile data consumption and rendering summaries in milliseconds.
2. **Advanced Security & RBAC:**
   Implemented robust Role-Based Access Control (RBAC) via Spring Security and JWT. The system strictly isolates capabilities between Sales, Inventory, and Supplier management roles.
3. **Digital Signature Capture:**
   Engineered a custom module for manual digital signature capture utilizing a Signature Pad and file import functionality, adding a layer of legal/administrative validation to logistics movements.
4. **Cloud Infrastructure Tuning:**
   Deployed on **AWS utilizing Amazon Linux 2023**. Rather than defaulting to a 100% Dockerized environment for everything, specific tasks and local environments were optimized to run natively, demonstrating a deep understanding of OS-level configuration and deployment flexibility.

### 🚀 Deployment

The backend and frontend are optimized for rapid deployment on AWS. (Add your specific startup scripts or CI/CD pipeline notes here).

---
---

## 🇪🇸 Versión en Español

> Transformando la gestión tradicional en una solución en la nube escalable y de alto rendimiento.

**MyLogist** es una plataforma SaaS integral construida para resolver cuellos de botella logísticos del mundo real. Maneja control de inventario en tiempo real, gestión segura de personal basada en roles y seguimiento de ventas, todo bajo una arquitectura desacoplada y lista para la nube.

### 🛠️ Stack Tecnológico (El Motor)

Poniendo la tecnología en primer plano, este proyecto utiliza un stack robusto y moderno:

* **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Hibernate / JPA.
* **Frontend:** React (Hooks & Context API), Axios, CSS3 Modular.
* **Base de Datos:** MySQL.
* **Infraestructura & DevOps:** AWS EC2 (Amazon Linux 2023), despliegues nativos y contenedorización selectiva (Docker).

### 🎯 Dimensión del Proyecto

MyLogist no es un simple CRUD; es una herramienta empresarial completa diseñada para escalar:
* **Experiencia Multiplataforma:** Interfaz 100% responsive. Gestioná tu stock, auditá movimientos y revisá ventas desde un smartphone con la misma potencia que en una PC.
* **Ciclo de Caja Profesional:** Control de apertura y cierre de turnos con validación física, generación automática de tickets de venta y analítica dinámica de evolución mensual.
* **Trazabilidad Total:** Historial de movimientos inalterable para garantizar la absoluta transparencia del negocio.

### 🧠 Desafíos Técnicos y Calidad de Código

Para garantizar una calidad a nivel *Enterprise*, se resolvieron varios desafíos técnicos complejos:

1. **Dashboards de Carga Instantánea (Optimización de Datos):** 
   Se evitó el problema de "sobre-búsqueda" (over-fetching) implementando estrictos **Data Transfer Objects (DTOs)** y consultas optimizadas. El frontend solo recibe la información exacta, reduciendo el consumo de datos móviles y renderizando en milisegundos.
2. **Seguridad Avanzada y RBAC:**
   Implementación de Control de Acceso Basado en Roles (RBAC) mediante Spring Security y JWT. El sistema aísla estrictamente los permisos entre los perfiles de Ventas, Inventario y Proveedores.
3. **Captura de Firmas Digitales:**
   Desarrollo de un módulo a medida para la captura manual de firmas digitales utilizando un Signature Pad y funcionalidad de importación de archivos, sumando una capa de validación administrativa a los movimientos logísticos.
4. **Tuning de Infraestructura Cloud:**
   Desplegado en **AWS utilizando Amazon Linux 2023**. En lugar de depender de un entorno 100% Dockerizado para todo, tareas específicas y entornos locales fueron optimizados para correr de forma nativa, demostrando un profundo entendimiento de la configuración a nivel de sistema operativo.

### 🚀 Despliegue en Producción

El backend y frontend están optimizados para un despliegue rápido en AWS.
