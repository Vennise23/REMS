import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import PropertyCard from "@/Components/Property/PropertyCard";
import FilterSection from "@/Components/FilterSection";
import Header from "@/Layouts/HeaderMenu";
import axios from 'axios';

const SellerProperties = ({ auth, seller }) => {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const propertiesPerPage = 6;
    const [filters, setFilters] = useState({
        propertyType: "All Property",
        saleType: "All",
        priceMin: "0",
        priceMax: "1000000000",
        sizeMin: "0",
        sizeMax: "100000",
        amenities: [],
    });
    const [propertyPhotos, setPropertyPhotos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        fetchProperties();
    }, [filters, currentPage, seller?.id]);

    const fetchPropertyPhotos = async (propertyId) => {
        try {
            const response = await fetch(`/api/property/${propertyId}/photos`);
            if (!response.ok) throw new Error(`Failed to fetch photos for property ${propertyId}`);
            
            const photos = await response.json();
            if (photos && Array.isArray(photos)) {
                const photoUrls = photos
                    .filter(photo => typeof photo === "string" && !photo.includes("certificate_photos"))
                    .map(photo => {
                        return photo.startsWith("http")
                            ? photo
                            : `${window.location.origin}/storage/property_photos/${photo}`;
                    })
                    .filter(url => url !== null);

                setPropertyPhotos(prev => ({
                    ...prev,
                    [propertyId]: photoUrls,
                }));
            }
        } catch (error) {
            console.error("Error fetching property photos:", error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
        }));
        setCurrentPage(1);
    };

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const baseParams = {
                sellerId: seller.id,
                page: currentPage,
                per_page: propertiesPerPage,
                priceMin: filters.priceMin,
                priceMax: filters.priceMax,
                sizeMin: filters.sizeMin,
                sizeMax: filters.sizeMax,
                amenities: filters.amenities.join(","),
                saleType: filters.saleType !== "All" ? filters.saleType : "",
                propertyType: filters.propertyType !== "All Property" ? filters.propertyType : ""
            };

            const response = await axios.get('/api/seller-properties', {
                params: baseParams,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            const data = response.data;
            if (data && Array.isArray(data.data)) {
                setProperties(data.data);
                setTotalPages(Math.ceil(data.total / propertiesPerPage));
                
                data.data.forEach(property => {
                    if (property && property.id) {
                        fetchPropertyPhotos(property.id);
                    }
                });
            } else {
                setProperties([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Error details:", error.response?.data);
            setError('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 mx-1 rounded ${
                        currentPage === i
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const getProfilePicturePath = (imagePath) => {
        if (!imagePath) return '/default-profile.jpg';
        return imagePath.startsWith('http') 
            ? imagePath 
            : `/storage/${imagePath}`;
    };

    return (
        <>
            <Head>
                <title>{`Properties by ${seller.firstname} ${seller.lastname}`}</title>
            </Head>

            <Header auth={auth} />

            <div className="min-h-screen bg-gray-50 pt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
                        <div className="flex items-center mb-6">
                            <img 
                                src={getProfilePicturePath(seller.profile_picture)}
                                alt={`${seller.firstname} ${seller.lastname}`}
                                className="w-16 h-16 rounded-full object-cover mr-4"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/default-profile.jpg';
                                }}
                            />
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {seller.firstname} {seller.lastname}
                                </h2>
                                {seller.agency_name && (
                                    <p className="text-gray-600">{seller.agency_name}</p>
                                )}
                            </div>
                        </div>
                        <FilterSection
                            filters={filters}
                            setFilters={handleFilterChange}
                            theme="red"
                            showSaleType={true}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center mt-8">
                            <h2 className="text-xl font-semibold text-red-600">Loading Properties...</h2>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center mt-8">
                            <h2 className="text-xl font-semibold text-red-600">No Properties Found</h2>
                            <p className="text-gray-600 mt-2">
                                No properties match your current filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        photos={propertyPhotos[property.id] || []}
                                        theme="red"
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center mt-12 mb-8 space-x-2">
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                                    >
                                        Previous
                                    </button>
                                )}
                                <div className="flex space-x-2">
                                    {renderPaginationButtons()}
                                </div>
                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SellerProperties;