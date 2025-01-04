import { createUserRepo } from '../repositories/userRepo';
import { CustomError } from '../utils/CustomError';
import { CreateUserDTO } from '../models/CreateUserDTO';

export const createUserService = async ({ name, email, password, lat, long }: CreateUserDTO) => {
  const existingUser = await createUserRepo.findByEmail(email);
  if (existingUser) {
    throw new CustomError('Email already in use', 400);
  }

  const user = await createUserRepo.create({ name, email, password, lat, long });
  return user;
};
