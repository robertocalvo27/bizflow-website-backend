import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
}