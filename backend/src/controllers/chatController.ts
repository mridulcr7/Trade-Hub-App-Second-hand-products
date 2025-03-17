import { Request, Response } from 'express';
import { createChatService, getUserChatsWithParticipantsService } from '../services/chatService';

export const createChatController = async (req: Request, res: Response) => {
    const userId1 = req.user.id;
    const userId2 = req.params.userId;

    try {
        const chat = await createChatService(userId1, userId2);
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat', error });
    }
};

export const getUserChatsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id; // Assuming userId is extracted from the token
        const chats = await getUserChatsWithParticipantsService(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user chats', error });
    }
};


