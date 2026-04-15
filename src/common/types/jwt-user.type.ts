import { Role } from '../enum/role.enum';

export interface JwtUser {
  id: number;
  email: string;
  role: Role;
}