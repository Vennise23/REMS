import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import Header from "@/Layouts/HeaderMenu";
import Map from "@/Components/Map";
import PropertyModal from "@/Components/Property/PropertyModal";

const PropertyDetail = ({ property, auth }) => {
    const [mapPosition, setMapPosition] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const allPhotos = [...(property?.property_photos || [])];
    // console.log(("allPhotos", allPhotos));

    const nextPhoto = () => {
        if (allPhotos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
        }
    };

    const prevPhoto = () => {
        if (allPhotos.length > 1) {
            setCurrentPhotoIndex(
                (prev) => (prev - 1 + allPhotos.length) % allPhotos.length
            );
        }
    };

    const [searchDebugInfo, setSearchDebugInfo] = useState({
        searchedAddress: "",
        foundCoordinates: null,
    });

    useEffect(() => {
        if (property) {
            const fullAddress = `${property.property_address_line_1}, ${property.city}, ${property.postal_code}`;
            setSearchDebugInfo((prev) => ({
                ...prev,
                searchedAddress: fullAddress,
            }));

            const searchParams = new URLSearchParams({
                format: "json",
                q: fullAddress,
                countrycodes: "my",
                limit: 1,
                addressdetails: 1,
            });

            fetch(
                `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
                {
                    headers: {
                        "User-Agent": "PropertyWebsite/1.0",
                    },
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        setMapPosition([lat, lon]);
                    }
                })
                .catch((error) =>
                    console.error("Error fetching location:", error)
                );
        }
    }, [property]);

    const themeColor = property?.purchase === "For Rent" ? "green" : "blue";
    const themeClasses = {
        text:
            property?.purchase === "For Rent"
                ? "text-green-600"
                : "text-blue-600",
        heading:
            property?.purchase === "For Rent"
                ? "text-green-700"
                : "text-blue-700",
        hover:
            property?.purchase === "For Rent"
                ? "hover:text-green-700"
                : "hover:text-blue-700",
        button:
            property?.purchase === "For Rent"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700",
        searchButton:
            property?.purchase === "For Rent"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600",
    };

    const handleGoBackClick = (e) => {
        e.preventDefault();
        window.history.back();
    };

    return (
        <>
            <Head>
                <title>{property?.property_name || "Property Detail"}</title>
            </Head>

            <Header auth={auth} />

            <div className="pt-32 pb-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <a
                        href="#"
                        onClick={handleGoBackClick}
                        className="back-link text-blue-500 hover:text-blue-700"
                    >
                        &lt; Back
                    </a>
                    <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl relative">
                        <div className="relative h-[500px]">
                            {allPhotos.length > 0 ? (
                                <>
                                    <img
                                        src={allPhotos[currentPhotoIndex]}
                                        alt={`Property photo ${
                                            currentPhotoIndex + 1
                                        }`}
                                        className="w-full h-full object-cover transition-opacity duration-300"
                                    />
                                    {allPhotos.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevPhoto}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={nextPhoto}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    <div className="absolute bottom-4 right-4 bg-black/40 px-3 py-1 rounded-full text-white text-sm">
                                        {currentPhotoIndex + 1} /{" "}
                                        {allPhotos.length}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-400 flex items-center">
                                        <svg
                                            className="w-8 h-8 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        No images available
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                                        <svg
                                            className={`w-8 h-8 mr-3 ${themeClasses.text}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                        {property?.property_name}
                                    </h1>
                                    <p className="text-lg text-gray-600 flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        {property?.property_address_line_1}
                                        {property?.property_address_line_2 &&
                                            `, ${property.property_address_line_2}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-3xl font-bold ${themeClasses.text} flex items-center justify-end`}
                                    >
                                        <svg
                                            className="w-6 h-6 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        {property?.purchase === "For Rent" ? (
                                            <>
                                                RM{" "}
                                                {Number(
                                                    property?.price || 0
                                                ).toLocaleString()}{" "}
                                                /month
                                            </>
                                        ) : (
                                            <>
                                                RM{" "}
                                                {Number(
                                                    property?.price || 0
                                                ).toLocaleString()}
                                            </>
                                        )}
                                    </p>
                                    <p className="text-gray-600 flex items-center justify-end mt-2">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                            />
                                        </svg>
                                        {property?.square_feet} sq ft
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                    <h2
                                        className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.heading}`}
                                    >
                                        <svg
                                            className="w-6 h-6 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Property Details
                                    </h2>
                                    <ul className="space-y-2">
                                        <li>
                                            <span className="font-medium">
                                                Type:
                                            </span>{" "}
                                            {property?.property_type}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Units:
                                            </span>{" "}
                                            {property?.number_of_units}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Address:
                                            </span>{" "}
                                            {property?.property_address_line_1}
                                            {property?.property_address_line_2 &&
                                                `, ${property.property_address_line_2}`}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                City:
                                            </span>{" "}
                                            {property?.city}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Postal Code:
                                            </span>{" "}
                                            {property?.postal_code}
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                    <h2
                                        className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.heading}`}
                                    >
                                        <svg
                                            className="w-6 h-6 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                            />
                                        </svg>
                                        Features
                                    </h2>
                                    <ul className="space-y-2">
                                        <li>
                                            <span className="font-medium">
                                                Furnace:
                                            </span>
                                            {property?.each_unit_has_furnace
                                                ? " Yes"
                                                : " No"}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Electrical Meter:
                                            </span>
                                            {property?.each_unit_has_electrical_meter
                                                ? " Yes"
                                                : " No"}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Onsite Caretaker:
                                            </span>
                                            {property?.has_onsite_caretaker
                                                ? " Yes"
                                                : " No"}
                                        </li>
                                        <li>
                                            <span className="font-medium">
                                                Parking:
                                            </span>{" "}
                                            {property?.parking}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {property?.additional_info && (
                                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                                    <h2 className="text-lg font-semibold mb-3">
                                        Additional Information
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {property.additional_info}
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-6">
                                <h2 className="text-lg font-semibold mb-3">
                                    Contact Information
                                </h2>
                                <p className="text-gray-600 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Posted by: <Link href={route('seller.profile', property?.user_id)} className="text-blue-600 hover:underline">
                                        {property?.username}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2`}
                            >
                                <span>Get Started</span>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                </svg>
                            </button>
                        </div>

                        {isModalOpen && (
                            <PropertyModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                property={property}
                                currentUser={auth.user}
                                setMapPosition={setMapPosition}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="bg-white shadow-xl rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                        <svg
                            className={`w-6 h-6 mr-2 ${themeClasses.text}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Location
                    </h2>
                    <Map
                        address={`${property?.property_address_line_1}, ${property?.city}, ${property?.postal_code}, MALAYSIA`}
                        initialSearchQuery={`${property?.property_address_line_1}, ${property?.city}, ${property?.postal_code}, MALAYSIA`}
                        theme={
                            property?.purchase === "For Rent" ? "green" : "blue"
                        }
                    />

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">
                            Location Details:
                        </h3>
                        <div className="space-y-2">
                            <p>
                                <span className="font-medium">
                                    Searched Address:
                                </span>{" "}
                                {searchDebugInfo.searchedAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PropertyDetail;
