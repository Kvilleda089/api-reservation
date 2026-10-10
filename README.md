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

---

## Crear el administrador inicial

La aplicación utiliza autenticación y autorización basada en roles. Por esta razón, una base de datos nueva necesita contar inicialmente con un usuario que tenga el rol SUPER_ADMINISTRATOR.

El proyecto incluye un script de inicialización mediante Prisma Seed.

Las variables utilizadas por el seed son:

SEED_ADMIN_FIRST_NAME=
SEED_ADMIN_SURNAME=
SEED_ADMIN_EMAIL=
SEED_ADMIN_USERNAME=
SEED_ADMIN_PASSWORD=

Estas variables deben configurarse únicamente cuando se vaya a ejecutar el proceso de inicialización del administrador.

Ejecuta:

npm run prisma:seed

El seed:

Verifica si ya existe un SUPER_ADMINISTRATOR.
Si no existe, crea el administrador inicial.
Genera el hash de la contraseña utilizando bcrypt.
Si ya existe un SUPER_ADMINISTRATOR, no crea otro administrador.

El seed está diseñado para poder ejecutarse de forma segura más de una vez. Si ya existe un SUPER_ADMINISTRATOR, el proceso no crea un usuario duplicado.

---

### 7. Ejecuta la aplicación

```bash
npm run start:dev
```

La API estará disponible en:

```text
http://localhost:3000
```

### 8. Detener la base de datos

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
- 🧪 Pruebas unitarias con Jest.
- ⚙️ Integración continua con GitHub Actions (lint, pruebas y build).

---

## 🛠️ Tecnologías utilizadas

| Tecnología         | Uso                                |
| ------------------ | ---------------------------------- |
| **Node.js**        | Entorno de ejecución               |
| **NestJS**         | Framework backend                  |
| **TypeScript**     | Lenguaje de programación           |
| **Prisma**         | ORM                                |
| **PostgreSQL**     | Base de datos                      |
| **JWT**            | Autenticación                      |
| **Passport**       | Estrategia de autenticación        |
| **bcrypt**         | Hash de contraseñas                |
| **CQRS**           | Separación de comandos y consultas |
| **Jest**           | Framework de pruebas               |
| **ts-jest**        | Ejecución de pruebas en TypeScript |
| **@nestjs/testing**| Utilidades de pruebas para NestJS  |
| **Supertest**      | Pruebas HTTP (e2e)                 |
| **ESLint / Prettier** | Calidad y formato de código     |

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

![Diagrama ER](./docs/ER%20-%20ReservaFacil.svg)

---

## 🧪 Pruebas

El proyecto cuenta con pruebas unitarias escritas con **Jest** y **ts-jest**. Cada handler de CQRS, guard, strategy y helper se prueba de forma aislada, por lo que **no se necesita base de datos ni Docker** para ejecutarlas: Prisma se reemplaza por un mock.

### Scripts disponibles

| Comando                | Descripción                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `npm test`             | Ejecuta todas las pruebas unitarias (`*.spec.ts`).                   |
| `npm run test:watch`   | Ejecuta las pruebas en modo observador; se repiten al guardar.       |
| `npm run test:cov`     | Ejecuta las pruebas y genera el reporte de cobertura en `./coverage`.|
| `npm run test:debug`   | Ejecuta Jest con el inspector de Node (`--runInBand`) para depurar.  |
| `npm run test:e2e`     | Ejecuta las pruebas e2e con `test/jest-e2e.json` (`*.e2e-spec.ts`).  |
| `npm run lint`         | Revisa el código con ESLint.                                         |
| `npm run lint:fix`     | Corrige automáticamente los problemas de ESLint.                     |
| `npm run format`       | Formatea `src` y `test` con Prettier.                                |

### Ejecutar pruebas específicas

```bash
# Un archivo
npx jest src/modules/auth/test/login.handler.spec.ts

# Todas las pruebas de un módulo
npx jest src/modules/reservations

# Solo las pruebas cuyo nombre coincida con un texto
npx jest -t "lanza ConflictException"

# En CI o para evitar concurrencia entre archivos
npm test -- --runInBand
```

### Configuración de Jest

La configuración vive en la sección `jest` del `package.json`:

| Opción                | Valor                          | Propósito                                                     |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| `roots`               | `src` y `test`                 | Directorios donde Jest busca pruebas.                         |
| `testRegex`           | `.*\.spec\.ts$`                | Identifica los archivos de pruebas unitarias.                 |
| `transform`           | `ts-jest`                      | Compila TypeScript al vuelo.                                  |
| `moduleNameMapper`    | `src/*` y `test/*`             | Permite imports absolutos como `src/...` y `test/helpers/...`.|
| `globalSetup`         | `test/global-setup.js`         | Fija la zona horaria en `UTC` para que las pruebas de fechas sean deterministas. |
| `collectCoverageFrom` | `src/**/*.(t|j)s`              | Archivos incluidos en el reporte de cobertura.                |
| `coverageDirectory`   | `./coverage`                   | Carpeta de salida de la cobertura.                            |
| `testEnvironment`     | `node`                         | Entorno de ejecución.                                         |

