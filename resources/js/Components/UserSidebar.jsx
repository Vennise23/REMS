import React from "react";
import { Link } from "@inertiajs/react";

export default function UserSidebar() {
    return (
        <aside className="w-64 bg-white p-6 shadow-md h-full fixed top-0 left-0 pt-32">
            <ul className="space-y-4">
                <li>
                    <Link href="/profile" className="text-gray-700 font-semibold hover:text-red-500">
                        My Profile
                    </Link>
                </li>
                <li>
                    <Link href="/accounts_setting" className="text-gray-700 font-semibold hover:text-red-500">
                        Accounts Setting
                    </Link>
                </li>

            </ul>
        </aside>
    );
}
