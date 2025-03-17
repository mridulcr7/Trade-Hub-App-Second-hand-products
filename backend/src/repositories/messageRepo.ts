import { Message } from '../types/message';
import pool from '../config/dbConfig';

export const saveMessageRepo = async (chatId: string, senderId: string, message: string): Promise<Message> => {
    const query = `
        INSERT INTO public.messages (chat_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, sender_id as user_id, content, created_at::text;
    `;
    const result = await pool.query(query, [chatId, senderId, message]);
    return result.rows[0];
};

export const getMessagesByChatIdRepo = async (chatId: string) => {
    const query = `
        SELECT * FROM public.messages
        WHERE chat_id = $1
        ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [chatId]);
    return result.rows;
};
