import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[100vh] py-7 bg-gray-100">
            <div>
                <Link href="/">
                    <ApplicationLogo className="w-26 h-24 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="w-full max-w-3xl mt-4 px-8 py-6 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
