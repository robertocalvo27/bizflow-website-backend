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
import { VideoResolver } from './resolvers/video.resolver';
import { CTAResolver } from './resolvers/cta.resolver';
import { config } from 'dotenv';
import { verify } from 'jsonwebtoken';
import { User } from './models/User';
import { AuthContext } from './types/context';

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
    resolvers: [UserResolver, CategoryResolver, PostResolver, ResourceResolver, VideoResolver, CTAResolver],
    emitSchemaFile: true,
    validate: false,
    authChecker: ({ context }: { context: AuthContext }, roles: string[]) => {
      try {
        // Verificar si el usuario está autenticado
        if (!context.user) {
          return false;
        }

        // Si no se requieren roles específicos, solo verificamos autenticación
        if (roles.length === 0) {
          return true;
        }

        // Verificar si el usuario tiene alguno de los roles requeridos
        return roles.includes(context.user.role);
      } catch (error) {
        return false;
      }
    },
  });

  // Crear instancia de Apollo Server
  const server = new ApolloServer({
    schema,
    context: async ({ req, res }) => {
      const context: AuthContext = { req, res };

      // Verificar token de autenticación
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const payload = verify(token, process.env.JWT_SECRET || 'secret') as any;
          
          // Buscar el usuario en la base de datos
          if (payload.userId) {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: payload.userId } });
            if (user) {
              context.user = user;
            }
          }
        } catch (error) {
          console.error('Error al verificar token:', error);
        }
      }

      return context;
    },
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