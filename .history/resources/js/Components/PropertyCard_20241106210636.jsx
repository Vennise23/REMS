import React from 'react';
import { Link } from '@inertiajs/react';

const PropertyCard = ({ property = {}, photos = [] }) => {
    const defaultProperty = {
        id: property?.id || 0,
        property_name: property?.property_name || 'Untitled Property',
        property_type: property?.property_type || 'Conventional Condominium',
        price: property?.price || 0,
        square_feet: property?.square_feet || 0,
        number_of_units: property?.number_of_units || 1,
    };

    const displayPhoto = () => {
        const photoUrl = photos && photos.length > 0 ? photos[0] : null;
        return photoUrl;
    };

    return (
        <Link 
            href={`/property/${defaultProperty.id}`} 
            className="block bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative h-48">
                {displayPhoto() ? (
                    <img
                        src={displayPhoto()}
                        alt={defaultProperty.property_name}
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
                    {defaultProperty.property_name}
                </h3>

                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-blue-600">
                        RM {Number(defaultProperty.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                        {defaultProperty.square_feet} sq ft
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">{defaultProperty.property_type}</span>
                    {defaultProperty.number_of_units && (
                        <span>{defaultProperty.number_of_units} units</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;