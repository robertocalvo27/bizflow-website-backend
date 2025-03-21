import { User } from "../models/User";
import { Request, Response } from "express";

export interface AuthContext {
  user?: User;
  req: any;
  res: any;
}