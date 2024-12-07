import React, { useState, useEffect } from "react";
import {
    FaWhatsapp,
    FaDownload,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaComment,
} from "react-icons/fa";
import { router } from '@inertiajs/react';
import axios from 'axios';

const PropertyModal = ({
    isOpen,
    onClose,
    property,
    currentUser,
    setMapPosition,
}) => {
    if (!isOpen) return null;

    if (!property) {
        return null;
    }

    const [contactInfo, setContactInfo] = useState({
        phone: "Not available",
        email: "Not available",
    });

    function formatPhoneNumber(phone) {
        if (!phone || phone.length < 10) return null;

        const cleanedPhone = phone.startsWith("0") ? phone.slice(1) : phone;
    
        return `+60 ${cleanedPhone.slice(0, 2)}-${cleanedPhone.slice(2, 5)} ${cleanedPhone.slice(5)}`;
    }

    useEffect(() => {
        console.log("property data: ",property.user)
        if (property && property.user.phone && property.user.email) {
            setContactInfo({
                phone: formatPhoneNumber(property.user.phone),
                email: property.user.email,
            });
        }
    }, [property]);

    const handleContactOwner = async () => {
        if (!currentUser) {
            router.visit(route('login'));
            return;
        }

        if (!property || !property.user_id) {
            console.error('Property or property user_id is undefined');
            return;
        }

        try {
            const response = await axios.post('/api/chat-rooms/create', {
                property_id: property.id,
                seller_id: property.user_id,
            }, {
                withCredentials: true,
            });

            if (response.data && response.data.chatRoom) {
                onClose();
                router.visit(route('chat.show', { chatRoom: response.data.chatRoom.id }));
            } else {
                console.error('No chat room data in response:', response);
            }
        } catch (error) {
            console.error('Error creating/getting chat room:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    const handleDownloadPhoto = (photoUrl) => {
        // Extract filename from URL
        const filename = photoUrl.split("/").pop();

        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = photoUrl;
        link.download = `property_photo_${property.id}_${filename}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">Property Details</h2>

                <div className="space-y-4">
                    {/* Owner Information */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold flex items-center mb-2">
                            <FaUser className="mr-2" />
                            Owner Information
                        </h3>
                        <p className="text-gray-600">
                            Posted by: {property.username || "Anonymous"}
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="border-b pb-4">
                        <div className="flex items-center space-x-4 mb-3">
                            <FaPhone className="text-gray-600" />
                            <p>{contactInfo.phone}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <FaEnvelope className="text-gray-600" />
                            <p>{contactInfo.email}</p>
                        </div>
                    </div>

                    {/* Property Photos */}
                    {property.certificate_photos &&
                        property.certificate_photos.length > 0 && (
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2">
                                    Certificate Photos
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {property.certificate_photos.map(
                                        (photo, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Certificate ${
                                                        index + 1
                                                    }`}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleDownloadPhoto(
                                                            photo
                                                        )
                                                    }
                                                    className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <FaDownload />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 mt-6">
                        <button
                            onClick={handleContactOwner}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
                        >
                            <FaComment className="mr-2" />
                            Contact Owner
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyModal;