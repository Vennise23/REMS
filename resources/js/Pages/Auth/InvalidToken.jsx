import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function InvalidToken({message=""}) {
    const [gradientStyle, setGradientStyle] = useState({
        background: "linear-gradient(to top left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5))",
        backgroundSize: "200% 200%",
        animation: "gradientShift 3s infinite alternate ease-in-out",
    });

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
                    @keyframes gradientShift {
                        0% {
                            background-position: bottom right;
                        }
                        100% {
                            background-position: top left;
                        }
                    }
                `;
        document.head.appendChild(styleSheet);
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-auto bg-transparent ">
            <div
                className="w-full sm:w-auto md:min-w-[600px] min-h-fit max-w-md sm:max-w-lg mx-auto p-8 rounded-lg shadow-md flex flex-col justify-center relative overflow-hidden"
                style={gradientStyle}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-red-600">
                        Invalid Token
                    </h2>
                    <p className="mt-4">
                        {/* This password reset link has already been used or is invalid. */}
                        {message}
                        Please request a new password reset link if needed.
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4">
                    <SecondaryButton>
                        <Link href={route('login')}>Return to Login</Link>
                    </SecondaryButton>

                    <DangerButton>
                        <Link href={route('password.request')}>Request New Link</Link>
                    </DangerButton>
                </div>
            </div>
        </div>
    );
} 