import React from 'react';

const PropertyCard = ({ property, photos }) => {
    console.log('Property:', property.id);
    console.log('Photos:', photos);
    console.log('Property photos:', property.property_photos);
    console.log('Certificate photos:', property.certificate_photos);

    const displayPhoto = () => {
        const photoUrl = photos && photos.length > 0 ? photos[0] : null;
        console.log('Display photo URL:', photoUrl);
        return photoUrl;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
                {displayPhoto() ? (
                    <img
                        src={displayPhoto()}
                        alt={property.property_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.src = 'fallback-image-url';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {property.purchase}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.property_name}</h3>
                <p className="text-gray-600 mb-2">{property.city}</p>
                
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
        </div>
    );
};

export default PropertyCard;