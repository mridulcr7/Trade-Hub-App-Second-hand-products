import { Request, Response } from 'express';
import { createUserService, getProfileService, loginUserService, updateProfileService } from '../services/userService';
import { CustomError } from '../utils/CustomError';
import { log } from 'console';
import { uploadUserImageService } from '../services/imageService';
import { uploadImageService } from '../services/imageService';
// import { sendForgotPasswordEmail, sendResetPasswordEmail } from '../utils/emailService';

export const createUserController = async (req: Request, res: Response) => {
    try {
        console.log("Received request");

        const { name, email, password, contact } = req.body;
        console.log("Request Body:", req.body);
        console.log("Uploaded File:", req.file);

        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadImageService(req.file);
            console.log("Uploaded Image URL:", imageUrl);
        }

        const user = await createUserService({ name, email, password, contact, image: imageUrl });
        console.log(user);

        res.status(201).json(user); // If successful, return user and token
    } catch (error) {
        console.error("Error in createUserController:", error);

        // Check if the error is an instance of CustomError
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};


export const LoginUserController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const getuser = await loginUserService({ email, password });
        res.status(200).json(getuser);

    }

    catch {
        res.status(500).json({ message: `can't login` });

    }

}


export const getUserProfile = async (req: Request, res: Response) => {
    console.log("get profile")

    const { id } = req.body;

    console.log(id)
    try {
        const userdetails = await getProfileService(id);
        console.log(userdetails)
        res.status(200).json(userdetails)

    }
    catch {
        res.status(500).json({ message: `can't get profile` });

    }
}


export const updateUserProfile = async (req: Request, res: Response) => {
    const { userId, name, contact } = req.body;

    console.log("Request Body:", req.body);

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    let image = null;

    if (req.file) {
        image = await uploadImageService(req.file);
        console.log("Uploaded Image URL:", image);
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;
    if (image) updateData.image = image; // Image URL or file path

    try {
        const updatedUser = await updateProfileService(userId, updateData);
        res.status(200).json(updatedUser);
    } catch (error) {
        if (error instanceof CustomError) {
            console.log(error.statusCode)
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};