import React, { useMemo, useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DataTable from "react-data-table-component";
import axios from "axios";

import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import ShowConfirmationModal from "@/Components/Property/ShowConfirmationModal";
import PrimaryButton from "@/Components/PrimaryButton";
import LinkButton from "@/Components/LinkButton";
import PropertyFormModal from "@/Components/Property/PropertyFormModal";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";

export default function PropertyManagement({ auth }) {
    // Use DataTable for responsive table view -- Vennise 3/7/2025
    const { properties } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");

    const propertyList = useMemo(() => (
        Array.isArray(properties?.data) ? properties.data.map((prop) => ({
            id: prop.id,
            username: prop.username,
            property_name: prop.property_name,
            property_address_line_1: prop.property_address_line_1,
            property_address_line_2: prop.property_address_line_2,
            city: prop.city,
            postal_code: prop.postal_code,
            state: prop.state,
            purchase: prop.purchase,
            sale_type: prop.sale_type,
            property_type: prop.property_type,
            number_of_units: prop.number_of_units,
            square_feet: prop.square_feet,
            price: prop.price,
            certificate_photos: prop.certificate_photos,
            property_photos: prop.property_photos,
            each_unit_has_furnace: prop.each_unit_has_furnace,
            each_unit_has_electrical_meter: prop.each_unit_has_electrical_meter,
            has_onsite_caretaker: prop.has_onsite_caretaker,
            parking: prop.parking,
            amenities: prop.amenities,
            other_amenities: prop.other_amenities,
            additional_info: prop.additional_info,
            approval_status: prop.approval_status,
        })) : []
    ), [properties]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return propertyList;
        return propertyList.filter(row =>
            Object.values(row).some(value =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, propertyList]);

    const reloadTable = () => {
        router.reload({ only: ["properties"] });
    };

    const columns = [
        { name: "Property Name", selector: row => row.property_name, sortable: true },
        { name: "Username", selector: row => row.username, sortable: true },
        { name: "Purchase Type", selector: row => row.purchase, sortable: true },
        { name: "Approval Status", selector: row => row.approval_status, sortable: true },
        {
            name: "Actions",
            cell: row => (
                <>
                    <SecondaryButton
                        onClick={() => handleEditProperty(row)}  // Use 'row' instead of 'property'
                        className="px-1 py-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width='15' height='15'><path fill="currentColor" fillRule="evenodd" d="M9.639 1.646a.5.5 0 0 1 .707 0l2.121 2.122a.5.5 0 0 1 0 .707l-6.32 6.32l-3.432.743l.567-3.403a.5.5 0 0 1 .14-.272zM14 14H2v-1h12z" clipRule="evenodd" /></svg>
                    </SecondaryButton>
                    <DangerButton
                        onClick={() => handleDeleteProperty(row)} // Use 'row' instead of 'property'
                        className="px-1 py-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width='15' height='15'><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 6H6l2 24h16l2-24H4m12 6v12m5-12l-1 12m-9-12l1 12m0-18l1-4h6l1 4" /></svg>
                    </DangerButton>
                </>
            )
        }
    ];

    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);

    const handleEditProperty = (property) => {
        console.log("check ", property);
        setSelectedProperty(property);
        setModal(true);
    };

    const handleDeleteProperty = (property) => {
        setPropertyToDelete(property);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProperty = () => {
        if (propertyToDelete) {
            setLoading(true);
            axios
                .delete(`/delete-property/${propertyToDelete.id}`)
                .catch((error) => {
                    console.error("Error deleting property:", error);
                    alert("Failed to delete the property. Please try again.");
                })
                .finally(() => {
                    setLoading(false);
                    setIsDeleteModalOpen(false);
                    setPropertyToDelete(null);
                    reloadTable();
                });
        }
    };

    const openModal = () => {
        setSelectedProperty(null);
        setModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Property" />
            <div className="flex w-full min-h-screen pt-0 bg-gray-100">
                {/* Main Content */}
                <div className="flex-1 px-6 py-3 w-full md:p-12 bg-gray-100">
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                            <div className="flex items-center flex-wrap w-full md:w-auto flex-nowrap">
                                <InputLabel htmlFor="searchTerm" value="Search:" className="pr-4" />
                                <TextInput
                                    id="searchTerm"
                                    name="searchTerm"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search property..."
                                    className="p-2 border rounded w-full md:w-[500px]"
                                />
                            </div>
                            <div className="w-full md:w-auto flex justify-end">
                                <LinkButton onClick={openModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width='15' height='15'><path fill="blue" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                                    <span className="block md:hidden">Add</span>
                                    <span className="hidden md:block">Add Property</span>
                                </LinkButton>

                            </div>
                        </div>
                    </div>
                    {/* Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {loading ? (
                            <div className="flex justify-center items-center max-h-screen">
                                <div className="w-full md:w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            // <table className="min-w-full border rounded">
                            //     <thead>
                            //         <tr className="bg-gray-100 text-left">
                            //             <th className="px-4 py-2">
                            //                 Property Name
                            //             </th>
                            //             <th className="px-4 py-2 text-center">
                            //                 User
                            //             </th>
                            //             <th className="px-4 py-2 text-center">
                            //                 Purchase
                            //             </th>
                            //             <th className="px-4 py-2 text-center">
                            //                 Status
                            //             </th>
                            //             <th className="px-4 py-2 text-center">
                            //                 Actions
                            //             </th>
                            //         </tr>
                            //     </thead>
                            //     <tbody>
                            //         {filteredProperties.map((property) => (
                            //             <tr key={property.id}>
                            //                 <td className="px-4 py-2">
                            //                     {property.property_name}
                            //                 </td>
                            //                 <td className="px-4 py-2 text-center">
                            //                     {property.username}
                            //                 </td>
                            //                 <td className="px-4 py-2 text-center">
                            //                     <span
                            //                         className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${property.purchase ===
                            //                             "For Sale"
                            //                             ? "bg-blue-100"
                            //                             : "bg-green-100"
                            //                             }`}
                            //                         style={{
                            //                             width: "100px",
                            //                             textAlign: "center",
                            //                         }}
                            //                     >
                            //                         {property.purchase}
                            //                     </span>
                            //                 </td>
                            //                 <td className="px-4 py-2 text-center">
                            //                     <span
                            //                         className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${property.approval_status ===
                            //                             "Approved"
                            //                             ? "bg-green-200"
                            //                             : property.approval_status ===
                            //                                 "Rejected"
                            //                                 ? "bg-red-200"
                            //                                 : "bg-yellow-200"
                            //                             }`}
                            //                         style={{
                            //                             width: "100px",
                            //                             textAlign: "center",
                            //                         }}
                            //                     >
                            //                         {
                            //                             property.approval_status
                            //                         }
                            //                     </span>
                            //                 </td>
                            //                 <td className="px-4 py-2 text-center">
                            //                     <button
                            //                         className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                            //                         style={{
                            //                             width: "100px",
                            //                             textAlign: "center",
                            //                         }}
                            //                         onClick={() =>
                            //                             handleEditProperty(
                            //                                 property
                            //                             )
                            //                         }
                            //                     >
                            //                         Edit
                            //                     </button>
                            //                     <button
                            //                         className="px-2 py-1 bg-red-500 text-white rounded"
                            //                         style={{
                            //                             width: "100px",
                            //                             textAlign: "center",
                            //                         }}
                            //                         onClick={() =>
                            //                             handleDeleteProperty(
                            //                                 property
                            //                             )
                            //                         }
                            //                     >
                            //                         Delete
                            //                     </button>
                            //                 </td>
                            //             </tr>
                            //         ))}
                            //     </tbody>
                            // </table>
                            <DataTable
                                title="Properties Application"
                                columns={columns}
                                data={filteredData}
                                pagination
                                responsive
                                highlightOnHover
                            />
                        )}
                        <PropertyFormModal
                            isOpen={modal}
                            onClose={() => { setSelectedProperty(null); setModal(false); reloadTable(); }}
                            property={selectedProperty}
                        />

                        <ShowConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => { setIsDeleteModalOpen(false); }}
                            onConfirm={confirmDeleteProperty}
                            message={`Are you sure you want to delete the property "${propertyToDelete?.property_name}"?`}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
