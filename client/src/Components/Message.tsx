import React from 'react';

interface MessageProps {
    message: {
        id: string;
        user_id: string;
        message: string;
        created_at: string;
    };
}

const Message: React.FC<MessageProps> = ({ message }) => {
    return (
        <div className="message">
            <p>{message.message}</p>
            <small>{new Date(message.created_at).toLocaleString()}</small>
        </div>
    );
};

export default Message;