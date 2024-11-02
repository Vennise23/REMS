// resources/js/Pages/Admin/AdminDashboard.jsx

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminSidebar from '@/Layouts/AdminSidebar';

export default function AdminDashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-50 lg:hidden z-10"
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <AdminLayout>
                    {/* Mobile toggle button for sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-4 text-blue-800"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                    </button>

                    {/* Page Content */}
                    <main className="p-6 bg-white rounded-lg shadow-md flex-1">
                        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
                        <p>Welcome to the admin dashboard! Here you can view various stats and manage the application.</p>
                        {/* Additional dashboard content */}
                    </main>
                </AdminLayout>
            </div>
        </div>
    );
}
