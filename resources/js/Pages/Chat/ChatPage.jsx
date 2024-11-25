import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function ChatPage({ auth, chatRoom }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const loadMessages = async () => {
        try {
            const response = await axios.get(`/api/chat-rooms/${chatRoom.id}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    useEffect(() => {
        if (chatRoom?.id) {
            loadMessages();

            const channel = window.Echo.private(`chat.${chatRoom.id}`);
            
            channel.listen('.message.sent', (e) => {
                if (e.message.sender_id !== auth.user.id) {
                    setMessages(prevMessages => [...prevMessages, e.message]);
                }
            });

            return () => {
                channel.stopListening('.message.sent');
                window.Echo.leave(`chat.${chatRoom.id}`);
            };
        }
    }, [chatRoom?.id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post('/api/chat-messages', {
                chat_room_id: chatRoom.id,
                message: newMessage.trim()
            });
            
            setMessages(prevMessages => [...prevMessages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read
    const markAsRead = async () => {
        try {
            await axios.post(`/api/chat-rooms/${chatRoom.id}/mark-as-read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Update read status when messages load or new message received
    useEffect(() => {
        if (messages.length > 0) {
            window.dispatchEvent(new CustomEvent('updateChatRead', {
                detail: { roomId: chatRoom.id }
            }));
        }
    }, [messages]);

    return (
        <MainLayout>
            <Head title="Chat" />
            <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] mt-4 p-4">
                <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
                        <div className="flex items-center space-x-4">
                            {/* User Avatar */}
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold">
                                {(auth.user.id === chatRoom.buyer_id 
                                    ? chatRoom.seller?.firstname 
                                    : chatRoom.buyer?.firstname).charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {chatRoom.property?.property_name}
                                </h2>
                                <p className="text-blue-100">
                                    Chatting with {auth.user.id === chatRoom.buyer_id 
                                        ? chatRoom.seller?.firstname 
                                        : chatRoom.buyer?.firstname}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        message.sender_id === auth.user.id
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] break-words ${
                                            message.sender_id === auth.user.id
                                                ? 'bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl'
                                                : 'bg-white text-gray-800 rounded-t-2xl rounded-br-2xl shadow-sm'
                                        } p-4 relative`}
                                    >
                                        {message.message}
                                        {/* Timestamp */}
                                        <span className={`text-xs mt-1 block opacity-70 ${
                                            message.sender_id === auth.user.id
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                        }`}>
                                            {new Date().toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-4 bg-white border-t">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border-2 border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Type your message..."
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
} 