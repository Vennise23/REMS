import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-100 py-8 p-9 border-b border-gray-900 left-0 w-full z-50 shadow-md">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold">
                        <a href="/" className="hover:text-gray-400">
                            Real Estate
                        </a>
                    </div>

                    <div className="space-x-6">
                        {/* <a href="/about" className="hover:text-gray-400">
                            About
                        </a>
                        <a href="/contact" className="hover:text-gray-400">
                            Contact
                        </a> */}
                        <a href="/privacy" className="hover:text-gray-400">
                            Privacy Policy
                        </a>
                    </div>
                </div>

                <div className="text-center mt-6 text-sm">
                    <p>&copy; 2025 Real Estate. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
