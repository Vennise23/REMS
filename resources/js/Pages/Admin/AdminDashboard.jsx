import React, { useState } from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import AdminSidebar from '@/Layouts/Admin/AdminSidebar';

export default function AdminDashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
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
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50">
                <AdminLayout>
                    {/* Mobile toggle button for sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-4 text-blue-600"
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
                    <main className="p-6 bg-white rounded-lg shadow-md flex-1 overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">This will the summary display of admin </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Left Column - Main Content */}
                            <div className="col-span-2 bg-gray-100 rounded-lg shadow p-4">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">Sample Title Text</h3>
                                <img src="https://via.placeholder.com/600x400" alt="Placeholder" className="rounded-lg mb-4" />
                                <p className="text-gray-700">
                                    Many say exploration is part of our destiny, but it's actually our duty to future generations and their quest to ensure the survival of the human species.
                                </p>
                            </div>

                            {/* Right Column - Links */}
                            <div className="flex flex-col space-y-4">
                                <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                                    <div className="text-blue-600">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            {/* Sample Icon */}
                                            <path d="M12 2L2 22h20L12 2zm0 3.84L18.94 20H5.06L12 5.84z"></path>
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-gray-800">Total of User</span>
                                </div>

                                <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                                    <div className="text-green-600">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            {/* Sample Icon */}
                                            <path d="M2 12L12 2l10 10-10 10L2 12z"></path>
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-gray-800">Pending Approved</span>
                                </div>

                                <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                                    <div className="text-purple-600">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            {/* Sample Icon */}
                                            <path d="M12 2l7 7-7 7-7-7 7-7z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800">Live Long & Prosper</span>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Space, the final frontier. These are the voyages of the Starship Enterprise. Its five-year mission: to explore strange new worlds.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </AdminLayout>
            </div>
        </div>
    );
}
