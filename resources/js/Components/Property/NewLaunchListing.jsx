import React from "react";
import { Link } from "@inertiajs/react";

const NewLaunchListing = ({ properties }) => {
    const filteredProperties = properties
        .filter((property) => property.purchase === "For Sale")
        .filter((property) => property.sale_type === "New Launch")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4);

    return (
        <div className="pt-20  h-auto mt-12 mb-16 bg-gray-100 flex flex-col items-center w-full max-w-screen-lg">
            <div className="flex justify-between items-center w-full px-4">
                <h2 className="text-2xl font-semibold text-left">New Launch Listings</h2>
                <a href="/buy?saleType=New+Launch" className="view-more text-blue-500 hover:text-blue-700">
                    View More &gt;
                </a>
            </div>

            {/* Prevents overflow */}
            <div className="w-full px-4">
                {/* Wrapping the items properly */}
                <div className="property-list flex flex-wrap gap-6 mt-6 justify-center max-w-full mx-auto">
                    {filteredProperties.slice(0, 3).map((property, index) => (
                        <Link
                            href={`/property/${property.id}`}
                            key={index}
                            className="property-item w-72 p-4 bg-white shadow-lg rounded-md"
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
                                    New property
                                </span>
                                <h3 className="font-bold mt-2">{property.property_name}</h3>
                                <p className="text-sm text-gray-600">{property.city}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewLaunchListing;
