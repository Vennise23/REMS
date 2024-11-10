import React from 'react';
import { FaWhatsapp, FaDownload, FaPhone, FaEnvelope } from 'react-icons/fa';

const PropertyModal = ({ isOpen, onClose, property, onConfirm }) => {
    if (!isOpen) return null;

    // Hardcoded contact info for demo
    const contactInfo = {
        phone: '+60 12-345 6789',
        email: 'owner@example.com'
    };

    const handleWhatsApp = () => {
        const message = `Hi, I'm interested in your property: ${property.property_name}`;
        const whatsappUrl = `https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDownloadDeed = () => {
        // Construct the URL to the property deed photo
        const deedPhotoUrl = `/storage/property_photos/${property.deed_photo}`;
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = deedPhotoUrl;
        link.download = `property_deed_${property.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Owner Information</h3>
                        <p className="text-gray-600">Name: {property.owner_name || 'Not Available'}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <FaPhone className="text-gray-600" />
                        <p>{contactInfo.phone}</p>
                        <button 
                            onClick={handleWhatsApp}
                            className="text-green-500 hover:text-green-600"
                        >
                            <FaWhatsapp className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <FaEnvelope className="text-gray-600" />
                        <p>{contactInfo.email}</p>
                    </div>

                    {property.deed_photo && (
                        <button
                            onClick={handleDownloadDeed}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                        >
                            <FaDownload />
                            <span>Download Property Deed</span>
                        </button>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input type="checkbox" id="privacy" className="mr-2" />
                            <label htmlFor="privacy">I agree to the privacy terms</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="purchase" className="mr-2" />
                            <label htmlFor="purchase">I confirm my interest in purchasing</label>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
                        <button
                            onClick={onConfirm}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Confirm Interest
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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