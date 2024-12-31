import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";

import HeaderMenu from "@/Layouts/HeaderMenu";
import PropertyManageSidebar from "@/Components/Property/PropertyManageSideBar";
import PropertyEditModal from "@/Components/Property/PropertyEditModal";
import PropertyFormModal from "@/Components/Property/PropertyFormModal";
import ShowDeleteConfirmationModal from "@/Components/Property/ShowDeleteConfirmationModal";

export default function PropertyManagement({ auth }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPropertyFormModalOpen, setIsPropertyFormModalOpen] =
        useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);

    // Fetch properties from server
    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/user-properties", {
                params: { page: currentPage },
            });
            setProperties(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalProperties(response.data.total);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter properties based on search term
    const filterProperties = () => {
        if (!searchTerm) {
            setFilteredProperties(properties);
        } else {
            const filtered = properties.filter((property) =>
                property.property_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
            setFilteredProperties(filtered);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEditProperty = (property) => {
        console.log("check ", property);
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    const handleDeleteProperty = (property) => {
        setPropertyToDelete(property);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProperty = () => {
        if (propertyToDelete) {
            setLoading(true);
            axios
                .delete(`/api/properties/${propertyToDelete.id}`)
                .then(() => {
                    setProperties((prev) =>
                        prev.filter((p) => p.id !== propertyToDelete.id)
                    );
                    setFilteredProperties((prev) =>
                        prev.filter((p) => p.id !== propertyToDelete.id)
                    );
                })
                .catch((error) => {
                    console.error("Error deleting property:", error);
                    alert("Failed to delete the property. Please try again.");
                })
                .finally(() => {
                    setLoading(false);
                    setIsDeleteModalOpen(false);
                    setPropertyToDelete(null);
                });
        }
    };

    const openModal = () => {
        setIsPropertyFormModalOpen(true);
    };

    const closeModal = () => {
        setIsPropertyFormModalOpen(false);
    };

    // Fetch properties when the page loads
    useEffect(() => {
        fetchProperties();
    }, [currentPage]);

    // Filter properties whenever searchTerm changes
    useEffect(() => {
        filterProperties();
    }, [searchTerm, properties]);

    return (
        <>
            <div className="relative">
                <Head title="Manage Property" />
                <HeaderMenu auth={auth} />
                <div className="flex min-h-screen pt-16 bg-gray-100">
                    <div className="flex-shrink-0 w-64">
                        <PropertyManageSidebar />
                    </div>

                    <div className="flex-1 p-6 md:p-12 bg-gray-100">
                        <header className="mb-6">
                            <h1 className="text-2xl font-bold">
                                Property Management
                            </h1>
                            <div className="flex mt-4 items-center">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search property..."
                                    className="p-2 border rounded w-[300px]"
                                />
                                <div className="ml-auto">
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded"
                                        onClick={openModal}
                                        disabled={loading}
                                    >
                                        Apply New Property
                                    </button>
                                </div>
                            </div>
                        </header>

                        <PropertyFormModal
                            isOpen={isPropertyFormModalOpen}
                            onClose={closeModal}
                        />
                        {/* Table */}
                        <main className="bg-white p-6 rounded-lg shadow-md">
                            {loading ? (
                                <div className="flex justify-center items-center max-h-screen">
                                    <div className="w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
                                </div>
                            ) : filteredProperties.length === 0 ? (
                                <div className="text-center text-lg font-semibold text-gray-600">
                                    No Properties available.
                                </div>
                            ) : (
                                <table className="min-w-full bg-white border rounded shadow-lg">
                                    <thead>
                                        <tr className="bg-gray-100 text-left">
                                            <th className="px-4 py-2">
                                                Property Name
                                            </th>
                                            <th className="px-4 py-2 text-center">
                                                User
                                            </th>
                                            <th className="px-4 py-2 text-center">
                                                Purchase
                                            </th>
                                            <th className="px-4 py-2 text-center">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProperties.map((property) => (
                                            <tr key={property.id}>
                                                <td className="px-4 py-2">
                                                    {property.property_name}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {property.username}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                                            property.purchase ===
                                                            "For Sale"
                                                                ? "bg-blue-100"
                                                                : "bg-green-100"
                                                        }`}
                                                        style={{
                                                            width: "100px",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {property.purchase}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                                            property.approval_status ===
                                                            "Approved"
                                                                ? "bg-green-200"
                                                                : property.approval_status ===
                                                                  "Rejected"
                                                                ? "bg-red-200"
                                                                : "bg-yellow-200"
                                                        }`}
                                                        style={{
                                                            width: "100px",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {
                                                            property.approval_status
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                                                        style={{
                                                            width: "100px",
                                                            textAlign: "center",
                                                        }}
                                                        onClick={() =>
                                                            handleEditProperty(
                                                                property
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                                        style={{
                                                            width: "100px",
                                                            textAlign: "center",
                                                        }}
                                                        onClick={() =>
                                                            handleDeleteProperty(
                                                                property
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div
                                className="flex justify-between mt-4"
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    marginRight: "10px",
                                }}
                            >
                                <span className="flex items-center">
                                    Total properties : {totalProperties}
                                </span>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                >
                                    Previous
                                </button>
                                <span className="flex items-center">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                >
                                    Next
                                </button>
                            </div>
                            <PropertyEditModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onSubmit={(updatedProperty) => {
                                    // Refresh the properties list after successful update
                                    setProperties((prev) =>
                                        prev.map((prop) =>
                                            prop.id === updatedProperty.id
                                                ? updatedProperty
                                                : prop
                                        )
                                    );
                                }}
                                property={selectedProperty}
                            />

                            <ShowDeleteConfirmationModal
                                isOpen={isDeleteModalOpen}
                                onClose={() => setIsDeleteModalOpen(false)}
                                onConfirm={confirmDeleteProperty}
                                message={`Are you sure you want to delete the property "${propertyToDelete?.property_name}"?`}
                            />
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
