import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/HeaderMenu';

const PropertyDetail = ({ property, auth }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => 
            prev === property.certificate_photos.length - 1 ? 0 : prev + 1
        );
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => 
            prev === 0 ? property.certificate_photos.length - 1 : prev - 1
        );
    };

    return (
        <>
            <Head>
                <title>{property.property_name} - Property Detail</title>
            </Head>

            <Header auth={auth} />

            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        {/* 照片展示区 */}
                        <div className="relative h-96">
                            {property.certificate_photos && property.certificate_photos.length > 0 && (
                                <>
                                    <img
                                        src={property.certificate_photos[currentPhotoIndex]}
                                        alt={`Property photo ${currentPhotoIndex + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {property.certificate_photos.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevPhoto}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={nextPhoto}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                                            >
                                                →
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 属性详情 */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {property.property_name}
                                    </h1>
                                    <p className="text-lg text-gray-600">
                                        {property.property_address_line_1}
                                        {property.property_address_line_2 && `, ${property.property_address_line_2}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">
                                        RM {Number(property.price).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600">
                                        {property.square_feet} sq ft
                                    </p>
                                </div>
                            </div>

                            {/* 详细信息 */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Property Details</h2>
                                    <ul className="space-y-2">
                                        <li><span className="font-medium">Type:</span> {property.property_type}</li>
                                        <li><span className="font-medium">Units:</span> {property.number_of_units}</li>
                                        <li><span className="font-medium">City:</span> {property.city}</li>
                                        <li><span className="font-medium">Postal Code:</span> {property.postal_code}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Features</h2>
                                    <ul className="space-y-2">
                                        <li>
                                            <span className="font-medium">Furnace:</span>
                                            {property.each_unit_has_furnace ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Electrical Meter:</span>
                                            {property.each_unit_has_electrical_meter ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Onsite Caretaker:</span>
                                            {property.has_onsite_caretaker ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Parking:</span> {property.parking}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 额外信息 */}
                            {property.additional_info && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
                                    <p className="text-gray-600">{property.additional_info}</p>
                                </div>
                            )}

                            {/* 联系信息 */}
                            <div className="border-t pt-6">
                                <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                                <p className="text-gray-600">Posted by: {property.username}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PropertyDetail; 