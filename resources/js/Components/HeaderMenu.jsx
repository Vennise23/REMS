import React, { useState, useEffect } from "react";
import { Link, Head } from "@inertiajs/react";
import logo from "/resources/img/REMS_logo_light.png";
import axios from "axios";
import { route } from "ziggy-js";

export default function HeaderMenu({ auth }) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    const [dropdownOpen, setDropdownOpen] = useState(false);

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
                            href={route('main')}
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
                            href="#"
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
                        {auth.user ? (
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
                                                    : "/default_profile.png"
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
