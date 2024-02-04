import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


interface UserRequest extends Request {
    user?: {
      id: number;
      isAdmin: boolean;
    }
  }

export const authenticate = (req: UserRequest, res: Response, next: NextFunction): void => {
    if(req.path == '/login' || req.path == '/create-user' ){
        return next();
    }
    const token: string | undefined = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ msg: 'Token missing' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string, { algorithms: ['HS256'] }) as JwtPayload;
        req.user = {
            id: decoded.id,
            isAdmin: decoded.isAdmin
        };
        return next();
    } catch (e) {
        res.status(401).json({ msg: 'Token missing' });
        return;
    }
};
