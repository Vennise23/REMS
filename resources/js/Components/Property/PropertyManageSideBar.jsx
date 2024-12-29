import React from "react";
import { Link, router } from "@inertiajs/react";

export default function PropertyManageSidebar({}) {
    return (
        <aside className="w-64 bg-white p-6 shadow-md h-full fixed top-0 left-0 pt-32">
            <ul className="space-y-4">
                <li>
                    <Link
                        href={route("my.properties")}
                        className="text-gray-700 font-semibold hover:text-red-500"
                    >
                        My properties
                    </Link>
                </li>
                <li>
                    <Link
                        href={route("manage.property")}
                        className="text-gray-700 font-semibold hover:text-red-500"
                    >
                        Manage Property
                    </Link>
                </li>
            </ul>
        </aside>
    );
}
