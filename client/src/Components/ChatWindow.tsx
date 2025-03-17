import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';

interface Recipient {
    id: string;
    name: string;
    image_url: string;
}

interface Message {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    username?: string;  // Add this
}

interface UserStatus {
    userId: string;
    isOnline: boolean;
}

const ChatWindow: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const location = useLocation();
    const recipient = location.state?.recipient;

    // Add debug logging
    useEffect(() => {
        console.log("Location state:", location.state);
        console.log("Recipient data:", recipient);
    }, [location.state, recipient]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useUser();
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // Change to Map to store userId -> username
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!user?.id) return;

        socketRef.current = io('http://localhost:5000');

        // Set user as online
        socketRef.current.emit('userConnected', user.id);

        // Handle online status updates
        socketRef.current.on('update-online-status', ({ userId, isOnline }) => {
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

        // Handle reconnection
        socketRef.current.on('connect', () => {
            socketRef.current?.emit('userConnected', user.id);
        });

        // Initial online status check
        if (recipient?.id) {
            socketRef.current.emit('checkOnlineStatus', [recipient.id]);
        }

        socketRef.current.on('online-statuses', (statuses) => {
            setOnlineUsers(new Set(statuses.filter((s: UserStatus) => s.isOnline).map((s: UserStatus) => s.userId)));
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user?.id, recipient?.id]);

    // Separate useEffect for chat-specific socket events
    useEffect(() => {
        if (!socketRef.current || !user) return;

        socketRef.current.emit('joinChat', chatId);

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`http://localhost:5000/chat/${chatId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Fetched messages:', response.data);
                console.log('User ID type:', typeof user.id);
                console.log('First message user_id type:', typeof response.data[0]?.user_id);
                setMessages(response.data);
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Listen for new messages
        socketRef.current.on('receiveMessage', (message: Message) => {
            // Ensure the created_at is properly formatted for new messages
            const messageWithDate = {
                content: message.content,
                id: message.id,
                user_id: message.user_id,
                created_at: message.created_at || new Date().toISOString()
            };
            setMessages(prev => [...prev, messageWithDate]);
            scrollToBottom();
        });

        // Add typing event listeners
        socketRef.current.on('userTyping', (userId: string, username: string) => {
            setTypingUsers(prev => new Map(prev).set(userId, username));
        });

        socketRef.current.on('userStoppedTyping', (userId: string) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        });

        // Add online status listeners
        socketRef.current.on('userStatusChange', ({ userId, isOnline }: UserStatus) => {
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

        // Request initial online statuses
        socketRef.current.emit('checkOnlineStatus', messages.map(m => m.user_id));

        socketRef.current.on('onlineStatuses', (statuses: UserStatus[]) => {
            setOnlineUsers(new Set(statuses.filter(s => s.isOnline).map(s => s.userId)));
        });

        return () => {
            socketRef.current?.disconnect();
            if (socketRef.current) {
                socketRef.current.off('userTyping');
                socketRef.current.off('userStoppedTyping');
            }
        };
    }, [chatId, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("Recipient data:", recipient);
    }, [recipient]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        // Emit socket event
        socketRef.current.emit('sendMessage', chatId, user?.id, newMessage);
        setNewMessage('');
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (socketRef.current) {
            socketRef.current.emit('typing', chatId, user?.id, user?.name || 'User');

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('stopTyping', chatId, user?.id);
            }, 1000);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg" style={{
                maxWidth: '800px',
                margin: '0 auto',
                height: '80vh',
                borderRadius: '15px',
                backgroundColor: '#f8f9fa'
            }}>
                {/* Add chat header */}
                {recipient && (
                    <div className="card-header bg-white border-bottom py-3">
                        <div className="d-flex align-items-center">
                            <img
                                src={recipient.image_url}
                                alt={recipient.name}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                                <h6 className="mb-0">{recipient.name}</h6>
                                <small className="text-muted">
                                    {onlineUsers.has(recipient.id) ?
                                        <span className="text-success">● Online</span> :
                                        <span className="text-secondary">● Offline</span>
                                    }
                                </small>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body d-flex flex-column" style={{ height: recipient ? 'calc(100% - 72px)' : '100%' }}>
                    <div className="flex-grow-1 overflow-auto mb-3"
                        style={{
                            maxHeight: 'calc(80vh - 100px)',
                            padding: '10px'
                        }}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: String(message.user_id) === String(user?.id) ? 'flex-end' : 'flex-start',
                                    margin: '8px 0',
                                    position: 'relative'
                                }}
                                className="mb-2"
                            >
                                <div
                                    className={`p-3 rounded-4 shadow-sm ${message.user_id === user?.id
                                        ? 'bg-primary bg-gradient'
                                        : 'bg-white'
                                        }`}
                                    style={{
                                        maxWidth: '70%',
                                        wordWrap: 'break-word',
                                        position: 'relative',
                                        borderTopRightRadius: message.user_id === user?.id ? '4px' : '20px',
                                        borderTopLeftRadius: message.user_id === user?.id ? '20px' : '4px',
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1rem',
                                        color: message.user_id === user?.id ? '#fff' : '#212529'
                                    }}>{message.content}</div>
                                    <small
                                        className={message.user_id === user?.id ? 'text-white-50' : 'text-muted'}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                                    </small>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {typingUsers.size > 0 && (
                            <div
                                className="typing-indicator-container"
                                style={{
                                    position: 'sticky',
                                    bottom: 0,
                                    padding: '8px',
                                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                    borderRadius: '12px',
                                    margin: '8px 0',
                                    zIndex: 1
                                }}
                            >
                                <div
                                    className="typing-bubble"
                                    style={{
                                        background: '#e9ecef',
                                        padding: '8px 16px',
                                        borderRadius: '18px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div className="dots-container" style={{ display: 'inline-flex', gap: '4px', marginRight: '8px' }}>
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    backgroundColor: '#6c757d',
                                                    borderRadius: '50%',
                                                    animation: `typing 1s infinite`,
                                                    animationDelay: `${i * 0.2}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ color: '#495057', fontSize: '0.875rem' }}>
                                        {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <style>
                        {`
                            @keyframes typing {
                                0%, 100% { transform: translateY(0); opacity: 0.5; }
                                50% { transform: translateY(-4px); opacity: 1; }
                            }
                        `}
                    </style>

                    <form onSubmit={handleSendMessage} className="mt-auto">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control rounded-pill me-2"
                                style={{
                                    border: '1px solid #dee2e6',
                                    padding: '12px 20px',
                                    backgroundColor: '#fff'
                                }}
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                            />
                            <button
                                type="submit"
                                className="btn btn-primary rounded-pill px-4"
                                style={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;