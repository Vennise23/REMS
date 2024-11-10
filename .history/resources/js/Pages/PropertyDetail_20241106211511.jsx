import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/HeaderMenu';

const PropertyDetail = (props) => {
    // 确保 props.property 存在且不是空对象
    const property = props.property || {};
    
    // 创建默认属性对象
    const defaultProperty = {
        id: 0,
        property_name: 'Untitled Property',
        property_type: 'Conventional Condominium',
        property_address_line_1: 'Address not provided',
        property_address_line_2: '',
        city: 'Not specified',
        postal_code: '00000',
        price: 0,
        square_feet: 0,
        number_of_units: 1,
        each_unit_has_furnace: false,
        each_unit_has_electrical_meter: false,
        has_onsite_caretaker: false,
        parking: 'Not specified',
        additional_info: '',
        username: 'Anonymous',
        certificate_photos: [],
        property_photos: [],
        ...property // 使用传入的属性覆盖默认值
    };

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        // 优先使用 certificate_photos，如果没有则使用 property_photos
        const availablePhotos = defaultProperty.certificate_photos?.length > 0 
            ? defaultProperty.certificate_photos 
            : defaultProperty.property_photos || [];
        
        setPhotos(availablePhotos);
    }, [defaultProperty.certificate_photos, defaultProperty.property_photos]);

    const nextPhoto = () => {
        if (photos.length > 1) {
            setCurrentPhotoIndex((prev) => 
                prev === photos.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevPhoto = () => {
        if (photos.length > 1) {
            setCurrentPhotoIndex((prev) => 
                prev === 0 ? photos.length - 1 : prev - 1
            );
        }
    };

    // 添加调试日志
    console.log('PropertyDetail props:', props);
    console.log('Processed property:', defaultProperty);
    console.log('Photos:', photos);

    return (
        <>
            <Head>
                <title>{defaultProperty.property_name} - Property Detail</title>
            </Head>

            <Header auth={props.auth} />

            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        {/* 照片展示区 */}
                        <div className="relative h-96">
                            {photos.length > 0 ? (
                                <>
                                    <img
                                        src={photos[currentPhotoIndex]}
                                        alt={`Property photo ${currentPhotoIndex + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {photos.length > 1 && (
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
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No images available</span>
                                </div>
                            )}
                        </div>

                        {/* 属性详情 */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {defaultProperty.property_name}
                                    </h1>
                                    <p className="text-lg text-gray-600">
                                        {defaultProperty.property_address_line_1}
                                        {defaultProperty.property_address_line_2 && `, ${defaultProperty.property_address_line_2}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">
                                        RM {Number(defaultProperty.price).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600">
                                        {defaultProperty.square_feet} sq ft
                                    </p>
                                </div>
                            </div>

                            {/* 详细信息 */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Property Details</h2>
                                    <ul className="space-y-2">
                                        <li><span className="font-medium">Type:</span> {defaultProperty.property_type}</li>
                                        <li><span className="font-medium">Units:</span> {defaultProperty.number_of_units}</li>
                                        <li><span className="font-medium">City:</span> {defaultProperty.city}</li>
                                        <li><span className="font-medium">Postal Code:</span> {defaultProperty.postal_code}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Features</h2>
                                    <ul className="space-y-2">
                                        <li>
                                            <span className="font-medium">Furnace:</span>
                                            {defaultProperty.each_unit_has_furnace ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Electrical Meter:</span>
                                            {defaultProperty.each_unit_has_electrical_meter ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Onsite Caretaker:</span>
                                            {defaultProperty.has_onsite_caretaker ? ' Yes' : ' No'}
                                        </li>
                                        <li>
                                            <span className="font-medium">Parking:</span> {defaultProperty.parking}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 额外信息 */}
                            {defaultProperty.additional_info && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
                                    <p className="text-gray-600">{defaultProperty.additional_info}</p>
                                </div>
                            )}

                            {/* 联系信息 */}
                            <div className="border-t pt-6">
                                <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                                <p className="text-gray-600">Posted by: {defaultProperty.username}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// 添加默认 props
PropertyDetail.defaultProps = {
    property: {},
    auth: { user: null }
};

export default PropertyDetail; 