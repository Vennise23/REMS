import React from 'react';
import { Link } from '@inertiajs/react';

const PropertyCard = ({ property, photos }) => {
    const displayPhoto = () => {
        const photoUrl = photos && photos.length > 0 ? photos[0] : null;
        return photoUrl;
    };

    return (
        <Link 
            href={`/property/${property.id}`} 
            className="block bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative h-48">
                {displayPhoto() ? (
                    <img
                        src={displayPhoto()}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.property_name}
                </h3>

                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-blue-600">
                        RM {Number(property.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                        {property.square_feet} sq ft
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">{property.property_type}</span>
                    {property.number_of_units && (
                        <span>{property.number_of_units} units</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;