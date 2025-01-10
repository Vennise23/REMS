import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import NewLaunchListing from '@/Components/Property/NewLaunchListing';
import LatestListings from '@/Components/Property/LatestListings';
import RentListings from '@/Components/Property/RentListings';
import Header from '@/Layouts/HeaderMenu';
import Footer from '@/Layouts/Footer';
import PropertyCard from '@/Components/Property/PropertyCard';
import { useMemo } from 'react';

export default function SellerProfile({ auth, seller, sellerProperties }) {
    // Add state for active tab
    const [activeTab, setActiveTab] = React.useState('sale');
    const [propertyPhotos, setPropertyPhotos] = useState({});
    
    // Separate properties by type and approval status
    const forSaleProperties = useMemo(() => 
        sellerProperties.filter((property) => 
            property.purchase === "For Sale" && 
            property.approval_status.toLowerCase() === "approved"
        ),
        [sellerProperties]
    );
    console.log("Property data structure:", forSaleProperties[0]);
    const forRentProperties = useMemo(() => 
        sellerProperties.filter((property) => 
            property.purchase === "For Rent" && 
            property.approval_status.toLowerCase() === "approved"
        ),
        [sellerProperties]
    );

    console.log(seller);

    const handleContactOwner = () => {
        // Logic to open the PropertyModal or initiate contact
        // This could involve setting state to show the modal with the selected property
        console.log("Contact owner button clicked");
    };

    const fetchPropertyPhotos = async (propertyId) => {
        try {
            const response = await fetch(`/api/property/${propertyId}/photos`);

            if (!response.ok) {
                throw new Error(`Failed to fetch photos for property ${propertyId}`);
            }

            const photos = await response.json();
            if (photos && Array.isArray(photos)) {
                const photoUrls = photos
                    .filter(
                        (photo) =>
                            typeof photo === "string" &&
                            !photo.includes("certificate_photos")
                    )
                    .map((photo) => {
                        if (typeof photo === "string") {
                            const imageUrl = photo.startsWith("http")
                                ? photo
                                : `${window.location.origin}/storage/property_photos/${photo}`;
                            return imageUrl;
                        } else {
                            console.warn("Invalid photo value:", photo);
                            return null;
                        }
                    })
                    .filter((url) => url !== null);

                setPropertyPhotos((prev) => ({
                    ...prev,
                    [propertyId]: photoUrls,
                }));
            }
        } catch (error) {
            console.error("Error fetching property photos:", error);
        }
    };

    useEffect(() => {
        forSaleProperties.forEach((property) => {
            fetchPropertyPhotos(property.id);
        });
        forRentProperties.forEach((property) => {
            fetchPropertyPhotos(property.id);
        });
    }, [forSaleProperties, forRentProperties]);

    // Add this for debugging
    console.log('All properties:', sellerProperties);
    console.log('Sale properties:', forSaleProperties);
    console.log('Rent properties:', forRentProperties);

    return (
        <>
            <Head title={`${seller.name}'s Profile`} />
            <Header auth={auth} />

            {/* Profile Header with Background */}
            <div className="relative h-80 bg-gray-100">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ 
                        backgroundImage: "url('/images/profile-background.jpg')",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    {/* Optional overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>

                {/* Profile Content */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                        <div className="flex items-end justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                                    <img 
                                        src={seller.profile_picture ? `/storage/${seller.profile_picture}` : '/default-profile.png'} 
                                        alt={`${seller.name}'s profile`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mb-4 text-white">
                                    <h2 className="text-2xl font-bold text-white">
                                        {seller.firstname && seller.lastname 
                                            ? `${seller.firstname} ${seller.lastname}`
                                            : 'No Name Provided'}
                                    </h2>
                                    <p className="text-gray-200">{seller.email}</p>
                                    <p className="text-gray-200">{seller.agency_name}</p>
                                    <p className="text-gray-200">Phone: {seller.phone}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                {/* <button 
                                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    onClick={handleContactOwner}
                                >
                                    Contact
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Listings Summary */}
                    <div className="flex justify-around bg-gray-100 p-6 rounded-lg mb-6">
                        <div className="text-center">
                            <h3 className="text-4xl font-bold">{forSaleProperties.length}</h3>
                            <p className="text-gray-600">Listings For Sale</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-4xl font-bold">{forRentProperties.length}</h3>
                            <p className="text-gray-600">Listings For Rent</p>
                        </div>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex mb-6">
                        <button
                            className={`px-6 py-2 ${
                                activeTab === 'sale'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            } rounded-l-lg focus:outline-none`}
                            onClick={() => setActiveTab('sale')}
                        >
                            For Sale ({forSaleProperties.length})
                        </button>
                        <button
                            className={`px-6 py-2 ${
                                activeTab === 'rent'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            } rounded-r-lg focus:outline-none`}
                            onClick={() => setActiveTab('rent')}
                        >
                            For Rent ({forRentProperties.length})
                        </button>
                    </div>

                    {/* Property Listings */}
                    <div className="bg-gray-100 p-6 rounded-lg mb-12">
                        {activeTab === 'sale' && forSaleProperties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {forSaleProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        photos={propertyPhotos[property.id] || []}
                                        theme="blue"
                                    />
                                ))}
                            </div>
                        ) : activeTab === 'rent' && forRentProperties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {forRentProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        photos={propertyPhotos[property.id] || []}
                                        theme="green"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center mt-8">
                                <h2 className="text-xl font-semibold text-gray-600">
                                    No properties found for {activeTab === 'sale' ? 'Sale' : 'Rent'}.
                                </h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
} 