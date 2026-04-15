import { Request } from 'express';
import { Role } from '../enum/role.enum';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}