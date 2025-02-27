import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

const RentListings = ({ properties }) => {
    // const [PropertyList, setPropertyList] = useState([]);

    // useEffect(() => {
    //     fetch("/api/property")
    //         .then((response) => response.json())
    //         .then((data) => setPropertyList(data))
    //         .catch((error) =>
    //             console.error("Error fetching property data:", error)
    //         );
    // }, []);

    const filteredProperties = properties
        .filter((property) => property.purchase === "For Rent")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4);

    return (
        <div className="pt-20 mt-12 mb-16 bg-gray-100 flex flex-col items-center">
            <div className="flex justify-between items-center w-full">
                <h2 className="text-2xl font-semibold text-left">
                    Latest Listings
                </h2>
                <a
                    href="/rent"
                    className="view-more text-blue-500 hover:text-blue-700"
                >
                    View More &gt;
                </a>
            </div>

            <div className="property-list flex gap-6 mt-6 overflow-x-auto max-w-screen-lg mx-auto">
                {filteredProperties.map((property, index) => (
                    <Link
                        href={`/property/${property.id}`}
                        key={index}
                        className="property-item w-64 p-4 bg-white shadow-lg rounded-md"
                    >
                        <img
                            src={property.property_photos && property.property_photos[0]
                                ? `${window.location.origin}/storage/${property.property_photos[0]}`
                                : ''}
                            alt={property.property_name}
                            className="w-full h-48 object-cover rounded-md"
                        />
                        <div className="property-info mt-4">
                            <span className="new-property-label text-xs text-white bg-red-500 px-2 py-1 rounded-md">
                                Rent
                            </span>
                            <h3 className="font-bold mt-2">
                                {property.property_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {property.city}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RentListings;
