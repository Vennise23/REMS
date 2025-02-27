import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import backgroundImage from "/resources/img/guest-background.jpg";
import React, { useState, useEffect, useRef } from "react";

export default function Guest({ children }) {
    // Add Fun Droping Box - Vennise 2/27/25
    const parentRef = useRef(null);
    const [drops, setDrops] = useState([]);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            if (!parentRef.current) return;

            setDrops((prevDrops) => {
                if (prevDrops.some((drop) => drop.y === 0) || prevDrops.length >= 300) {
                    if (prevDrops.length >= 300) {
                        setShowMessage(true);
                    }
                    return prevDrops;
                }

                const newDrop = {
                    id: Date.now(),
                    x: latestCursorX.current,
                    y: 0,
                    stopped: false,
                };
                return [...prevDrops, newDrop];
            });
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const latestCursorX = useRef(0); // Store cursor position without causing re-renders

    const handleMouseMove = (e) => {
        if (!parentRef.current) return;

        const rect = parentRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;

        latestCursorX.current = relativeX; // Update position immediately without triggering re-renders
    };

    useEffect(() => {
        const fallInterval = setInterval(() => {
            setDrops((prevDrops) =>
                prevDrops.map((drop) => {
                    if (!drop.stopped) {
                        let newY = drop.y + 10; // Drop speed
                        const bottomLimit = parentRef.current.clientHeight - 20;
                        // Find the closest drop directly below the current drop
                        const closestDropBelow = prevDrops
                            .filter((d) => d !== drop && Math.abs(d.x - drop.x) < 40 && d.y > drop.y)
                            .sort((a, b) => a.y - b.y)[0]; // Sort to get the closest one

                        if (newY >= bottomLimit) {
                            return { ...drop, y: bottomLimit, stopped: true }; // Stop at bottom
                        }

                        if (closestDropBelow) {
                            if (newY >= closestDropBelow.y - 10) {
                                return { ...drop, y: closestDropBelow.y - 20, stopped: true }; // Stack on top
                            }
                        }

                        return { ...drop, y: newY };
                    }
                    return drop;
                }).filter((drop) => !(drop.stopped && drop.y === 0))
            );
        }, 50);
        return () => clearInterval(fallInterval);
    }, [drops]);

    return (
        <div className="z-0 bg-cover bg-center flex flex-col justify-center items-center min-h-[100vh] py-7 bg-gray-100"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            ref={parentRef}
            onMouseMove={handleMouseMove}
        >
            {drops.map((drop) => (
                <div
                    key={drop.id}
                    className="z-0 border-b-4 border-gray-800 absolute w-10 h-5 bg-purple-900  flex items-center justify-between p-1 shadow-[0_0_15px_rgba(255,208,255,0.2)]"
                    style={{
                        left: `${drop.x}px`,
                        top: `${drop.y}px`,
                        transition: drop.stopped ? "none" : "top 0.05s linear",
                    }}
                >
                    {/* Window */}
                    <div className="w-1 h-1 bg-white"></div>
                    <div className="w-1 h-1 bg-white"></div>
                    <div className="w-1 h-1 bg-white"></div>
                    <div className="w-1 h-1 bg-white"></div>
                    <div className="w-1 h-1 bg-white"></div>
                </div>
            ))}
            <div className="h-28 w-28 z-30" >
                <Link href="/">
                    <ApplicationLogo fillColor="white" />
                </Link>
            </div>

            <div className="inline-block min-w-0 min-h-0 mt-4 px-8 py-6 bg-white shadow-md overflow-hidden sm:rounded-lg bg-opacity-50 z-30">
                {children}
            </div>
            {showMessage && (
                <div className="z-10 fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
                    Exceed 300 Blocks, Thanks for playing until the end. It worth nothing my babe.
                </div>
            )}
        </div>
    );
}