> Las pruebas e2e usan una configuración aparte (`test/jest-e2e.json`, patrón `.e2e-spec.ts$`). El script `test:e2e` está configurado, pero todavía no hay pruebas e2e escritas.

### Estructura y convenciones

Las pruebas viven dentro de una carpeta `test/` en cada módulo, junto al código que prueban, y se nombran `<nombre>.spec.ts`.

```text
src/
├── database/
│   └── test/
│       └── prisma-error.handler.spec.ts
└── modules/
    ├── auth/test/
    ├── clients/test/
    ├── employee/test/
    ├── reservation-deposit/test/
    ├── reservations/test/
    └── statistics/test/

test/
├── global-setup.js        # Zona horaria UTC para todas las pruebas
├── jest-e2e.json          # Configuración de pruebas e2e
└── helpers/
    ├── prisma.mock.ts     # Mock de PrismaService
    ├── validate-dto.ts    # Valida DTOs con class-validator
    └── metadata.ts        # Lee metadata de @Roles() y @UseGuards()
```

Convenciones que se siguen en los tests:

- **Un archivo por handler, guard, strategy o helper**, con un `describe` que lleva el nombre de la clase o función probada.
- **Descripciones en español**, escritas como comportamiento esperado (por ejemplo: `lanza NotFoundException si el cliente no existe y no actualiza`).
- **Handlers instanciados directamente** con `new Handler(prisma as any)`, sin levantar un módulo completo de Nest.
- **Prisma mockeado**: se importa `PrismaService` como una clase vacía con `jest.mock('src/database/prisma.service', ...)`, de modo que no se carga el cliente generado ni se abre ninguna conexión.
- **Configuración mockeada** cuando hace falta (por ejemplo `src/config/envs` en las pruebas de `JwtStrategy`).
- **Un `beforeEach`** que crea un mock nuevo en cada prueba para evitar que el estado se comparta entre casos.
- Cada handler cubre el **camino feliz**, los **errores de negocio** (`NotFoundException`, `ConflictException`, `BadRequestException`...) y la **propagación de errores inesperados**.

### Helpers de prueba (`test/helpers`)

| Helper             | Descripción                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `createPrismaMock` | Devuelve un mock de `PrismaService` con `jest.fn()` para los métodos usados por `employee`, `client`, `reservation`, `reservationDeposit` y `userSession`. Exporta además el tipo `PrismaMock`. |
| `validateDto`      | Convierte un objeto plano a la clase del DTO, ejecuta `class-validator` y devuelve los nombres de las propiedades que fallan. |
| `rolesOf` / `guardsOf` | Leen con `reflect-metadata` los roles declarados con `@Roles()` y los guards declarados con `@UseGuards()` en una clase o método. |

Ejemplo de prueba típica:

```ts
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { LogoutHandler } from '../command/handler/logout.handler';
import { LogoutCommand } from '../command/impl';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('LogoutHandler', () => {
  let prisma: PrismaMock;
  let handler: LogoutHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new LogoutHandler(prisma as any);
  });

  it('revoca la sesión activa del token indicado', async () => {
    prisma.userSession.updateMany.mockResolvedValue({ count: 1 });

    await handler.execute(new LogoutCommand('emp-1', 'KV1234', 'token-1'));

    expect(prisma.userSession.updateMany).toHaveBeenCalledWith({
      where: { tokenId: 'token-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
```

### Cobertura de pruebas por módulo

