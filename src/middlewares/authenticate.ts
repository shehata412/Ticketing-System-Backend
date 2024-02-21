import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../db/models";
import { Model } from "sequelize";

dotenv.config();

interface UserRequest extends Request {
  user?: {
    id: number;
    isAdmin: boolean;
    username?: string;
  };
}

type User_data = {
  id?: number;
  username: string;
  password: string;
  isAdmin: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export const authenticate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.path == "/login" || req.path.startsWith("/uploads")) {
    return next();
  }
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ msg: "Token missing" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    const user: Model<User_data, User_data> | null = await User.findByPk(
      decoded.id
    );
    const userData: User_data = user?.get({ plain: true }) as User_data;
    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin,
      username: userData.username,
    };
    return next();
  } catch (e) {
    res.status(401).json({ msg: "Token missing" });
    return;
  }
};
