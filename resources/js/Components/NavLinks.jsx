import { Link } from "@inertiajs/react";
import React from "react";

const NavLinks = ({ textColor, links }) => {
    return (
        <div className="hidden md:flex justify-center space-x-4">
            <nav className="flex space-x-8">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={route(link.href)}
                        className={`${textColor} font-medium`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default NavLinks;
