import React from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Main({ auth }) {
    return (
        <>
            <Head title="Main" />
            {/* Header Section */}
            <header className="bg-gray-100 p-6 border-b border-gray-300">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-4">
                        <img src="/path/to/logo.png" alt="Real Estate Logo" className="w-12 h-12" />
                        {/* <h1 className="text-xl font-bold text-gray-800">REAL ESTATE</h1> */}
                    </div>

                    {/* Tab Bar */}
                    <nav className="flex-grow flex justify-center space-x-8">
                        <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Buy</Link>
                        <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Rent</Link>
                        <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">New Launches</Link>
                        <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Find Agent</Link>
                    </nav>

                    {/* User Bar */}
                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-gray-600 hover:text-gray-900"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
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
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
                    {/* Search Bar */}
                    <div className="flex items-center space-x-4 mb-6">
                        <button className="bg-red-500 text-white px-4 py-2 rounded-l-lg">Buy</button>
                        <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-r-lg">Rent</button>
                    </div>
                    {/* Filter Options */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Property Type"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Price Range"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Bedroom Count"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
