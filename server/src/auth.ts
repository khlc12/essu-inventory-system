import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type Role = 'Officer' | 'Staff';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  authMethod?: 'sso' | 'local';
}

export const signToken = (user: AuthUser) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
