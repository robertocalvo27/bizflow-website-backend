import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
import { Context } from '../types/context';

export const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verify(token, process.env.JWT_SECRET!);
    context.user = payload as any;
    return next();
  } catch (err) {
    throw new AuthenticationError('Invalid token');
  }
};

export const isServiceAccount: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.user || context.user.role !== 'SERVICE') {
    throw new AuthenticationError('This endpoint requires service account authentication');
  }

  // Verificar si el service token está en la lista de tokens permitidos
  const serviceToken = context.req.headers['x-service-token'];
  if (!serviceToken || !isValidServiceToken(serviceToken)) {
    throw new AuthenticationError('Invalid service token');
  }

  return next();
};

// Función auxiliar para validar tokens de servicio
function isValidServiceToken(token: string): boolean {
  // Aquí implementaremos la lógica de validación de tokens de servicio
  // Por ahora, comparamos con una lista de tokens válidos almacenados en variables de entorno
  const validTokens = process.env.VALID_SERVICE_TOKENS?.split(',') || [];
  return validTokens.includes(token);
} 