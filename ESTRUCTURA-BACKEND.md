# Estructura del Backend para el Blog de Bizflow

## Modelo de Base de Datos

A partir del análisis de los componentes frontend existentes, hemos identificado las siguientes entidades principales para la base de datos:

### 1. Tabla `posts`

Esta tabla almacenará la información de los artículos del blog.

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published
  featured_image_url VARCHAR(255),
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  category_id UUID NOT NULL REFERENCES categories(id),
  author_id UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
```

### 2. Tabla `categories`

Almacena las categorías para clasificar los artículos.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
```

### 3. Tabla `users` (autores)

Almacena la información de los usuarios/autores del blog.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_image_url VARCHAR(255),
  position VARCHAR(100),
  bio TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'author', -- admin, author, editor
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 4. Tabla `tags` (opcional)

Etiquetas adicionales para los artículos.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

### 5. Tabla `post_tags` (opcional - relación muchos a muchos)

```sql
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### 6. Tabla `related_posts` (opcional)

Para gestionar los artículos relacionados manualmente.

```sql
CREATE TABLE related_posts (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, related_post_id)
);
```

## Esquema GraphQL

Basado en las tablas definidas, crearemos los siguientes tipos y consultas en GraphQL:

### Tipos

```graphql
type Post {
  id: ID!
  title: String!
  slug: String!
  excerpt: String!
  content: String!
  status: String!
  featuredImageUrl: String
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  category: Category!
  author: User!
  tags: [Tag!]
  relatedPosts: [Post!]
}

type Category {
  id: ID!
  name: String!
  slug: String!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]
  _count: CategoryCount
}

type CategoryCount {
  posts: Int!
}

type User {
  id: ID!
  name: String!
  email: String!
  profileImageUrl: String
  position: String
  bio: String
  role: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]
}

type Tag {
  id: ID!
  name: String!
  slug: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]
}

# Inputs para crear y actualizar posts
input PostInput {
  title: String!
  slug: String
  excerpt: String!
  content: String!
  status: String
  featuredImageUrl: String
  publishedAt: DateTime
  categoryId: ID!
  authorId: ID!
  tagIds: [ID!]
}

