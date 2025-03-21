# Documentación API GraphQL - Bizflow

## Información General

- **URL del endpoint GraphQL**: `http://localhost:4000/graphql`
- **Playground/Explorer**: Apollo Studio accesible en la misma URL

## Autenticación

La API utiliza autenticación basada en JWT (JSON Web Tokens).

### Obtener un token

```graphql
mutation {
  login(email: "admin@bizflow.com", password: "admin123") {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

### Uso del token

Para endpoints protegidos, incluye el token en el header HTTP:

```
Authorization: Bearer [tu_token_jwt]
```

## Entidades Principales

### Usuario (User)

La entidad User representa los usuarios del sistema.

#### Propiedades
- `id`: ID único del usuario (UUID)
- `name`: Nombre completo
- `email`: Correo electrónico (único)
- `password`: Contraseña (hash)
- `profileImageUrl`: URL de la imagen de perfil (opcional)
- `position`: Cargo/posición (opcional)
- `bio`: Biografía del usuario (opcional)
- `role`: Rol del usuario (admin, author, user)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización
- `posts`: Relación con posts creados por el usuario

#### Queries
```graphql
# Obtener todos los usuarios (requiere autenticación)
query {
  users {
    id
    name
    email
    role
    position
    posts {
      id
      title
    }
  }
}

# Obtener un usuario específico
query {
  user(id: "id_del_usuario") {
    id
    name
    email
    role
    position
    bio
    posts {
      id
      title
    }
  }
}
```

#### Mutations
```graphql
# Registrar un nuevo usuario
mutation {
  register(input: {
    name: "Nombre Completo"
    email: "usuario@ejemplo.com"
    password: "contraseña123"
    role: "author"
  }) {
    id
    name
    email
    role
  }
}

