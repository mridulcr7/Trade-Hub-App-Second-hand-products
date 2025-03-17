import pool from '../config/dbConfig';

export const findChatByUsersRepo = async (userId1: string, userId2: string) => {
    const query = `
    SELECT * FROM public.chats_users
    WHERE (user_id = $1 AND chat_id IN (SELECT chat_id FROM public.chats_users WHERE user_id = $2))
    OR (user_id = $2 AND chat_id IN (SELECT chat_id FROM public.chats_users WHERE user_id = $1))
  `;
    const result = await pool.query(query, [userId1, userId2]);
    return result.rows[0];
};

export const createChatRepo = async (userId1: string, userId2: string) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const chatResult = await client.query(
            'INSERT INTO public.chats (name) VALUES ($1) RETURNING *',
            ['Chat between users']
        );
        const chat = chatResult.rows[0];

        await client.query(
            'INSERT INTO public.chats_users (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
            [chat.id, userId1, userId2]
        );

        await client.query('COMMIT');
        return chat;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getUserChatsWithParticipantsRepo = async (userId: string) => {
    const query = `
        SELECT 
            c.id as chat_id,
            c.name as chat_name,
            c.created_at as chat_created_at,
            json_agg(
                json_build_object(
                    'user_id', u.id,
                    'name', u.name,
                    'image_url', u.image_url
                )
            ) as participants,
            (
                SELECT json_build_object(
                    'id', m.id,
                    'content', m.content,
                    'created_at', m.created_at
                )
                FROM messages m
                WHERE m.chat_id = c.id
                ORDER BY m.created_at DESC
                LIMIT 1
            ) as last_message
        FROM chats c
        JOIN chats_users cu ON c.id = cu.chat_id
        JOIN users u ON cu.user_id = u.id
        WHERE c.id IN (
            SELECT chat_id 
            FROM chats_users 
            WHERE user_id = $1
        )
        GROUP BY c.id
        ORDER BY (
            SELECT MAX(created_at) 
            FROM messages 
            WHERE chat_id = c.id
        ) DESC NULLS LAST;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};


