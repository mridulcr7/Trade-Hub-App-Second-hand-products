import { NextFunction, Request, Response } from "express"
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.Jwt_Key;


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const createToken = (payload: Object, expiresIn: String | number = '2h') => {

  return jwt.sign(payload, JWT_SECRET, { expiresIn });

}



export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers as unknown as Record<string, string | undefined>)['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Token Missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
}
