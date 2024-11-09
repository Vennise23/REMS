import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import logo from "/resources/img/REMS_logo_light.png";
import backgroundImage from "/resources/img/estate_property_background.jpg";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";

export default function Main({ auth }) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    const [isBuy, setIsBuy] = useState(true);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        Inertia.post(route('logout')); // Use Inertia.post for logout
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
                            href="#"
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

            {/* Main Content Section */}
            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                {/* Background Image */}
                <div
                    className="relative w-full max-w-4xl h-80 bg-cover bg-center mb-8"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    {/* Overlay with Search Options */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-3xl bg-[#f7f1e8] p-8 rounded-xl shadow-lg">
                        {/* Buy / Rent Toggle Buttons */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => setIsBuy(true)}
                                className={`px-6 py-2 font-bold rounded-l-full ${
                                    isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setIsBuy(false)}
                                className={`px-6 py-2 font-bold rounded-r-full ${
                                    !isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Rent
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center bg-white p-2 rounded-full shadow-md mb-4">
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="flex-grow bg-transparent border-none focus:outline-none px-4 rounded-full"
                            />
                            <button className="bg-red-500 text-white px-6 py-2 rounded-full">
                                Search
                            </button>
                        </div>

                        {/* Filter Options */}
                        <div className="flex justify-around">
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>Categories</option>
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Land</option>
                            </select>
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>All Property</option>
                                <option>House</option>
                                <option>Apartment</option>
                                <option>Office</option>
                            </select>
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>Price Range</option>
                                <option>$0 - $100,000</option>
                                <option>$100,000 - $500,000</option>
                                <option>$500,000+</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
