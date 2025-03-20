import * as React from "react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';  // Add this import
import io from 'socket.io-client';

interface Participant {
    user_id: string;
    name: string;
    image_url: string;
}

interface LastMessage {
    id: string;
    content: string;
    created_at: string;
}

interface Chat {
    chat_id: string;
    chat_name: string;
    chat_created_at: string;
    participants: Participant[];
    last_message: LastMessage | null;
}

const ChatList: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();  // Add this
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchChats = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/user-chats`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setChats(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching chats:', error);
                setError('Failed to load chats');
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const socket = io(`${import.meta.env.VITE_API_URL}`);

        // Connect and set user online
        socket.emit('userConnected', user.id);

        // Handle online status updates
        socket.on('update-online-status', ({ userId, isOnline }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (isOnline) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
        });

        // Get initial online status of all participants
        const allParticipantIds = chats.flatMap(chat =>
            chat.participants.filter(p => p.user_id !== user.id)
                .map(p => p.user_id)
        );

        if (allParticipantIds.length > 0) {
            socket.emit('checkOnlineStatus', [...new Set(allParticipantIds)]);
        }

        socket.on('online-statuses', (statuses: { userId: string; isOnline: boolean }[]) => {
            setOnlineUsers(new Set(
                statuses.filter((s) => s.isOnline).map((s) => s.userId)
            ));
        });


        // Handle reconnection
        socket.on('connect', () => {
            socket.emit('userConnected', user.id);
            if (allParticipantIds.length > 0) {
                socket.emit('checkOnlineStatus', [...new Set(allParticipantIds)]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id, chats]);

    const getRecipientInfo = (participants: Participant[]): Participant => {
        if (!user) return participants[0];
        const recipient = participants.find(p => p.user_id !== user.id);
        return recipient || participants[0];
    };

    const renderOnlineStatus = (userId: string) => (
        <span
            className={`ms-2 ${onlineUsers.has(userId) ? 'text-success' : 'text-secondary'}`}
            style={{
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}
        >
            <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: onlineUsers.has(userId) ? '#28a745' : '#dc3545',
                display: 'inline-block'
            }} />
            {onlineUsers.has(userId) ? 'Online' : 'Offline'}
        </span>
    );

    if (loading) {
        return <div className="container mt-5 text-center">Loading chats...</div>;
    }

    if (error) {
        return <div className="container mt-5 alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Your Chats</h2>
            {chats.length === 0 ? (
                <div className="text-center">No chats found</div>
            ) : (
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        {chats.map((chat) => (
                            <Link
                                to={`/chats/${chat.chat_id}`}
                                state={{
                                    recipient: {
                                        id: getRecipientInfo(chat.participants).user_id,
                                        name: getRecipientInfo(chat.participants).name,
                                        image_url: getRecipientInfo(chat.participants).image_url
                                    }
                                }}
                                key={chat.chat_id}
                                className="text-decoration-none"
                            >
                                <div className="card mb-3 shadow-sm hover-shadow">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            {chat.participants[0] && (
                                                <img
                                                    src={chat.participants[0].image_url}
                                                    alt={chat.participants[0].name}
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            )}
                                            <div className="flex-grow-1">
                                                <h5 className="mb-1 d-flex align-items-center">
                                                    {getRecipientInfo(chat.participants).name}
                                                    {renderOnlineStatus(getRecipientInfo(chat.participants).user_id)}
                                                </h5>
                                                <p className="mb-1 text-muted small">
                                                    {chat.last_message ? (
                                                        <>
                                                            <span>{chat.last_message.content}</span>
                                                            <small className="ms-2">
                                                                {new Date(chat.last_message.created_at).toLocaleDateString()}
                                                            </small>
                                                        </>
                                                    ) : (
                                                        'No messages yet'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;