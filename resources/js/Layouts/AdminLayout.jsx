// resources/js/Layouts/AdminLayout.jsx

import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Real Estate Management System</h1>
                {/* <nav>
                    <Link href="/admin/settings" className="text-white hover:underline">Log Out</Link>
                </nav> */}
            </header>

            {/* Main Content */}
            <main className="p-6">
                {children}
            </main>
        </div>
    );
}
