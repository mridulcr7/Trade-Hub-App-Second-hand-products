import { createChatRepo, findChatByUsersRepo, getUserChatsWithParticipantsRepo } from '../repositories/chatRepo';

export const createChatService = async (userId1: string, userId2: string) => {
    const existingChat = await findChatByUsersRepo(userId1, userId2);

    if (existingChat) {
        return existingChat.chat_id;
    }

    const chat = await createChatRepo(userId1, userId2);
    return chat.id;
};

export const getUserChatsWithParticipantsService = async (userId: string) => {
    const chats = await getUserChatsWithParticipantsRepo(userId);
    return chats.map((chat: { participants: any[]; }) => ({
        ...chat,
        participants: chat.participants.filter(p => p.user_id !== userId)
    }));
};