| Módulo                | Archivo de prueba                              | Qué valida                                                                                         |
| --------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **auth**              | `login.handler.spec.ts`                        | Validación de credenciales, firma del JWT y registro de sesión; no expone el hash; `tokenId` distinto por login; usuario inexistente/inactivo; contraseña incorrecta; errores de Prisma. |
|                       | `logout.handler.spec.ts`                       | Revoca la sesión activa del token, es idempotente y propaga errores de base de datos.              |
|                       | `jwt.strategy.spec.ts`                         | Rechaza tokens sin `jti`, sesiones inexistentes o revocadas; acepta sesiones vigentes.             |
|                       | `roles.guard.spec.ts`                          | Lee roles del método y la clase; permite rutas sin roles; lanza `ForbiddenException` si el rol no está permitido. |
| **clients**           | `create-client.handler.spec.ts`                | Creación (201), duplicados (409), valores demasiado largos (400) y errores inesperados.            |
|                       | `update-client.handler.spec.ts`                | Actualización (200), `NotFoundException` si no existe y errores inesperados.                       |
| **employee**          | `create-employee.handler.spec.ts`              | Contraseña hasheada (nunca en texto plano), username generado, duplicados (409).                   |
|                       | `update-employee.handler.spec.ts`              | Actualización, `NotFoundException` y traducción del error `P2025`.                                 |
|                       | `change-password.handler.spec.ts`              | Cambio con contraseña actual correcta, empleado inexistente y contraseña actual incorrecta.        |
|                       | `get-all-employee.handler.spec.ts`             | Paginación por defecto (`page=1`, `limit=10`), cálculo de `skip`, tabla vacía.                     |
|                       | `get-one-employee-by-filters.handler.spec.ts`  | Construcción del `where` y `NotFoundException` con los filtros en el mensaje.                      |
|                       | `employee-where.helper.spec.ts`                | `buildEmployeeWhere`: filtros vacíos, `contains`, igualdad de rol, `status=false` y combinación de filtros. |
|                       | `username.helper.spec.ts`                      | `generateUsername`: iniciales en mayúscula + 4 dígitos (1000–9999).                                |
| **reservations**      | `create-reservation.handler.spec.ts`           | Cliente existente o nuevo, validación de disponibilidad, `ConflictException` por horario ocupado, abono inicial opcional. |
|                       | `update-reservation.handler.spec.ts`           | Cambio de estado, cambio de hora con revalidación de disponibilidad, cancelación y errores de Prisma. |
|                       | `get-reservation-by-id.handler.spec.ts`        | Devuelve la reservación con cliente y abonos; `NotFoundException`.                                 |
|                       | `get-all-reservation.handler.spec.ts`          | Filtros por estado y cliente, paginación.                                                          |
|                       | `get-reservation-by-clientId.handler.spec.ts`  | Historial de un cliente con paginación; `NotFoundException` si no tiene reservaciones.             |
|                       | `get-reservation-checkout-available.handler.spec.ts` | Consulta de disponibilidad por fecha, hora y recurso (ignora canceladas).                    |
|                       | `get-agenda.handler.spec.ts`                   | Agenda del día agrupada por recurso, formato `HH:mm` y consulta única de clientes.                 |
| **reservation-deposit** | `create-reservation-deposit.handler.spec.ts` | Abonos parciales, suma de abonos previos, pago total (marca la reservación como `FINALIZADA`), rechazo si supera el total. |
|                       | `get-all-reservation-deposit.handler.spec.ts`  | Paginación de abonos.                                                                              |
|                       | `get-one-reservation-deposit-byId.handler.spec.ts` | Búsqueda por id, por `reservationId` o combinada; `NotFoundException`.                         |
| **statistics**        | `get-statistics-by-period.handler.spec.ts`     | Rangos de fechas (semana, mes, año), resumen por estado y recurso, totales facturados y abonados, línea de tiempo. |
| **database**          | `prisma-error.handler.spec.ts`                 | Traducción de códigos de Prisma (`P2000`, `P2002`, `P2003`, `P2025`) a excepciones HTTP de Nest.   |

### Integración continua (CI)

El workflow `.github/workflows/ci.yml` (**CI - API Reservation**) se ejecuta en cada `push` y `pull request` hacia las ramas `quality-assurance` y `master`. Corre sobre `ubuntu-latest` con Node.js 22 y realiza estos pasos:

1. Checkout del repositorio.
2. Instalación de dependencias con `npm ci`.
3. Generación del cliente de Prisma (`npx prisma generate`).
4. Lint con `npm run lint`.
5. Pruebas unitarias con `npm test -- --runInBand`.
6. Compilación con `npm run build`.

Si cualquiera de los pasos falla, el pipeline falla. Antes de abrir un pull request, puedes reproducirlo localmente:

```bash
npm run lint && npm test -- --runInBand && npm run build
```

### Cómo agregar nuevas pruebas

1. Crea el archivo dentro de la carpeta `test/` del módulo: `src/modules/<modulo>/test/<nombre>.spec.ts`.
2. Mockea `PrismaService` con `jest.mock('src/database/prisma.service', () => ({ PrismaService: class {} }))` y crea el mock con `createPrismaMock()`.
3. Si necesitas métodos de Prisma que `createPrismaMock` aún no incluye, agrégalos en `test/helpers/prisma.mock.ts`.
4. Instancia el handler directamente y escribe casos para el camino feliz, los errores de negocio y los errores inesperados.
5. Ejecuta `npm test` y `npm run lint` antes de hacer commit.

---

## 📁 Estructura del proyecto

El proyecto utiliza una estructura modular basada en las funcionalidades principales de la aplicación.

```text
src/
├── modules/
│   ├── auth/
│   ├── clients/
│   ├── employee/
│   ├── reservations/
│   ├── reservation-deposit/
│   ├── statistics/
│   └── ...          # Cada módulo incluye su carpeta test/
│
├── common/
│
├── database/
│   └── test/
│
├── generated/
│
└── main.ts

test/                # Configuración global y helpers de pruebas
.github/workflows/   # Pipeline de CI
```
