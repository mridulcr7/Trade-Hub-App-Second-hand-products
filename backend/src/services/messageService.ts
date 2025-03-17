import { getMessagesByChatIdRepo } from '../repositories/messageRepo';
import { Message, MessageFromDB } from '../types/message';

export const getMessagesByChatIdService = async (chatId: string): Promise<Message[]> => {
    const messages: MessageFromDB[] = await getMessagesByChatIdRepo(chatId);
    return messages.map(message => ({
        message_id: message.message_id,
        chat_id: message.chat_id,
        user_id: message.sender_id,
        content: message.content,
        created_at: message.created_at
    }));
};
