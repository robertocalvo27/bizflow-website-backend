# Bizflow API

API GraphQL para el blog de Bizflow, desarrollada con Node.js, TypeScript, TypeORM y Apollo Server.

## Requisitos previos

- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn

## Configuración

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/bizflow-api.git
cd bizflow-api
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bizflow
PGADMIN_DEFAULT_EMAIL=admin@bizflow.com
PGADMIN_DEFAULT_PASSWORD=admin
NODE_ENV=development
PORT=4000
JWT_SECRET=un-secreto-muy-seguro-para-desarrollo
JWT_EXPIRES_IN=7d
```

Asegúrate de ajustar estos valores según tu entorno.

## Base de datos

La aplicación utiliza PostgreSQL como base de datos. Puedes configurar una instancia de PostgreSQL de varias maneras:

### Usando Docker Compose (recomendado)

El proyecto incluye un archivo docker-compose.yml que configura PostgreSQL y pgAdmin:

```bash
docker-compose up -d
```

### Usando una instancia local o remota de PostgreSQL

Ajusta las variables de entorno en tu archivo `.env` para conectarte a tu instancia de PostgreSQL.

## Ejecución

### Configuración inicial (migraciones y datos de prueba)

Para ejecutar las migraciones y cargar datos de prueba:

```bash
npm run setup
```

Esto creará las tablas necesarias y cargará datos iniciales para usuarios, categorías y posts.

### Desarrollo

Para iniciar el servidor en modo desarrollo con recarga automática:

```bash
npm run dev
```

### Producción

Para compilar y ejecutar en producción:

```bash
npm run build
npm start
```

## Características

- Autenticación con JWT
- CRUD de usuarios, categorías y posts
- Relaciones entre entidades
- GraphQL API

## API GraphQL

La API GraphQL está disponible en:

```
http://localhost:4000/graphql
```

Puedes usar esta URL para acceder al playground de GraphQL y explorar la API.

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el proyecto TypeScript
- `npm start`: Inicia el servidor en modo producción
- `npm run migration:generate`: Genera migraciones basadas en cambios en entidades
- `npm run migration:run`: Ejecuta las migraciones pendientes
- `npm run migration:revert`: Revierte la última migración
- `npm run seed`: Carga datos de prueba
- `npm run setup`: Ejecuta migraciones y carga datos de prueba

## Estructura del proyecto

```
bizflow-api/
├── src/
│   ├── database/           # Configuración de base de datos y migraciones
│   ├── models/             # Entidades/modelos de datos
│   ├── resolvers/          # Resolvers de GraphQL
│   ├── types/              # Tipos de GraphQL
│   ├── utils/              # Utilidades (auth, slugify, etc)
│   └── index.ts            # Punto de entrada principal
├── .env                    # Variables de entorno
├── docker-compose.yml      # Configuración de Docker
├── package.json            # Dependencias y scripts
└── tsconfig.json           # Configuración de TypeScript
```

## Licencia

ISC