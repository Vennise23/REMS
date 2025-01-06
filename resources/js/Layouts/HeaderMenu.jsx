import React, { useState, useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import logo from "/resources/img/REMS_logo_light.png";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";

export default function HeaderMenu({ auth }) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    axios.defaults.headers.common["Accept"] = "application/json";

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [chatRooms, setChatRooms] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalNotifications, setTotalNotifications] = useState(0);

    // Fetch and update unread message counts
    const updateUnreadCounts = async () => {
        try {
            const response = await axios.get("/api/chat-rooms");
            if (response.data) {
                setChatRooms(response.data.chatRooms);
                setTotalUnreadCount(response.data.totalUnreadCount);
            }
        } catch (error) {
            console.error("Error fetching chat rooms:", error);
        }
    };

    // Real-time listening for new messages in all chat rooms
    useEffect(() => {
        if (!auth?.user) return;

        fetchNotifications();
        // Initial load
        updateUnreadCounts();

        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);

        // Listen for message count updates
        channel.listen(".message.count.updated", (e) => {
            console.log("Received message count update:", e);
            updateUnreadCounts(); // Trigger recount of unread messages
        });

        // Listen for new messages
        channel.listen(".message.sent", (e) => {
            console.log("Received new message:", e);
            updateUnreadCounts(); // Update unread count when new message arrives
        });

        return () => {
            channel.stopListening(".message.count.updated");
            channel.stopListening(".message.sent");
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
            router.visit(route("chat.show", { chatRoom: roomId }));

            // Optional: Mark chat room messages as read
            axios
                .post(`/api/chat-rooms/${roomId}/mark-as-read`)
                .then(() => {
                    // Update unread message counts
                    updateUnreadCounts();
                })
                .catch((error) => {
                    console.error("Error marking messages as read:", error);
                });
        } catch (error) {
            console.error("Error handling chat room click:", error);
        }
    };

    const handleBlurMessage = () => {
        setTimeout(() => {
            setShowMessages(false);
        }, 50);
    };

    const handleBlurNotifications= () => {
        setTimeout(() => {
            setShowNotifications(false);
        }, 1000);
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("/notifications");
            // console.log("response", response);
            if (response.data) {
                const unreadNotifications = response.data.notifications.filter(
                    (notification) => !notification.isRead
                );
                setNotifications(unreadNotifications);
                setTotalNotifications(unreadNotifications.length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleNotificationClick = (notificationId, e) => {
        console.log('click')
        setShowNotifications(false);
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    
        axios
            .post(`/notifications/${notificationId}/mark-as-read`)
            .catch((error) => {
                console.error("Error marking notification as read", error);
                setNotifications((prevNotifications) =>
                    prevNotifications.map((notification) =>
                        notification.id === notificationId
                            ? { ...notification, isRead: false }
                            : notification
                    )
                );
            });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);
    
    return (
        <header className="bg-gray-100 p-6 border-b border-gray-300 fixed top-0 left-0 w-full z-50 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img
                        src={logo}
                        alt="Real Estate Logo"
                        className="w-12 h-12"
                    />
                </div>

                <div className="flex-grow flex justify-center">
                    <nav className="flex space-x-8">
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
                            href={route("find-seller")}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Find Seller
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center space-x-4 absolute right-40 top-1/2 transform -translate-y-1/2">
                    {auth?.user && (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                // onBlur={handleBlurNotifications}
                                className="relative text-gray-600 hover:text-gray-900"
                            >
                                <IoNotifications className="w-6 h-6" />
                                {totalNotifications > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-2 py-1 ${
                                            notifications.some((n) => !n.isRead)
                                                ? ""
                                                : "hidden"
                                        }`}
                                    >
                                        {totalNotifications}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Notifications
                                        </h3>
                                        {notifications.length === 0 ? (
                                            <div className="text-gray-500 text-center">
                                                No related notifications
                                            </div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification.id)}
                                                        className={`p-3 hover:bg-gray-50 cursor-pointer border-b flex justify-between items-center ${
                                                            notification.isRead
                                                                ? ''
                                                                : notification.status === 'approved'
                                                                ? 'bg-green-100'
                                                                : notification.status === 'rejected'
                                                                ? 'bg-red-100'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">
                                                                {notification.property_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {notification.status === 'approved' ? (
                                                                    <span>This property has been approved.</span>
                                                                ) : notification.status === 'rejected' ? (
                                                                    <>
                                                                        <span>This property has been rejected.</span>
                                                                        <br />
                                                                        <span className="font-bold text-red-500 text-sm">Rejection Reason: {notification.rejection_reason}.</span>
                                                                    </>
                                                                ) : (
                                                                    "No update"
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {auth?.user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMessages(!showMessages)}
                                // onBlur={handleBlurMessage}
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
                                        <h3 className="text-lg font-semibold mb-4">
                                            Messages
                                        </h3>
                                        <div className="max-h-96 overflow-y-auto">
                                            {chatRooms.map((room) => {
                                                const otherUser =
                                                    auth.user.id ===
                                                    room.buyer?.id
                                                        ? room.seller
                                                        : room.buyer;

                                                return (
                                                    <div
                                                        key={room.id}
                                                        onClick={() =>
                                                            handleChatRoomClick(
                                                                room.id
                                                            )
                                                        }
                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b flex justify-between items-center"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">
                                                                Chat with{" "}
                                                                {
                                                                    otherUser?.firstname
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                About:{" "}
                                                                {
                                                                    room
                                                                        .property
                                                                        ?.property_name
                                                                }
                                                            </div>
                                                        </div>
                                                        {room.unread_count >
                                                            0 && (
                                                            <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                                {
                                                                    room.unread_count
                                                                }
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
                                        <Link
                                            href={route("my.properties")}
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            My Properties
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
                                            href={route("profile.show")}
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            User Profile
                                        </Link>
                                        <Link
                                            href={route("my.properties")}
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            My Properties
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
    );
}
