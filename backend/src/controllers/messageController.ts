import { Request, Response } from 'express';
import { getMessagesByChatIdService } from '../services/messageService';
import { createChatService } from '../services/chatService';

export const getMessagesByChatIdController = async (req: Request, res: Response) => {
    const { chatId } = req.params;

    try {
        const messages = await getMessagesByChatIdService(chatId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};

export const getMessagesByUserIdController = async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.userId;

    // First create/get chat between the two users
    const chat = await createChatService(currentUserId, targetUserId);

    // Then fetch messages using the chat ID
    const messages = await getMessagesByChatIdService(chat.chat_id);

    res.status(200).json({
        success: true,
        data: messages,
        chat_id: chat.chat_id,
    });
};
