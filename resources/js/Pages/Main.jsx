import React, { useState } from "react";
import { Head } from "@inertiajs/react";

import backgroundImage from "/resources/img/estate_property_background.jpg";
import PropertyFormModal from "@/Components/PropertyFormModal";
import Header from "@/Components/HeaderMenu";
import NewLaunchListing from "@/Components/NewLaunchListing";
import LatestListings from "@/Components/LatestListings";
import RentListings from "@/Components/RentListings";
import Footer from "@/Components/Footer";

export default function Main({ auth }) {
    const [isBuy, setIsBuy] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Head title="Main" />
            <Header auth={auth} />

            <main className="pt-32 mt-12 min-h-screen bg-gray-100 flex flex-col items-center">
                <div
                    className="relative w-full max-w-4xl h-80 bg-cover bg-center mb-8"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-3xl bg-[#f7f1e8] p-8 rounded-xl shadow-lg">
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => setIsBuy(true)}
                                className={`px-6 py-2 font-bold rounded-l-full ${
                                    isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setIsBuy(false)}
                                className={`px-6 py-2 font-bold rounded-r-full ${
                                    !isBuy
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                Rent
                            </button>
                        </div>

                        <div className="flex items-center bg-white p-2 rounded-full shadow-md mb-4">
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="flex-grow bg-transparent border-none focus:outline-none px-4 rounded-full"
                            />
                            <button className="bg-red-500 text-white px-6 py-2 rounded-full">
                                Search
                            </button>
                        </div>

                        <div className="flex justify-around">
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>Categories</option>
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Land</option>
                            </select>
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>All Property</option>
                                <option>House</option>
                                <option>Apartment</option>
                                <option>Office</option>
                            </select>
                            <select className="bg-transparent border-none focus:outline-none text-gray-700 rounded-full">
                                <option>Price Range</option>
                                <option>$0 - $100,000</option>
                                <option>$100,000 - $500,000</option>
                                <option>$500,000+</option>
                            </select>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={openModal}
                                className="bg-red-500 text-white px-6 py-2 rounded-full"
                            >
                                Apply for Property
                            </button>
                        </div>
                    </div>
                </div>

                <PropertyFormModal isOpen={isModalOpen} onClose={closeModal} />

                {isBuy ? (
                    <>
                        <NewLaunchListing />
                        <LatestListings />
                    </>
                ) : (
                    <RentListings />
                )}
            </main>
            <Footer />
        </>
    );
}
