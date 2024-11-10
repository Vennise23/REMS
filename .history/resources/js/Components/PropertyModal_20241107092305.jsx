import React, { useState } from 'react';
import { FaWhatsapp, FaDownload, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';

const PropertyModal = ({ isOpen, onClose, property, onConfirm }) => {
    if (!isOpen) return null;

    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [purchaseChecked, setPurchaseChecked] = useState(false);

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

    const handleDownloadPhoto = (photoUrl) => {
        // Extract filename from URL
        const filename = photoUrl.split('/').pop();
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
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
                        <p className="text-gray-600">Posted by: {property.username || 'Anonymous'}</p>
                    </div>

                    {/* Contact Information */}
                    <div className="border-b pb-4">
                        <div className="flex items-center space-x-4 mb-3">
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
                    </div>

                    {/* Property Photos */}
                    {property.property_photos && property.property_photos.length > 0 && (
                        <div className="border-b pb-4">
                            <h3 className="font-semibold mb-2">Property Photos</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {property.property_photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={photo} 
                                            alt={`Property ${index + 1}`}
                                            className="w-full h-24 object-cover rounded"
                                        />
                                        <button
                                            onClick={() => handleDownloadPhoto(photo)}
                                            className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirmation Checkboxes */}
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="privacy" 
                                className="mr-2"
                                checked={privacyChecked}
                                onChange={(e) => setPrivacyChecked(e.target.checked)}
                            />
                            <label htmlFor="privacy">I agree to the privacy terms</label>
                        </div>
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="purchase" 
                                className="mr-2"
                                checked={purchaseChecked}
                                onChange={(e) => setPurchaseChecked(e.target.checked)}
                            />
                            <label htmlFor="purchase">I confirm my interest in purchasing</label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 mt-6">
                        <button
                            onClick={onConfirm}
                            disabled={!privacyChecked || !purchaseChecked}
                            className={`px-4 py-2 rounded ${
                                privacyChecked && purchaseChecked
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
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