// resources/js/Layouts/AdminSidebar.jsx

import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { usePendingCount } from "@/Contexts/PendingCountContext";

export default function AdminSidebar({ isOpen, toggleSidebar }) {
    const { csrf_token } = usePage().props;
    const { pendingCount, fetchPendingCount } = usePendingCount();

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
        <aside
            className={`fixed inset-y-0 left-0 z-20 w-64 bg-blue-800 text-white p-6 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:min-h-screen`}
        >
            <div className="flex flex-col items-center mb-8">
                <img
                    src="/img/REMS_logo_dark.png" // Logo path (make sure it's in public/img/logo.png)
                    alt="Logo"
                    className="w-24 h-22 mb-2" // Adjust width and height as needed
                />
                <h2 className="text-2xl font-bold">REMS</h2>
            </div>

            <nav className="flex flex-col space-y-4">
                <Link
                    href={route("admin.dashboard")}
                    className="hover:bg-blue-700 p-2 rounded"
                >
                    Dashboard
                </Link>
                <Link
                    href={route("admin.users")}
                    className="hover:bg-blue-700 p-2 rounded"
                >
                    Manage Users
                </Link>
                <div className="relative">
                    <Link
                        href={route("admin.properties")}
                        className="hover:bg-blue-700 p-2 rounded flex items-center justify-between"
                    >
                        <span>Manage Property</span>
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                {pendingCount}
                            </span>
                        )}
                    </Link>
                </div>
                <Link
                    href="/admin/reports"
                    className="hover:bg-blue-700 p-2 rounded"
                >
                    Reports
                </Link>
                <Link>
                    <input
                        type="hidden"
                        name="_token"
                        value={csrf_token || ""}
                    />
                    <button
                        onClick={handleLogout}
                        className="w-full text-left hover:bg-blue-700 p-2 rounded"
                    >
                        Logout
                    </button>
                </Link>
            </nav>

            {/* Close button for mobile view */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden absolute top-4 right-4 text-white text-2xl"
            >
                &times;
            </button>
        </aside>
    );
}
