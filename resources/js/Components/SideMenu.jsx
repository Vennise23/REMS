import { Link } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { route } from "ziggy-js";



const SideMenu = ({ menuState, links = [], phoneOnlyLinks = [], smallScreenOnly = false }) => {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (parentId) => {
        setOpenMenus((prev) => ({
            ...prev,
            [parentId]: !prev[parentId],
        }));
    };

    const handleLogout = async () => {
        try {
            await axios.post(route("logout"), {}, {
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content
                }
            });
            window.location.reload();
        } catch (error) {
            if (error.response && error.response.status === 419) {
                console.warn("Error 419: CSRF token issue. Reloading page...");
                window.location.reload(); // Reload to refresh CSRF token
            } else {
                console.error("Logout failed:", error);
            }
        }
    };
    return (
        <>
            {smallScreenOnly ? (
                <div
                    className={`fixed md:relative top-0 min-h-screen overflow-hidden z-10 h-[70px] bg-gray-100 transition-[max-width,transform] duration-500 ease-in-out  
                    ${menuState ? "max-w-[400px] translate-x-0" : "max-w-0 -translate-x-full md:translate-x-0"}`}
                >
                    <nav className="flex flex-col space-y-4 p-4">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                className="cursor-pointer font-medium flex items-center space-x-2 px-4 py-2 hover:text-gray-900"
                                href={link.href ? route(link.href) : "#"}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            ) : (
                <div
                    className={`overflow-y-auto [&::-webkit-scrollbar]:w-1 overflow-x-hidden fixed  top-0 shadow-md min-h-screen transition-colors duration-500 ease-in-out max-h-full inline-block transition-[width,transform] duration-500 ease-in-out bg-white
                ${menuState ? "w-[250px]" : "w-[70px]"}`}
                >
                    {links.map((link, index) => {
                        if (link.type === "single") {
                            return (
                                <div
                                    key={index}
                                    className={`mt-[100px] flex flex-col justify-start items-center pl-4 w-full border-gray-100 border-b space-y-3 z-10 py-4  focus:bg-gray-300 hover:bg-gray-300 `}
                                >
                                    <Link
                                        className="flex justify-start items-center space-x-6 w-full focus:outline-none focus:text-indigo-400 rounded"
                                        href={link.href ? route(link.href) : "#"}
                                        title={link.label}
                                    >
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                            {link.icon}
                                        </span>
                                        <span
                                            className={`text-base leading-4 transition-opacity duration-300 ${menuState ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                                        >
                                            {link.label}
                                        </span>
                                    </Link>
                                </div>
                            );
                        }

                        if (link.type === "parent") {
                            return (
                                <div key={index} className={`flex flex-col justify-start items-center pl-4 border-b border-gray-300 w-full transition-all duration-300`}>
                                    {/* Parent Link */}
                                    <button onClick={() => toggleMenu(link.id)} className={`focus:outline-none focus:text-indigo-400 text-left flex justify-between items-center w-full py-4 space-x-14  `}>
                                        {menuState && (
                                            <span className="text-sm leading-5 uppercase transition-all duration-300">
                                                {link.label}
                                            </span>
                                        )}
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center space-x-0" title={link.label}>
                                            {openMenus[link.id] ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="currentColor" d="m7 10l5 5l5-5z" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="currentColor" d="m7 14l5-5l5 5z" /></svg>
                                            )}
                                        </span>
                                    </button>
                                    <div className={'flex justify-start  flex-col w-full md:w-auto items-start pb-1 transition-all duration-500 ease-in-out'}
                                        style={{
                                            maxHeight: openMenus[link.id] ? "fit-content" : "0px",
                                            opacity: openMenus[link.id] ? 1 : 0,
                                        }}
                                    >
                                        {/* Child Links - Show only if parent is open */}
                                        {openMenus[link.id] &&
                                            link.links.map((child, childIndex) => (
                                                <Link
                                                    key={childIndex}
                                                    className={`flex justify-start items-center space-x-6 hove text-gray-900 rounded  md:max-w-52 ${menuState ? "py-2 px-3 w-full focus:bg-gray-300 hover:bg-gray-300" : "py-0 px-0 w-fit"}`}
                                                    href={child.href ? route(child.href) : "#"}
                                                    title={child.label}
                                                >
                                                    <span className={`flex-shrink-0 flex items-center justify-center ${menuState ? "h-8 w-8 " : "focus:bg-gray-300 hover:bg-gray-300 h-[50px] rounded w-[50px]"}`}>
                                                        {child.icon}
                                                    </span>
                                                    <span
                                                        className={`transition-opacity duration-300 ${menuState ? "opacity-100 w-full" : "px-0 opacity-0 w-0 overflow-hidden"}`}
                                                    >
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }

                        return null;
                    })}
                    <div className={`flex flex-col justify-start items-center pl-4 w-full border-gray-100 border-b space-y-3 z-10 py-4  focus:bg-gray-300 hover:bg-gray-300 `}>
                        <Link
                            className="flex justify-start items-center space-x-6 w-full focus:outline-none focus:text-indigo-400 rounded"
                            href={handleLogout}
                            title={"Logout"}
                        >
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='24' height='24'><path fill="currentColor" d="M11 12.77q.329 0 .549-.23t.22-.54q0-.329-.22-.549t-.549-.22q-.31 0-.54.22t-.23.549q0 .31.23.54t.54.23M7 20v-1l7-.692V6.452q0-.567-.37-.983q-.368-.415-.91-.465L7.615 4.5v-1l5.23.516q.927.103 1.54.794Q15 5.5 15 6.427v12.762zm-2.539 0v-1H6V5.116q0-.697.472-1.156q.472-.46 1.144-.46h8.769q.696 0 1.156.46T18 5.116V19h1.539v1zM7 19h10V5.116q0-.27-.173-.443t-.442-.173h-8.77q-.269 0-.442.173T7 5.116z" /></svg>
                            </span>
                            <span
                                className={`text-base leading-4 transition-opacity duration-300 ${menuState ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                            >
                                Logout
                            </span>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
};

export default SideMenu;
