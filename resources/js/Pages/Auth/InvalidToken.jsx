import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function InvalidToken() {
    return (
        <GuestLayout>
            <Head title="Invalid Token" />
            
            <div className="mb-4 text-sm text-gray-600 text-center">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-red-600">
                        Invalid Token
                    </h2>
                    <p className="mt-4">
                        This password reset link has already been used or is invalid.
                        Please request a new password reset link if needed.
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Return to Login
                    </Link>
                    
                    <Link
                        href={route('password.request')}
                        className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 focus:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
} 