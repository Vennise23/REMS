import React from 'react';
import HeaderMenu from './HeaderMenu';
import { usePage } from '@inertiajs/react';

export default function MainLayout({ children }) {
    // Get auth data from Inertia page props
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            <HeaderMenu auth={auth} />
            <div className="pt-16">
                {children}
            </div>
        </div>
    );
}