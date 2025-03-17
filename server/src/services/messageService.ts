import { getMessagesByChatIdRepo, createMessageRepo } from '../repositories/messageRepository';

export interface Message {
    id: string;
    user_id: string;  // This is what the frontend expects
    content: string;
    created_at: string;
}

export const getMessagesByChatIdService = async (chatId: string) => {
    const messages = await getMessagesByChatIdRepo(chatId);
    // Map the database fields to match our interface
    const mappedMessages: Message[] = messages.map(message => ({
        id: message.id,
        user_id: message.sender_id,  // Map sender_id to user_id
        content: message.content,
        created_at: message.created_at
    }));
    return mappedMessages;
};

export const createMessageService = async (chatId: string, userId: string, content: string) => {
    const message = await createMessageRepo(chatId, userId, content);
    return {
        ...message,
        user_id: userId, // Ensure user_id is explicitly set
    };
};

// ...existing code...