# Iniciar sesión
mutation {
  login(email: "usuario@ejemplo.com", password: "contraseña123") {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

### Categoría (Category)

La entidad Category representa las categorías para clasificar posts.

#### Propiedades
- `id`: ID único de la categoría (UUID)
- `name`: Nombre de la categoría
- `slug`: Versión URL-friendly del nombre
- `description`: Descripción de la categoría
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización
- `posts`: Relación con posts en esta categoría
- `metaTitle`: Título para SEO
- `metaDescription`: Descripción para SEO
- `metaKeywords`: Palabras clave para SEO
- `indexable`: Indicador de si debe indexarse
- `canonicalUrl`: URL canónica
- `socialImageUrl`: URL de imagen para redes sociales

#### Queries
```graphql
# Obtener todas las categorías
query {
  categories {
    id
    name
    slug
    description
    metaTitle
    metaDescription
    metaKeywords
    posts {
      id
      title
    }
  }
}

# Obtener una categoría específica
query {
  category(id: "id_de_la_categoría") {
    id
    name
    slug
    description
    metaTitle
    metaDescription
    metaKeywords
    indexable
    canonicalUrl
    socialImageUrl
    posts {
      id
      title
    }
  }
}
```

#### Mutations
```graphql
# Crear una nueva categoría (requiere autenticación)
mutation {
  createCategory(input: {
    name: "Nombre de Categoría"
    description: "Descripción de la categoría"
    metaTitle: "Título SEO para la categoría"
    metaDescription: "Descripción SEO para la categoría"
    metaKeywords: "palabra clave 1, palabra clave 2"
    indexable: true
    canonicalUrl: "https://bizflow.com/categorias/nombre-categoria"
    socialImageUrl: "/images/og/nombre-categoria.jpg"
  }) {
    id
    name
    slug
    metaTitle
    metaDescription
  }
}

# Actualizar una categoría existente (requiere autenticación)
mutation {
  updateCategory(id: "id_de_la_categoría", input: {
    name: "Nuevo Nombre de Categoría"
    description: "Nueva descripción"
    metaTitle: "Nuevo título SEO"
    metaDescription: "Nueva descripción SEO"
  }) {
    id
    name
    slug
    metaTitle
    metaDescription
  }
}

# Eliminar una categoría (requiere autenticación)
mutation {
  deleteCategory(id: "id_de_la_categoría")
}
```

### Post (Artículo)

La entidad Post representa los artículos del blog.

#### Propiedades
- `id`: ID único del post (UUID)
- `title`: Título del post
- `slug`: Versión URL-friendly del título
- `excerpt`: Resumen o extracto del post
- `content`: Contenido completo (HTML permitido)
- `status`: Estado (draft, published)
- `publishedAt`: Fecha de publicación
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización
- `categoryId`: ID de la categoría asociada
- `category`: Relación con la categoría
- `authorId`: ID del autor
- `author`: Relación con el usuario autor
- `featuredImageUrl`: URL de la imagen destacada
- `relatedPosts`: Posts relacionados
- `metaTitle`: Título para SEO
- `metaDescription`: Descripción para SEO
- `metaKeywords`: Palabras clave para SEO
- `indexable`: Indicador de si debe indexarse
- `canonicalUrl`: URL canónica
- `structuredData`: Datos estructurados para SEO (JSON)
- `socialImageUrl`: URL de imagen para redes sociales

#### Queries
```graphql
# Obtener todos los posts
query {
  posts {
    id
    title
    slug
    excerpt
    status
    publishedAt
    category {
      name
      slug
    }
    author {
      name
    }
    metaTitle
    metaDescription
  }
}

# Obtener posts publicados
query {
  publishedPosts {
    id
    title
    slug
    excerpt
    publishedAt
    category {
      name
      slug
    }
    author {
      name
    }
    metaTitle
    metaDescription
  }
}

# Obtener un post específico
query {
  post(id: "id_del_post") {
    id
    title
    slug
    excerpt
    content
    status
    publishedAt
    category {
      name
      slug
    }
    author {
      name
    }
    featuredImageUrl
    metaTitle
    metaDescription
    metaKeywords
    indexable
    canonicalUrl
    structuredData
    socialImageUrl
  }
}

# Obtener un post por su slug
query {
  postBySlug(slug: "slug-del-post") {
    id
    title
    content
    publishedAt
    metaTitle
    metaDescription
    metaKeywords
    structuredData
  }
}

# Obtener posts por categoría
query {
  postsByCategory(categoryId: "id_de_la_categoría") {
    id
    title
    slug
    excerpt
  }
}

# Buscar posts
query {
  searchPosts(term: "término de búsqueda") {
    id
    title
    slug
    excerpt
  }
}
```

#### Mutations
```graphql
# Crear un nuevo post (requiere autenticación)
mutation {
  createPost(input: {
    title: "Título del Post"
    excerpt: "Resumen del post"
    content: "<p>Contenido del post en HTML</p>"
    status: "published"
    categoryId: "id_de_la_categoría"
    featuredImageUrl: "/images/posts/imagen.jpg"
    metaTitle: "Título SEO del post"
    metaDescription: "Descripción SEO del post"
    metaKeywords: "palabra clave 1, palabra clave 2"
    indexable: true
    canonicalUrl: "https://bizflow.com/blog/slug-del-post"
    structuredData: "{\"@context\":\"https://schema.org\",\"@type\":\"BlogPosting\",\"headline\":\"Título del Post\",\"datePublished\":\"2024-07-18\"}"
    socialImageUrl: "/images/og/post-imagen.jpg"
  }) {
    id
    title
    slug
    metaTitle
    metaDescription
  }
}

# Actualizar un post existente (requiere autenticación)
mutation {
  updatePost(id: "id_del_post", input: {
    title: "Nuevo título del post"
    excerpt: "Nuevo resumen"
    content: "<p>Nuevo contenido</p>"
    status: "published"
    metaTitle: "Nuevo título SEO"
    metaDescription: "Nueva descripción SEO"
  }) {
    id
    title
    slug
    metaTitle
    metaDescription
  }
}

# Eliminar un post (requiere autenticación)
mutation {
  deletePost(id: "id_del_post")
}
```

## Permisos y Roles

El sistema incluye tres roles principales:

- **admin**: Acceso completo a todas las operaciones.
- **author**: Puede crear y editar sus propios posts, pero no puede modificar usuarios ni categorías.
- **user**: Acceso de solo lectura a posts y categorías públicas.

## Estructura de Archivos del Backend

```
bizflow-api/
├── src/
│   ├── database/
│   │   ├── data-source.ts       # Configuración de TypeORM
│   │   └── seedData.ts          # Datos iniciales para la base de datos
│   ├── middleware/
│   │   └── auth.ts              # Middleware de autenticación
│   ├── migrations/
│   │   └── ...                  # Migraciones de base de datos
│   ├── models/
│   │   ├── Category.ts          # Entidad Categoría
│   │   ├── Post.ts              # Entidad Post
│   │   └── User.ts              # Entidad Usuario
│   ├── resolvers/
│   │   ├── category.resolver.ts # Resolver GraphQL para categorías
│   │   ├── post.resolver.ts     # Resolver GraphQL para posts
│   │   └── user.resolver.ts     # Resolver GraphQL para usuarios
│   ├── schema/
│   │   ├── auth.schema.ts       # Tipos para autenticación
│   │   ├── category.schema.ts   # Tipos para categorías
│   │   ├── post.schema.ts       # Tipos para posts
│   │   └── user.schema.ts       # Tipos para usuarios
│   ├── utils/
│   │   ├── auth.ts              # Utilidades de autenticación (JWT)
│   │   └── slugify.ts           # Función para crear slugs
│   └── index.ts                 # Punto de entrada principal
├── .env                         # Variables de entorno
├── docker-compose.yml           # Configuración de Docker
├── package.json                 # Dependencias y scripts
└── tsconfig.json                # Configuración de TypeScript
```

## Configuración y Ejecución

### Variables de Entorno (.env)

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

### Scripts Disponibles

- **dev**: `npm run dev` - Inicia el servidor en modo desarrollo
- **build**: `npm run build` - Compila el código TypeScript
- **start**: `npm start` - Inicia el servidor en modo producción
- **typeorm**: `npm run typeorm` - Ejecuta comandos de TypeORM

### Docker

El proyecto utiliza Docker para el entorno de desarrollo:

```bash
# Iniciar servicios Docker
docker-compose up -d

# Detener servicios Docker
docker-compose down
```

## Script de Inicio Rápido

Para iniciar todo el stack, puedes usar el script `start-dev.sh` que configura el entorno completo:

```bash
./start-dev.sh
```

## Ejemplos de uso con cURL

### Autenticación
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"admin@bizflow.com\", password: \"admin123\") { token user { id name email role } } }"}'
```

### Crear Categoría (con autenticación)
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{"query":"mutation { createCategory(input: { name: \"Nueva Categoría\", description: \"Descripción\", metaTitle: \"Título SEO\" }) { id name slug } }"}'
```

### Obtener Posts
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { posts { id title slug excerpt } }"}'
```

## Implementación SEO

La API incluye campos completos para SEO en las entidades Post y Category:

- **metaTitle**: Para etiquetas `<title>` y meta "og:title"
- **metaDescription**: Para meta "description" y "og:description"
- **metaKeywords**: Para meta "keywords"
- **indexable**: Indica si el contenido debe ser indexado por buscadores
- **canonicalUrl**: URL canónica para evitar contenido duplicado
- **structuredData**: Campo JSON para data estructurada (JSON-LD)
- **socialImageUrl**: URL para imagen compartida en redes sociales (og:image)

### Ejemplo de Implementación Frontend

```jsx
// Ejemplo React/Next.js con los datos de la API
function PostPage({ post }) {
  return (
    <>
      <Head>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        {post.metaKeywords && <meta name="keywords" content={post.metaKeywords} />}
        {!post.indexable && <meta name="robots" content="noindex, nofollow" />}
        <link rel="canonical" href={post.canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={post.canonicalUrl} />
        <meta property="og:image" content={post.socialImageUrl} />
        
        {/* JSON-LD estructura */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.structuredData }}
        />
      </Head>
      
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
```

## Consideraciones de Seguridad

- Todas las contraseñas se hashean con bcrypt
- Autenticación mediante JWT con expiración configurable
- Middleware de autenticación para proteger endpoints
- Validación de roles para operaciones sensibles
- Sistema de permisos basado en roles

---

Creado para Bizflow Website - Documentación API GraphQL
Última actualización: Julio 2024 