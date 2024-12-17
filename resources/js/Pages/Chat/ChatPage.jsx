import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function ChatPage({ auth, chatRoom }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isSending, setIsSending] = useState(false);
    const messageIdsRef = useRef(new Set());
    const [otherUserStatus, setOtherUserStatus] = useState(null);

    // 计算对方的用户ID
    const otherUserId = chatRoom ? 
        (auth.user.id === chatRoom.buyer_id ? chatRoom.seller_id : chatRoom.buyer_id)
        : null;

    const loadMessages = async () => {
        try {
            const response = await axios.get(`/api/chat-rooms/${chatRoom.id}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    useEffect(() => {
        // 设置 axios 默认配置
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.withCredentials = true;

        if (chatRoom?.id) {
            const loadAndMarkMessages = async () => {
                try {
                    await loadMessages();
                    await markMessagesAsRead();
                } catch (error) {
                    console.error('Error in loadAndMarkMessages:', error);
                }
            };

            loadAndMarkMessages();

            const channel = window.Echo.private(`chat.${chatRoom.id}`);
            
            // 修改监听新消息事件的处理
            channel.listen('.message.sent', async (e) => {
                if (e.message.sender_id !== auth.user.id) {
                    setMessages(prevMessages => {
                        if (!messageIdsRef.current.has(e.message.id)) {
                            messageIdsRef.current.add(e.message.id);
                            // 立即标记为已读
                            markMessagesAsRead();
                            return [...prevMessages, e.message];
                        }
                        return prevMessages;
                    });
                }
            });

            // 添加用户状态频道监听
            const userStatusChannel = window.Echo.private(`user-status.${otherUserId}`);
            userStatusChannel.listen('.user.status', (e) => {
                console.log('Received status update:', e);
                setOtherUserStatus(e.status);
            });

            // 4. 组件卸载时清理
            return () => {
                channel.stopListening('.message.sent');
                window.Echo.leave(`chat.${chatRoom.id}`);
                userStatusChannel.stopListening('.user.status');
            };
        }
    }, [chatRoom?.id]);

    const markMessagesAsRead = async () => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (token) {
                axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            }
            
            await axios.post(`/api/chat-rooms/${chatRoom.id}/mark-as-read`);
            // 触发未读消息计数更新
            window.dispatchEvent(new CustomEvent('updateUnreadCounts'));
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const updateUnreadCounts = async () => {
        try {
            const response = await axios.get('/api/chat-rooms');
            if (response.data) {
                // This will trigger a re-render of HeaderMenu with updated counts
                window.dispatchEvent(new CustomEvent('unreadCountsUpdated', {
                    detail: response.data
                }));
            }
        } catch (error) {
            console.error('Error updating unread counts:', error);
        }
    };

    const markMessageAsRead = async (messageId) => {
        try {
            await axios.post(`/api/chat-rooms/${chatRoom.id}/mark-as-read`);
            window.dispatchEvent(new CustomEvent('updateUnreadCounts'));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (isSending || !newMessage.trim()) return;
        
        try {
            setIsSending(true);
            
            // 1. 发送消息到服务器
            const response = await axios.post(route('chat.messages.store', { chatRoom: chatRoom.id }), {
                chat_room_id: chatRoom.id,
                message: newMessage.trim()
            });

            // 2. 更新本地消息列表
            if (!messageIdsRef.current.has(response.data.id)) {
                messageIdsRef.current.add(response.data.id);
                setMessages(prevMessages => [...prevMessages, response.data]);
            }

            // 3. 同时更新自己的在线状态
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const locationResponse = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
                        );
                        const locationData = await locationResponse.json();
                        
                        await axios.post('/api/user/status', {
                            online: true,
                            last_activity: new Date().toISOString(),
                            location: locationData.display_name,
                            message_sent: true  // 标记这是消息发送触发的状态更新
                        });
                    } catch (error) {
                        await axios.post('/api/user/status', {
                            online: true,
                            last_activity: new Date().toISOString(),
                            message_sent: true
                        });
                    }
                });
            } else {
                await axios.post('/api/user/status', {
                    online: true,
                    last_activity: new Date().toISOString(),
                    message_sent: true
                });
            }

            // 4. 清空输入框并滚动到底部
            setNewMessage('');
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Auto-scroll when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!chatRoom?.id) return;

        let isComponentMounted = true;

        // 首次加载时检查对方状态
        const checkInitialStatus = async () => {
            try {
                const response = await axios.get(`/api/user-status/${otherUserId}`);
                if (isComponentMounted) {
                    setOtherUserStatus(response.data);
                }
            } catch (error) {
                console.error('Error checking initial status:', error);
            }
        };

        // 更新自己的状态
        const updateOwnStatus = async () => {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                            // 添加超时控制
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                                {
                                    headers: {
                                        'Accept-Language': 'en', // 指定英文
                                        'User-Agent': 'EREAL Property/1.0'
                                    },
                                    signal: controller.signal
                                }
                            );

                            clearTimeout(timeoutId);
                            
                            if (response.ok) {
                                const data = await response.json();
                                // 只获取城市和国家信息
                                const location = [
                                    data.address.city || data.address.town || data.address.suburb, // 城市/镇/区
                                    data.address.country  // 国家
                                ].filter(Boolean).join(', ');

                                await axios.post('/api/user/status', {
                                    online: true,
                                    last_activity: new Date().toISOString(),
                                    location: location || 'Johor Bahru, Malaysia', // 如果无法获取地址，使用默认值
                                    message_sent: true
                                });
                            } else {
                                throw new Error('Failed to get address');
                            }
                        } catch (error) {
                            console.error('Error getting address:', error);
                            await axios.post('/api/user/status', {
                                online: true,
                                last_activity: new Date().toISOString(),
                                location: 'Johor Bahru, Malaysia', // 使用默认位置
                                message_sent: true
                            });
                        }
                    }, (error) => {
                        console.error('Geolocation error:', error);
                        axios.post('/api/user/status', {
                            online: true,
                            last_activity: new Date().toISOString(),
                            message_sent: true
                        });
                    }, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 30000 // 缓存30秒
                    });
                } else {
                    await axios.post('/api/user/status', {
                        online: true,
                        last_activity: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        };

        // 修改状态更新间隔
        const statusInterval = setInterval(updateOwnStatus, 30000); // 改为30秒

        // 设置更频繁的状态查间隔（10秒）
        const checkInterval = setInterval(checkInitialStatus, 10000);

        // 初始化
        checkInitialStatus();
        updateOwnStatus();

        // 监听对方状态变化
        const userStatusChannel = window.Echo.private(`user-status.${otherUserId}`);
        userStatusChannel.listen('.user.status', (e) => {
            if (isComponentMounted) {
                console.log('Received status update:', e);
                // 立即更新状态
                setOtherUserStatus(e.status);
            }
        });

        // 添加窗口焦点事件监听
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkInitialStatus();
                updateOwnStatus();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 清理函数
        return () => {
            isComponentMounted = false;
            clearInterval(statusInterval);
            clearInterval(checkInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            userStatusChannel.stopListening('.user.status');
            
            // 发送离线状态
            axios.post('/api/user/status', {
                online: false,
                location: null,
                last_activity: null
            }).catch(error => {
                console.error('Error updating offline status:', error);
            });
        };
    }, [chatRoom?.id, otherUserId]);

    useEffect(() => {
        // 加载 Google Maps JavaScript API
        const loadGoogleMapsScript = () => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${window.googleMapsApiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        };

        if (!window.google) {
            loadGoogleMapsScript();
        }
    }, []);

    return (
        <MainLayout>
            <Head title="Chat" />
            <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] mt-4 p-4">
                <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold relative">
                                {(auth.user.id === chatRoom.buyer_id 
                                    ? chatRoom.seller?.firstname 
                                    : chatRoom.buyer?.firstname).charAt(0)}
                                {/* 只有当状态已加载时才显示状态指示器 */}
                                {otherUserStatus !== null && (
                                    <span 
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                            otherUserStatus.online ? 'bg-green-500' : 'bg-red-500'
                                        } border-2 border-white`}
                                        title={otherUserStatus.online ? 'Online' : 'Offline'}
                                    ></span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {chatRoom.property?.property_name}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <p className="text-blue-100">
                                        Chatting with {auth.user.id === chatRoom.buyer_id 
                                            ? chatRoom.seller?.firstname 
                                            : chatRoom.buyer?.firstname}
                                    </p>
                                    {otherUserStatus?.online && otherUserStatus.location && (
                                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate max-w-[300px] hover:text-clip" title={otherUserStatus.location}>
                                                {otherUserStatus.location}
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                                        {/* Update the timestamp display */}
                                        <span className={`text-xs mt-1 block opacity-70 ${
                                            message.sender_id === auth.user.id
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                        }`}>
                                            {new Date(message.created_at).toLocaleString([], { 
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: true
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
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                disabled={isSending || !newMessage.trim()}
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