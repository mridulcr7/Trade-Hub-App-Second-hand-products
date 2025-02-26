import { Request, Response, NextFunction } from 'express';
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.Jwt_Key;

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token)
  if (!token) {
    res.status(401).json({ message: 'Token missing' }); // Stop further execution
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = decoded; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' }); // Stop further execution
    return;
  }
};
