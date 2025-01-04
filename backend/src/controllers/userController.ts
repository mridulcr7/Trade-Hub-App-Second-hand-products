import { Request, Response } from 'express';
import { createUserService } from '../services/userService';
import { CustomError } from '../utils/CustomError';

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, lat, long } = req.body;
    const user = await createUserService({ name, email, password, lat, long });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};
