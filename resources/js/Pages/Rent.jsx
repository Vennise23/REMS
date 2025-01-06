import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import PropertyCard from "@/Components/Property/PropertyCard";
import FilterSection from "@/Components/FilterSection";
import Header from "@/layouts/HeaderMenu";
import Footer from "@/Layouts/Footer";

const Rent = ({ auth }) => {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const propertiesPerPage = 6;
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('propertyRentFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            propertyType: 'All Property',
            priceMin: '0',
            priceMax: '1000000000',
            sizeMin: '0',
            sizeMax: '100000',
            amenities: [],
            sortDirection: 'desc',
        };
    });
    const [propertyPhotos, setPropertyPhotos] = useState({});
    const [citySearchQuery, setCitySearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyTypeFromUrl = urlParams.get("propertyType");
        const priceMinFromUrl = urlParams.get("priceMin");
        const priceMaxFromUrl = urlParams.get("priceMax");
        const citySearchFromUrl = urlParams.get("searchQuery");

        if (!propertyTypeFromUrl) {
            setFilters((prev) => ({
                ...prev,
                propertyType: "All Property",
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                propertyType: propertyTypeFromUrl,
            }));
        }
        if (priceMinFromUrl) {
            setFilters((prev) => ({
                ...prev,
                priceMin: priceMinFromUrl,
            }));
        }

        if (priceMaxFromUrl) {
            setFilters((prev) => ({
                ...prev,
                priceMax: priceMaxFromUrl,
            }));
        }

        if (citySearchFromUrl) {
            setCitySearchQuery(citySearchFromUrl);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("propertyFilters", JSON.stringify(filters));

        fetchProperties();
    }, [filters, citySearchQuery, currentPage]);

    const fetchPropertyPhotos = async (propertyId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/property/${propertyId}/photos`);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch photos for property ${propertyId}`
                );
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
                            // console.warn("Invalid photo value:", photo);
                            return null;
                        }
                    })
                    .filter((url) => url !== null);

                // console.log("Filtered photoUrls:", photoUrls);

                setPropertyPhotos((prev) => ({
                    ...prev,
                    [propertyId]: photoUrls,
                }));
            } else {
                console.log("No photos available for property:", propertyId);
            }
        } catch (error) {
            console.error("Error fetching property photos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
        setCurrentPage(1);

        const params = new URLSearchParams(window.location.search);

        // if (newFilters.saleType) {
        //     params.set("saleType", newFilters.saleType);
        // }
        if (newFilters.propertyType) {
            params.set("propertyType", newFilters.propertyType);
        }

        window.history.pushState(null, "", `/rent?${params.toString()}`);
    };

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const baseParams = {
                page: currentPage,
                per_page: propertiesPerPage,
                priceMin: filters.priceMin,
                priceMax: filters.priceMax,
                sizeMin: filters.sizeMin,
                sizeMax: filters.sizeMax,
                amenities: filters.amenities.join(","),
                citySearch: citySearchQuery,
                purchase: 'For Rent',
                status: 'active',
                sortDirection: filters.sortDirection
            };

            if (filters.propertyType !== 'All Property') {
                baseParams.propertyType = filters.propertyType;
            }

            const queryParams = new URLSearchParams(baseParams);

            const response = await fetch(`/api/properties?${queryParams}`);
            const data = await response.json();

            if (data.data) {
                setProperties(data.data);
                setTotalPages(Math.ceil(data.total / propertiesPerPage));

                data.data.forEach((property) => {
                    fetchPropertyPhotos(property.id);
                });
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
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
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const handleCitySearch = (value) => {
        setCitySearchQuery(value);
        setCurrentPage(1);
    };

    const defaultAuth = {
        user: null,
        ...auth,
    };

    return (
        <>
            <Head>
                <title>Rent Properties</title>
                <meta
                    name="description"
                    content="Find your perfect rental property"
                />
            </Head>
            <div>
                <Header auth={defaultAuth} />

                <div className="min-h-screen bg-gray-50 pt-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                                Find Your Perfect Rental
                            </h2>
                            <FilterSection
                                filters={filters}
                                setFilters={handleFilterChange}
                                onCitySearch={handleCitySearch}
                                theme="green"
                                showSaleType={false}
                                layout="rent"
                            />
                        </div>

                        {loading ? (
                            <div className="text-center mt-8">
                                <h2 className="text-xl font-semibold text-green-600">
                                    Loading Properties...
                                </h2>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center mt-8">
                                <h2 className="text-xl font-semibold text-green-600">
                                    Property Listings With{" "}
                                    {citySearchQuery || "Your Filters"}
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Result not found. Sorry, but nothing matched
                                    your search. Please try again with different
                                    keywords or filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {properties.map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            photos={
                                                propertyPhotos[property.id] ||
                                                []
                                            }
                                            theme="green"
                                        />
                                    ))}
                                </div>

                                <div className="flex justify-center mt-12 mb-8 space-x-2">
                                    {currentPage > 1 && (
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm transition duration-150 ease-in-out"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <div className="flex space-x-2">
                                        {renderPaginationButtons()}
                                    </div>
                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm transition duration-150 ease-in-out"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Rent;
