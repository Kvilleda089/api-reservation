# ReservaFácil API

API REST para la gestión de reservas de canchas, salones y otros espacios.

> Proyecto desarrollado como parte de una plataforma de gestión de reservas, enfocada en aplicar principios de arquitectura de software, separación de responsabilidades y buenas prácticas de desarrollo backend.

---

## 📋 Descripción

ReservaFácil es una API REST desarrollada para gestionar la administración de reservas de espacios como canchas, salones y otros establecimientos.

La aplicación permite gestionar clientes, empleados y reservaciones, así como registrar anticipos asociados a una reserva. Además, cuenta con autenticación y autorización basada en roles para controlar el acceso a las diferentes funcionalidades del sistema.

El proyecto está diseñado con una arquitectura modular utilizando **NestJS, Prisma y PostgreSQL**, aplicando el patrón **CQRS** para separar las operaciones de escritura y consulta.

Esta API forma parte de una plataforma que posteriormente será integrada con una aplicación web, una aplicación móvil y diferentes microservicios.

---

## 🏃 Compilar y ejecutar el proyecto

Sigue estos pasos para configurar y ejecutar la aplicación de forma local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Kvilleda089/api-reservation
cd api-reservation
```

### 2. Instalación Dependencias

```bash
npm install
```

### 3. Configuraciones variables de entorno

Crea un `.env` archivo del directorio raíz utilizando el `.env.example` archivo como referencia.

```bash
cp .env.example .env
```

Configura las variables de entorno necesarias en el archivo `.env`.

### 4. Iniciar la base de datos

El proyecto incluye un archivo `docker-compose.yml` con la configuración necesaria para PostgreSQL.

```bash
docker compose up -d
```

Comprueba que el contenedor de la base de datos esté en funcionamiento:

```bash
docker compose ps
```

### 5. Ejecutar migraciones de Prisma

Una vez que PostgreSQL esté en funcionamiento, aplica las migraciones de la base de datos:

```bash
npx prisma migrate deploy
```

### 6. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 7. Ejecuta la aplicación

```bash
npm run start:dev
```
La API estará disponible en:

```text
http://localhost:3000
```

### 8.  Detener la base de datos

Cuando termines de utilizar la aplicación:

```bash
docker compose down
```

---

## ⚙️ Environment variables

El proyecto incluye un archivo `.env.example` que contiene las variables de entorno necesarias para ejecutar la aplicación.

Ejemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reserva_facil"

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
```
Crea tu archivo `.env` local a partir de `.env.example` y configura los valores según tu entorno.


## ✨ Características

- 👤 Gestión de empleados.
- 🔐 Autenticación mediante usuario y contraseña.
- 🎫 Autenticación basada en JWT.
- 🛡️ Protección de rutas mediante Guards.
- 👥 Autorización basada en roles.
- 👤 Gestión de clientes.
- 📅 Creación y gestión de reservaciones.
- 🔎 Validación de disponibilidad de recursos.
- 🏟️ Gestión de diferentes recursos, como canchas y salones.
- 💰 Registro de anticipos asociados a una reservación.
- 📋 Consulta del historial de reservaciones de un cliente.
- 🧩 Arquitectura modular con NestJS.
- 🔄 Implementación del patrón CQRS.
- 🗄️ Persistencia de datos mediante Prisma ORM.
- 🐘 PostgreSQL como sistema gestor de base de datos.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución |
| **NestJS** | Framework backend |
| **TypeScript** | Lenguaje de programación |
| **Prisma** | ORM |
| **PostgreSQL** | Base de datos |
| **JWT** | Autenticación |
| **Passport** | Estrategia de autenticación |
| **bcrypt** | Hash de contraseñas |
| **CQRS** | Separación de comandos y consultas |

---

## 🏗️ Arquitectura

La API forma parte de una arquitectura que contempla una aplicación web, una aplicación móvil y diferentes microservicios.

![Diagrama de arquitectura](./docs/ReservaFacil-Diagrama%20Arquitectura%20-%20API%20%20RESERVATION.jpg)

### Componentes principales

- **Web:** aplicación web para la gestión de reservas.
- **Mobile:** aplicación móvil.
- **ReservaFácil API:** API principal encargada de la gestión de reservas, clientes, empleados y anticipos.
- **PostgreSQL:** almacenamiento de la información principal.
- **Microservicio de Notificaciones:** encargado del envío y procesamiento de notificaciones.
- **Microservicio de Documentos:** encargado de la generación y gestión de documentos PDF.

> Los microservicios de notificaciones y documentos forman parte de las siguientes etapas de desarrollo del proyecto.

---

## 🗃️ Modelo entidad-relación

El siguiente diagrama representa el modelo de datos utilizado por la aplicación.

![Diagrama ER](./docs/ER%20-%20ReservaFacil.png)

---

## 📁 Estructura del proyecto

El proyecto utiliza una estructura modular basada en las funcionalidades principales de la aplicación.

```text
src/
├── modules/
│   ├── auth/
│   ├── clients/
│   ├── employees/
│   ├── reservations/
│   └── ...
│
├── common/
│
├── generated/
│
└── main.ts