export interface MessageFromDB {
    message_id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: Date;
}

export interface Message {
    message_id: string;
    chat_id: string;
    user_id: string;
    content: string;
    created_at: Date;
}
