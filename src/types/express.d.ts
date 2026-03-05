// src/types/express.d.ts
import { Request as ExpressRequest } from 'express';

declare module 'express-serve-static-headers' {
  interface Request extends ExpressRequest {
    user?: {
      id: string;
      userName: string;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      userName: string;
    };
  }
}

export {};
