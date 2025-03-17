import { createUserRepo } from '../repositories/userRepo';
import { CustomError } from '../utils/CustomError';
import { CreateUserDTO, LoginUserDTO } from '../models/CreateUserDTO';
import argon2 from 'argon2';
import { createToken, verifyToken } from '../middleware/Token';



export const createUserService = async ({ name, email, password, contact, image }: CreateUserDTO) => {
  const existingUser = await createUserRepo.findByEmail(email);

  if (existingUser) {
    throw new CustomError("Email already in use", 400);

  }

  const existingUserByContact = await createUserRepo.findByContact(contact);
  if (existingUserByContact) {
    throw new CustomError("Contact already in use", 400);
  }

  const hashedPassword = await argon2.hash(password);

  // Ensure all required fields are passed to the repository function
  const user = await createUserRepo.create({
    name,
    email,
    password: hashedPassword,
    contact,
    image, // Store image URL
  });

  const token = createToken({ id: user.id, email: user.email });

  return { user, token };
};


export const loginUserService = async ({ email, password }: LoginUserDTO) => {
  const user = await createUserRepo.findByEmail(email);
  //console.log(user)
  if (!user) {
    throw new CustomError('Email not found', 400);
  }
  const isPasswordValid = await argon2.verify(user.password, password);
  // console.log(isPasswordValid)


  if (!isPasswordValid) {
    throw new CustomError('Invalid password', 400);
  }

  const token = createToken({ id: user.id, email: user.email });

  return { user, token };

}

export const getProfileService = async (id: Number) => {
  const user = await createUserRepo.findById(id);
  //  console.log(user)
  if (!user) {
    throw new CustomError('user not found', 400);
  }

  return { user };

}

export const updateProfileService = async (userId: number, updateData: any) => {
  const user = await createUserRepo.findById(userId);
  if (!user) {
    throw new CustomError("User not found", 400);
  }

  if (updateData.contact) {
    const contactExists = await createUserRepo.isContactExists(updateData.contact, userId);
    if (contactExists) {
      throw new CustomError("Contact number already exists.", 400);
    }
  }

  const updatedUser = await createUserRepo.update(userId, updateData);
  return updatedUser;
};
