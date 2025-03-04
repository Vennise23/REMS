import React, { useState, useEffect } from "react";
import { Link, Head, router } from "@inertiajs/react";
import ApplicationLogo from "../Components/ApplicationLogo";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import SideMenu from "../Components/SideMenu";
import SideMenuToggleButton from "../Components/SideMenuToggleBtn";

export default function HeaderMenu({ auth }) {
    const [menuState, setMenuState] = useState({
        showNotifications: false,
        showMessages: false,
        dropdownOpen: false,
    });
    const [chatRooms, setChatRooms] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuLinks, setMenuLinks] = useState([]);
    const [smallScreenOnly, setSmallScreenOnly] = useState(false);
    const [bgOpacity, setBgOpacity] = useState("bg-transparent");
    const [textColor, setTextColor] = useState("text-white-600 hover:text-white-900");
    const [fillColor, setFillColor] = useState("rgb(118,139,114)");//for logo color

    useEffect(() => {
        // 设置 CSRF token
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }

        // 设置接受 JSON 响应
        axios.defaults.headers.common['Accept'] = 'application/json';

        // 设置 withCredentials
        axios.defaults.withCredentials = true;

        if (window.location.pathname === "/") {
            setBgOpacity("bg-transparent bg-opacity-0 shadow-none text-white");
            setTextColor("text-white-600 hover:text-red")
            setFillColor("white");

            setMenuLinks([
                {
                    href: "main",
                    label: "Home",
                    icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>),
                },
                {
                    href: "buy",
                    label: "Buy",
                    icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13a3 3 0 100 6 3 3 0 000-6m10 0a3 3 0 100 6 3 3 0 000-6" />
                    </svg>),
                },
                {
                    href: "rent",
                    label: "Rent",
                    icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="8" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12h6v-2h-3v-2h-3v4z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>),
                },
                {
                    href: "new-launches",
                    label: "New Launches",
                    icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="5" y="5" width="14" height="14" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2" />
                    </svg>),
                },
                {
                    href: "find-seller",
                    label: "Find Seller",
                    icon: (<svg className="w-6 h-6 stroke-current mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>),
                },
            ])
            setSmallScreenOnly(true);

            // for header getting transparent when scroll to top. (only in main page)
            const handleScroll = () => {
                const scrollY = window.scrollY;

                // If scrolled more than 50px, start making the background opaque
                if (scrollY > 50) {
                    setBgOpacity("bg-gray-100 bg-opacity-100 shadow-md");
                    setTextColor("text-grey-600 hover:text-grey-900");
                    setFillColor("rgb(118,139,114)");
                } else {
                    setBgOpacity("bg-transparent bg-opacity-0 shadow-none text-white hover:text-red");
                    setTextColor("text-white-600 hover:text-red")
                    setFillColor("white");
                }
            };

            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        } else {
            setBgOpacity("bg-gray-100 bg-opacity-100 shadow-md");
            setTextColor("text-grey-600 hover:text-grey-900");
            setFillColor("rgb(118,139,114)");
        }
    }, []);

    const handleToggle = (menu) => {
        setMenuState((prevState) => ({
            showNotifications: menu === "showNotifications" ? !prevState.showNotifications : false,
            showMessages: menu === "showMessages" ? !prevState.showMessages : false,
            dropdownOpen: menu === "dropdownOpen" ? !prevState.dropdownOpen : false,
        }));
    };

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
    // useEffect(() => {
    //     if (!auth?.user) return;

    //     fetchNotifications();
    //     // Initial load
    //     updateUnreadCounts();

    //     const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);

    //     // Listen for message count updates
    //     channel.listen(".message.count.updated", (e) => {
    //         console.log("Received message count update:", e);
    //         updateUnreadCounts(); // Trigger recount of unread messages
    //     });

    //     // Listen for new messages
    //     channel.listen(".message.sent", (e) => {
    //         console.log("Received new message:", e);
    //         updateUnreadCounts(); // Update unread count when new message arrives
    //     });

    //     return () => {
    //         channel.stopListening(".message.count.updated");
    //         channel.stopListening(".message.sent");
    //         window.Echo.leave(`App.Models.User.${auth.user.id}`);
    //     };
    // }, [auth?.user]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route("logout"));
            console.log("Logout successful:", response);
            window.location.href = "/";
        } catch (error) {
            // If 419 error occurs (CSRF token mismatch), refresh the page and retry logout
            if (error.response && error.response.status === 419) {
                console.warn("CSRF token expired, refreshing the page...");
                setTimeout(() => {
                    window.location.reload(); // Refresh the page to get a new CSRF token
                }, 1000);
            } else {
                console.error("Logout failed:", error);
            }
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

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("/notifications");
            console.log("API Response:", response.data);

            if (response.data && typeof response.data.notifications === "object") {
                // Convert object to array
                const notificationsArray = Object.values(response.data.notifications);

                // Filter unread notifications
                const unreadNotifications = notificationsArray.filter(
                    (notification) => !notification.isRead
                );

                setNotifications(unreadNotifications);
                setTotalNotifications(unreadNotifications.length);
            } else {
                console.error("Invalid notifications data structure:", response.data.notifications);
                setNotifications([]);
                setTotalNotifications(0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleNotificationClick = (notificationId, e) => {
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

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         fetchNotifications();
    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, []);

    return (
        <header className={`p-6  fixed top-0 left-0 w-full flex flex-wrap item-center z-50 shadow-md transition-colors duration-500 ease-in-out ${bgOpacity}`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {menuLinks.length > 0 && (
                        <button onClick={() => setMenuOpen(!menuOpen)}>
                            <SideMenuToggleButton smallScreenOnly={smallScreenOnly} />
                        </button>
                    )}
                    <Link
                        href={route("main")}
                    >
                        <div className="w-13 h-12">
                            <ApplicationLogo fillColor={fillColor.toString()} />
                        </div>

                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className=" hidden md:flex flex justify-center space-x-4">
                    <nav className="flex space-x-8">
                        <Link
                            href={route("main")}
                            className={`${textColor} font-medium`}
                        >
                            Home
                        </Link>
                        <Link
                            href={route("buy")}
                            className={`${textColor} font-medium`}
                        >
                            Buy
                        </Link>
                        <Link
                            href={route("rent")}
                            className={`${textColor} font-medium`}
                        >
                            Rent
                        </Link>
                        <Link
                            href={route("new-launches")}
                            className={`${textColor} font-medium`}
                        >
                            New Launches
                        </Link>
                        <Link
                            href={route("find-seller")}
                            className={`${textColor} font-medium`}
                        >
                            Find Seller
                        </Link>
                    </nav>
                </div>


                <div className="flex items-center space-x-4">
                    {auth?.user && (
                        <div className="relative">
                            <button
                                onClick={() => handleToggle("showNotifications")}
                                // onBlur={handleBlurNotifications}
                                className={`relative ${textColor}`}
                            >
                                <IoNotifications className="w-6 h-6" />
                                {totalNotifications > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-2 py-1 ${notifications.some((n) => !n.isRead)
                                            ? ""
                                            : "hidden"
                                            }`}
                                    >
                                        {totalNotifications}
                                    </span>
                                )}
                            </button>

                            {menuState.showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                                    <div className="p-4">
                                        <h3 className="text-gray-500 text-lg font-semibold mb-4">
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
                                                        className={`p-3 hover:bg-gray-50 cursor-pointer border-b flex justify-between items-center ${notification.isRead
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
                                onClick={() => handleToggle("showMessages")}
                                // onBlur={handleBlurMessage}
                                className={`relative p-2 ${textColor}`}
                            >
                                <FaEnvelope className="w-6 h-6" />
                                {totalUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                        {totalUnreadCount}
                                    </span>
                                )}
                            </button>

                            {menuState.showMessages && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                                    <div className="p-4">
                                        <h3 className="text-gray-500 text-lg font-semibold mb-4">
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
                                    onClick={() => handleToggle("dropdownOpen")}
                                    className="flex items-center space-x-2"
                                >
                                    <span className={`font-semibold ${textColor}`}>
                                        Admin
                                    </span>
                                </button>
                                {menuState.dropdownOpen && (
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
                                    onClick={() => handleToggle("dropdownOpen")}
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
                                    <span className={`font-semibold ${textColor}`}>
                                        {auth.user.firstname}
                                    </span>
                                </button>
                                {menuState.dropdownOpen && (
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
                            <div className=" d-flex justify-content-center align-items-center space-x-2">
                                <Link href={route("login")} className={`${textColor} text-decoration-none mx-2`}>
                                    Login
                                </Link>
                                <span className={`${textColor}`}>|</span>
                                <Link href={route("register")} className={`${textColor} text-decoration-none mx-2`}>
                                    Register
                                </Link>
                            </div>

                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