input PostUpdateInput {
  title: String
  slug: String
  excerpt: String
  content: String
  status: String
  featuredImageUrl: String
  publishedAt: DateTime
  categoryId: ID
  authorId: ID
  tagIds: [ID!]
}
```

### Consultas (Queries)

```graphql
type Query {
  # Posts
  posts: [Post!]!
  publishedPosts: [Post!]!
  post(id: ID!): Post
  postBySlug(slug: String!): Post
  postsByCategory(categorySlug: String!): [Post!]!
  searchPosts(term: String!): [Post!]!
  
  # Categories
  categories: [Category!]!
  category(id: ID!): Category
  categoryBySlug(slug: String!): Category
  
  # Users
  users: [User!]!
  user(id: ID!): User
  
  # Tags
  tags: [Tag!]!
  tag(id: ID!): Tag
  tagBySlug(slug: String!): Tag
}
```

### Mutaciones

```graphql
type Mutation {
  # Posts
  createPost(input: PostInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  deletePost(id: ID!): Boolean!
  
  # Categories
  createCategory(name: String!, slug: String, description: String): Category!
  updateCategory(id: ID!, name: String, slug: String, description: String): Category!
  deleteCategory(id: ID!): Boolean!
  
  # Users
  createUser(name: String!, email: String!, password: String!, role: String): User!
  updateUser(id: ID!, name: String, email: String, password: String, role: String, profileImageUrl: String, position: String, bio: String): User!
  deleteUser(id: ID!): Boolean!
  
  # Authentication
  login(email: String!, password: String!): AuthPayload!
  
  # Tags
  createTag(name: String!, slug: String): Tag!
  updateTag(id: ID!, name: String, slug: String): Tag!
  deleteTag(id: ID!): Boolean!
  
  # Related Posts
  addRelatedPost(postId: ID!, relatedPostId: ID!, orderIndex: Int): Boolean!
  removeRelatedPost(postId: ID!, relatedPostId: ID!): Boolean!
}

type AuthPayload {
  token: String!
  user: User!
}
```

## Endpoints GraphQL Principales

Basados en las necesidades del frontend existente, estos serán los endpoints GraphQL principales:

### 1. Para la página principal del blog

```graphql
query GetPublishedPostsWithCategories {
  # Obtener posts publicados
  publishedPosts {
    id
    title
    slug
    excerpt
    featuredImageUrl
    publishedAt
    author {
      name
    }
    category {
      name
      slug
    }
  }
  
  # Obtener categorías con conteo de posts
  categories {
    id
    name
    slug
    _count {
      posts
    }
  }
}
```

### 2. Para la página de detalle de artículo

```graphql
query GetPostBySlug($slug: String!) {
  postBySlug(slug: $slug) {
    id
    title
    slug
    excerpt
    content
    featuredImageUrl
    publishedAt
    author {
      name
      position
      profileImageUrl
    }
    category {
      name
      slug
    }
    relatedPosts {
      id
      title
      slug
      excerpt
      featuredImageUrl
      publishedAt
      author {
        name
      }
      category {
        name
      }
    }
  }
}
```

### 3. Para filtrar por categoría

```graphql
query GetPostsByCategory($categorySlug: String!) {
  postsByCategory(categorySlug: $categorySlug) {
    id
    title
    slug
    excerpt
    featuredImageUrl
    publishedAt
    author {
      name
    }
    category {
      name
      slug
    }
  }
  
  categoryBySlug(slug: $categorySlug) {
    id
    name
    description
  }
}
```

### 4. Para la búsqueda

```graphql
query SearchPosts($term: String!) {
  searchPosts(term: $term) {
    id
    title
    slug
    excerpt
    featuredImageUrl
    publishedAt
    author {
      name
    }
    category {
      name
      slug
    }
  }
}
```

## Implementación de Resolvers

Los resolvers implementarán la lógica para cada operación GraphQL. Ejemplos clave:

### Posts Resolver

```typescript
// Consultas
async publishedPosts(): Promise<Post[]> {
  return this.postRepository.find({
    where: { status: 'published' },
    relations: ['author', 'category'],
    order: { publishedAt: 'DESC' },
  });
}

async postBySlug(slug: string): Promise<Post | null> {
  return this.postRepository.findOne({
    where: { slug },
    relations: ['author', 'category', 'relatedPosts', 'tags'],
  });
}

// Mutación
async createPost(input: PostInput, user: User): Promise<Post> {
  // Generar slug si no se proporciona
  if (!input.slug) {
    input.slug = slugify(input.title);
  }
  
  // Verificar permisos...
  
  // Crear post
  const post = this.postRepository.create({
    ...input,
    author: user,
  });
  
  return this.postRepository.save(post);
}
```

## Estructura de Carpetas del Proyecto

```
/src
  /database
    data-source.ts
    migrations/
  /models
    Post.ts
    Category.ts
    User.ts
    Tag.ts
  /schema
    post.schema.ts
    category.schema.ts
    user.schema.ts
    tag.schema.ts
  /resolvers
    post.resolver.ts
    category.resolver.ts
    user.resolver.ts
    tag.resolver.ts
  /middleware
    auth.ts
  /utils
    slugify.ts
    password.ts
  index.ts
```

## Plan de Implementación del Backend

### Fase 1: Configuración Inicial (2 días)

1. Configurar proyecto Node.js con TypeScript
2. Configurar TypeORM y base de datos PostgreSQL
3. Configurar Apollo Server con Express
4. Implementar autenticación JWT

### Fase 2: Implementación de Modelos y Resolvers (3 días)

1. Definir modelos y relaciones
2. Implementar schema GraphQL
3. Crear resolvers para cada tipo
4. Implementar lógica de negocio para consultas y mutaciones

### Fase 3: Seguridad y Validación (2 días)

1. Implementar middleware de autenticación
2. Configurar autorización basada en roles
3. Validar entradas con class-validator
4. Configurar CORS y protección contra ataques

### Fase 4: Pruebas y Documentación (2 días)

1. Escribir pruebas unitarias y de integración
2. Generar documentación del API
3. Implementar playground GraphQL
4. Crear archivo README con instrucciones de uso

### Fase 5: Despliegue e Integración (1 día)

1. Configurar Docker para desarrollo y producción
2. Implementar CI/CD
3. Desplegar en servidor de desarrollo
4. Documentar puntos de integración con frontend

## Requisitos Técnicos

- Node.js >= 16
- PostgreSQL >= 13
- TypeScript >= 5.0
- TypeORM
- Apollo Server
- Express
- GraphQL
- bcryptjs (para encriptación de contraseñas)
- jsonwebtoken (para autenticación)
- class-validator (para validación de datos)

## Conclusión

Esta estructura de backend está diseñada específicamente para satisfacer las necesidades del blog de Bizflow, tomando en cuenta los componentes y funcionalidades existentes en el frontend. La arquitectura propuesta es escalable, segura y proporciona todos los endpoints necesarios para la comunicación con el frontend, permitiendo una administración completa del contenido del blog.

Una vez implementado este backend, será posible conectarlo fácilmente con el frontend existente, reemplazando los datos estáticos por datos dinámicos provenientes de la base de datos. 