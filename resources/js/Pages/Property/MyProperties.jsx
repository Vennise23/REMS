import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import PropertyCard from "@/Components/Property/PropertyCard";
import PropertyStatusManager from "@/Components/Property/PropertyStatusManager";

const MyProperties = ({ auth, properties }) => {
    const [activeTab, setActiveTab] = useState("all");
    const [propertyList, setPropertyList] = useState(properties);
    const [propertyPhotos, setPropertyPhotos] = useState({});

    const fetchPropertyPhotos = async (propertyId) => {
        try {
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
                            return photo.startsWith("http")
                                ? photo
                                : `${window.location.origin}/storage/property_photos/${photo}`;
                        }
                        return null;
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
        if (propertyList.length > 0) {
            propertyList.forEach((property) => {
                fetchPropertyPhotos(property.id);
            });
        }
    }, [propertyList]);

    const filterProperties = (tab) => {
        switch (tab) {
            case "sale":
                return propertyList.filter((p) => p.purchase === "For Sale");
            case "rent":
                return propertyList.filter((p) => p.purchase === "For Rent");
            case "sold":
                return propertyList.filter(
                    (p) => p.status === "sold" || p.status === "rented"
                );
            case "cancelled":
                return propertyList.filter((p) => p.status === "cancelled");
            default:
                return propertyList;
        }
    };

    const handleStatusUpdate = (updatedProperty) => {
        setPropertyList(
            propertyList.map((p) =>
                p.id === updatedProperty.id ? updatedProperty : p
            )
        );
    };

    const tabs = [
        { id: "all", label: "All Properties" },
        { id: "sale", label: "For Sale" },
        { id: "rent", label: "For Rent" },
        { id: "sold", label: "Sold/Rented" },
        { id: "cancelled", label: "Cancelled" },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="My Properties" />
            <div className="flex pt-0 min-h-screen bg-gray-100">
                {/* Main Content */}
                <div className="flex-1 pl-6 md:pl-12 p-6 md:p-12" >
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">
                            My Properties
                        </h1>

                        {/* Tabs */}
                        <div className="mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                ? "border-red-500 text-red-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Property Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filterProperties(activeTab).map((property) => (
                                <div key={property.id} className="relative">
                                    <PropertyCard
                                        property={property}
                                        photos={
                                            propertyPhotos[property.id] || []
                                        }
                                    />
                                    <PropertyStatusManager
                                        property={property}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                </div>
                            ))}
                        </div>

                        {filterProperties(activeTab).length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">
                                    No properties found in this category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MyProperties;
