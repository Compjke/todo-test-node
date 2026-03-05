import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'superSecret';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      reason: 'No token provided',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Unauthorized',
          reason: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Unauthorized',
          reason: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }

      return res.status(403).json({
        message: 'Forbidden',
        reason: 'Token verification failed',
      });
    }

    req.user = user as { id: string; userName: string };
    next();
  });
};
