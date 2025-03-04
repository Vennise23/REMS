import React, { useState, useEffect, use } from "react";
import { Link, Head, router } from "@inertiajs/react";
import ApplicationLogo from "../Components/ApplicationLogo";
import { usePage } from '@inertiajs/react';
import axios from "axios";
import SideMenu from "../Components/SideMenu";
import SideMenuToggleButton from "../Components/SideMenuToggleBtn";
import NavLinks from "../Components/NavLinks";
import Dropdown from '@/Components/Dropdown';
import { IoNotifications } from "react-icons/io5";
import { FaEnvelope } from "react-icons/fa";

export default function MainLayout({ children }) {
    // Header Menu Declaration
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuLinks, setMenuLinks] = useState([]);
    const [smallScreenOnly, setSmallScreenOnly] = useState(false);
    // Header Design Declaration
    const [bgOpacity, setBgOpacity] = useState("bg-transparent");
    const [textColor, setTextColor] = useState("text-white-600 hover:text-white-900");
    const [fillColor, setFillColor] = useState("rgb(118,139,114)");
    // Toggle Menu Notification, Chat
    const [notifications, setNotifications] = useState([]);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [chatRooms, setChatRooms] = useState([]);
    const [totalUnreadChat, settotalUnreadChat] = useState(0);

    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.withCredentials = true;

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

        if (window.location.pathname === "/") {
            setBgOpacity("bg-transparent bg-opacity-0 shadow-none text-white");
            setTextColor("text-white-600 hover:text-red")
            setFillColor("white");

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

    useEffect(() => {
        if (menuOpen == true) {
            setBgOpacity("bg-gray-100 bg-opacity-100 shadow-md");
            setTextColor("text-grey-600 hover:text-grey-900");
            setFillColor("rgb(118,139,114)");
        } else {
            if (window.scrollY === 0 && window.location.pathname === "/") {
                setBgOpacity("bg-transparent bg-opacity-0 shadow-none text-white hover:text-red");
                setTextColor("text-white-600 hover:text-red")
                setFillColor("white");
            }
        }
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            await axios.post(route("logout"), {}, {
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content
                }
            });
            window.location.reload();
        } catch (error) {
            if (error.response && error.response.status === 419) {
                console.warn("Error 419: CSRF token issue. Reloading page...");
                window.location.reload(); // Reload to refresh CSRF token
            } else {
                console.error("Logout failed:", error);
            }
        }
    };

    // Get auth data from Inertia page props
    const { auth } = usePage().props;

    return (
        <div className="min-h-[screen] bg-gray-100">
            <header className={`p-6 z-60 fixed top-0 left-0 w-full flex flex-wrap item-center z-50 shadow-md transition-colors duration-500 ease-in-out ${bgOpacity}`}>
                <div className="container mx-auto flex justify-between items-center">

                    <div className="flex items-center space-x-4">
                        {menuLinks.length > 0 && (
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className={`focus:outline-none flex-grow justify-center
                                ${smallScreenOnly ? "md:hidden" : ""}`}>
                                <SideMenuToggleButton />
                            </button>
                        )}
                        <Link href={route("main")} >
                            <div className="w-13 h-12">
                                <ApplicationLogo fillColor={fillColor.toString()} />
                            </div>
                        </Link>
                    </div>

                    <NavLinks textColor={textColor} links={menuLinks} />

                    <div className="flex items-center space-x-4">
                        {auth?.user ? (
                            <>
                                <Dropdown id="Notification">
                                    <Dropdown.Trigger notify={totalNotifications}>
                                        <IoNotifications className="w-6 h-6" />
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Title>Notification</Dropdown.Title>
                                        {notifications.length === 0 ? (
                                            <Dropdown.Text>No related notifications</Dropdown.Text>
                                        ) : (
                                            notifications.map((notification) => (
                                                <Dropdown.Link
                                                    href={route('notification-detail/' + notification.id)}
                                                    className={(notification.isRead) ? '' : ((notification.status === 'approved') ? 'bg-green-100' : 'bg-reed-100')}
                                                >
                                                    <Dropdown.BoxLink title={notification.property_name}>
                                                        {notification.status === 'approved' ? (
                                                            <span>This property has been approved.</span>
                                                        ) : notification.status === 'rejected' ? (
                                                            <>
                                                                <span>This property has been rejected.</span>
                                                                <br />
                                                                <span className="font-bold text-red-500 text-sm">Rejection Reason: {notification.rejection_reason}.</span>
                                                            </>
                                                        ) : ('')}
                                                    </Dropdown.BoxLink>
                                                </Dropdown.Link>
                                            ))
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>

                                <Dropdown id="Message">
                                    <Dropdown.Trigger notify={totalUnreadChat}>
                                        <FaEnvelope className="w-6 h-6" />
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Title>Message</Dropdown.Title>
                                        {chatRooms.length === 0 ? (
                                            <Dropdown.Text>No Message Received.</Dropdown.Text>
                                        ) : (
                                            chatRooms.map((room) => {
                                                const otherUser = auth.user.id === room.buyer?.id ? room.seller : room.buyer;
                                                return (
                                                    <Dropdown.Link
                                                        href={route('chatRoom/' + room.id)}
                                                        className={(room.unread_count > 0) ? 'bg-orange-100' : ''}
                                                    >
                                                        <Dropdown.BoxLink title={otherUser?.firstname} notify={room.unread_count}>
                                                            {room.property?.property_name}
                                                        </Dropdown.BoxLink>
                                                    </Dropdown.Link>
                                                );
                                            })
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>

                                <Dropdown id="user">
                                    <Dropdown.Trigger className={"inline-flex items-center justify-around w-28"}>
                                        <img
                                            src={auth.user.profile_picture ? `/storage/${auth.user.profile_picture}` : "https://ui-avatars.com/api/?name=User&background=random"}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                        {auth.user.firstname}
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        {auth.user?.role === "admin" && (
                                            <Dropdown.Link href={route("admin.dashboard")}>Admin Dashboard</Dropdown.Link>
                                        )}
                                        <Dropdown.Link href={route("profile.show")}>User Profile</Dropdown.Link>
                                        <Dropdown.Link href={route("my.properties")}>Manage Properties</Dropdown.Link>
                                        <Dropdown.Link as="button" onClick={handleLogout}>Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </>
                        ) : (
                            <>
                                <Link href={route("login")} className={`${textColor} text-decoration-none mx-2`}>
                                    Login
                                </Link>
                                <span className={`${textColor}`}>|</span>
                                <Link href={route("register")} className={`${textColor} text-decoration-none mx-2`}>
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <div className=" relative w-full">
                {menuLinks.length > 0 && menuOpen &&
                    <>
                        {menuOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 z-10"
                                onClick={() => setMenuOpen(false)}
                            ></div>
                        )}
                        <div className="relative z-20">
                            <SideMenu menuState={menuOpen} links={menuLinks} smallScreenOnly={true} />
                        </div>
                    </>
                }
                <div className="flex h-screen">
                    <main className={`flex-1 min-h-screen bg-gray-100 transition-all duration-500 md:ml-full`}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}