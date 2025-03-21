import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const createToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  // @ts-ignore - Ignorar error de tipo ya que sabemos que esto funciona en tiempo de ejecución
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}; 