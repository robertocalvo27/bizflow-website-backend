import { MiddlewareFn } from 'type-graphql';
import { Request, Response } from 'express';
import { verifyToken } from '../utils/auth';

export interface MyContext {
  req: Request;
  res: Response;
  payload?: any;
}

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers.authorization;

  if (!authorization) {
    throw new Error('No autenticado');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verifyToken(token);
    context.payload = payload;
  } catch (err) {
    throw new Error('No autenticado');
  }

  return next();
};

export const isAdmin: MiddlewareFn<MyContext> = ({ context }, next) => {
  // Primero verificamos que esté autenticado
  if (!context.payload) {
    throw new Error('No autenticado');
  }

  // Verificamos que sea administrador
  if (context.payload.role !== 'admin') {
    throw new Error('No autorizado - se requiere rol de administrador');
  }

  return next();
}; 