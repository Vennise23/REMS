import React, { useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import logo from "/resources/img/REMS_logo_light.png";
import { router } from '@inertiajs/react'

export default function Header({ auth = { user: null } }) {
    const user = auth?.user || null;

    return (
        <header className="bg-gray-100 p-6 border-b border-gray-300 fixed top-0 left-0 w-full z-50 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img src={logo} alt="Real Estate Logo" className="w-12 h-12"/>
                </div>

                <nav className="flex-grow flex justify-center space-x-8">
                    <Link href={route("main")} className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
                    <Link href={route("buy")} className="text-gray-600 hover:text-gray-900 font-medium">Buy</Link>
                    <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Rent</Link>
                    <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">New Launches</Link>
                    <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Find Agent</Link>
                </nav>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <Link href={route("dashboard")} className="font-semibold text-gray-600 hover:text-gray-900">Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route("login")} className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
                            <Link href={route("register")} className="text-gray-600 hover:text-gray-900 font-medium">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}