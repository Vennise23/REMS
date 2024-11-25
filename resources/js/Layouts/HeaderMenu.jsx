import React, { useState, useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import logo from "/resources/img/REMS_logo_light.png";
import axios from "axios";
import { FaEnvelope } from 'react-icons/fa';

export default function Main({ auth }) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    axios.defaults.headers.common['Accept'] = 'application/json';

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [chatRooms, setChatRooms] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // Fetch and update unread message counts
    const updateUnreadCounts = async () => {
        try {
            const response = await axios.get('/api/chat-rooms');
            if (response.data) {
                setChatRooms(response.data.chatRooms);
                setTotalUnreadCount(response.data.totalUnreadCount);
            }
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        }
    };

    // Real-time listening for new messages in all chat rooms
    useEffect(() => {
        if (!auth?.user) return;

        // Initial load
        updateUnreadCounts();

        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
        
        // Listen for message count updates
        channel.listen('.message.count.updated', (e) => {
            console.log('Received message count update:', e);
            updateUnreadCounts(); // Trigger recount of unread messages
        });

        // Listen for new messages
        channel.listen('.message.sent', (e) => {
            console.log('Received new message:', e);
            updateUnreadCounts(); // Update unread count when new message arrives
        });

        return () => {
            channel.stopListening('.message.count.updated');
            channel.stopListening('.message.sent');
            window.Echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [auth?.user]);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route("logout"));
            console.log("Logout successful:", response);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Handle chat room click
    const handleChatRoomClick = (roomId) => {
        try {
            // Close messages dropdown
            setShowMessages(false);
            
            // Navigate using Inertia router
            router.visit(route('chat.show', { chatRoom: roomId }));
            
            // Optional: Mark chat room messages as read
            axios.post(`/api/chat-rooms/${roomId}/mark-as-read`)
                .then(() => {
                    // Update unread message counts
                    updateUnreadCounts();
                })
                .catch(error => {
                    console.error('Error marking messages as read:', error);
                });
        } catch (error) {
            console.error('Error handling chat room click:', error);
        }
    };

    return (
        <>
            <Head title="Main" />
            {/* Header Section */}
            <header className="bg-gray-100 p-6 border-b border-gray-300 fixed top-0 left-0 w-full z-50 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-4">
                        <img
                            src={logo}
                            alt="Real Estate Logo"
                            className="w-12 h-12"
                        />
                    </div>

                    {/* Tab Bar */}
                    <nav className="flex-grow flex justify-center space-x-8">
                        <Link
                            href={route("main")}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href={route("buy")}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Buy
                        </Link>
                        <Link
                            href={route("rent")}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Rent
                        </Link>
                        <Link
                            href="#"
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            New Launches
                        </Link>
                        <Link
                            href="#"
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Find Agent
                        </Link>
                    </nav>

                    {/* User/Admin Bar */}
                    <div className="flex items-center space-x-4">
                        {auth?.user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMessages(!showMessages)}
                                    className="relative p-2 text-gray-600 hover:text-gray-900"
                                >
                                    <FaEnvelope className="w-6 h-6" />
                                    {totalUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                            {totalUnreadCount}
                                        </span>
                                    )}
                                </button>
                                
                                {showMessages && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-4">Messages</h3>
                                            <div className="max-h-96 overflow-y-auto">
                                                {chatRooms.map(room => {
                                                    // Determine the other user in the conversation
                                                    const otherUser = auth.user.id === room.buyer?.id ? room.seller : room.buyer;
                                                    
                                                    return (
                                                        <div
                                                            key={room.id}
                                                            onClick={() => handleChatRoomClick(room.id)}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b flex justify-between items-center"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-medium">
                                                                    Chat with {otherUser?.firstname}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    About: {room.property?.property_name}
                                                                </div>
                                                            </div>
                                                            {room.unread_count > 0 && (
                                                                <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                                    {room.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {auth?.user ? (
                            auth.user.role === "admin" ? (
                                // Admin view
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2"
                                    >
                                        <span className="font-semibold text-gray-600 hover:text-gray-900">
                                            Admin
                                        </span>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                            <Link
                                                href={route("admin.dashboard")}
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                Admin Dashboard
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Regular user view
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2"
                                    >
                                        <img
                                            src={
                                                auth.user.profile_picture
                                                    ? `/storage/${auth.user.profile_picture}`
                                                    : "https://ui-avatars.com/api/?name=User&background=random"
                                            }
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />

                                        <span className="font-semibold text-gray-600 hover:text-gray-900">
                                            {auth.user.firstname}
                                        </span>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                            <Link
                                                href={route("profile")}
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                User Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            // Not logged in
                            <>
                                <Link
                                    href={route("login")}
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}