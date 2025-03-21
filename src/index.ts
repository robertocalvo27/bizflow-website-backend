import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { AppDataSource } from './database/data-source';
import { UserResolver } from './resolvers/user.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { PostResolver } from './resolvers/post.resolver';
import { ResourceResolver } from './resolvers/resource.resolver';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const PORT = process.env.PORT || 4000;

// Función principal
async function bootstrap() {
  // Inicializar la conexión a la base de datos
  try {
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return;
  }

  // Crear aplicación Express
  const app = express();
  
  // Configurar middleware
  app.use(cors());
  app.use(express.json());

  // Construir el schema GraphQL
  const schema = await buildSchema({
    resolvers: [UserResolver, CategoryResolver, PostResolver, ResourceResolver],
    emitSchemaFile: true,
    validate: false,
  });

  // Crear instancia de Apollo Server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  });

  // Iniciar Apollo Server
  await server.start();
  
  // Aplicar middleware Apollo a Express
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}/graphql`);
  });
}

// Iniciar la aplicación
bootstrap().catch(err => {
  console.error('Error al iniciar la aplicación:', err);
}); 