import React, { useState } from "react";
import { usePendingCount } from "@/Contexts/PendingCountContext";
import RejectReasonModal from "./RejectReasonModal";
import axios from "axios";
import ApproveConfirmationModal from "./ApproveConfirmationModal";
// axios.defaults.headers.common["X-CSRF-TOKEN"] = document
//     .querySelector('meta[name="csrf-token"]')
//     ?.getAttribute("content");

const ViewPropertyModal = ({
    isOpen,
    propertyDetails,
    onClose,
    setShouldReload,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [properties, setProperties] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const { fetchPendingCount } = usePendingCount();
    const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

    if (!isOpen) return null;

    const prevPhoto = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0
                ? propertyDetails.property_photos.length - 1
                : prevIndex - 1
        );
    };

    const nextPhoto = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === propertyDetails.property_photos.length - 1
                ? 0
                : prevIndex + 1
        );
    };

    const handleClose = () => {
        setCurrentIndex(0);
        onClose();
    };

    const handleApprove = async (id) => {
        try {
            const response = await axios.post(`/api/properties/${id}/approve`);
            if (response.data.status) {
                setProperties(
                    properties.map((property) =>
                        property.id === id
                            ? {
                                  ...property,
                                  approval_status: "Approved",
                                  rejection_reason: "",
                              }
                            : property
                    )
                );

                await fetchPendingCount();
                setShouldReload(true);
                handleClose();
            }
        } catch (error) {
            alert("Failed to approve property. Please try again.");
        }
    };

    const handleReject = (id) => {
        setShowRejectReasonModal(true);
    };

    const submitRejectReason = async (reason) => {
        try {
            const response = await axios.post(
                `/api/properties/${propertyDetails.id}/reject`,
                {
                    reason: reason,
                }
            );
            if (response.data.status) {
                setProperties(
                    properties.map((property) =>
                        property.id === id
                            ? {
                                  ...property,
                                  approval_status: "Rejected",
                                  rejection_reason: reason,
                              }
                            : property
                    )
                );

                await fetchPendingCount();
                setShouldReload(true);
                handleClose();
                setShowRejectReasonModal(false);
            }
        } catch (error) {
            alert("Failed to reject property. Please try again.");
        }
    };

    const isButtonDisabled = (status, action) => {
        return (
            (status === "Rejected" && action === "reject") ||
            (status === "Approved" && action === "approve")
        );
    };

    const handleOpenApproveModal = () => {
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async () => {
        await handleApprove(propertyDetails.id);
        setShowApproveModal(false);
    };

    const handleCloseApproveModal = () => {
        setShowApproveModal(false);
    };

    const handleCloseRejectModal = () => {
        setShowRejectReasonModal(false);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={handleClose}
            >
                <div
                    className="bg-white rounded-lg shadow-lg w-11/12 max-w-[1200px] max-h-[90vh] relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-2 right-6 text-gray-600 hover:text-black text-3xl font-bold"
                        onClick={handleClose}
                    >
                        &times;
                    </button>

                    <div className="p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
                            Property Details
                        </h2>

                        {propertyDetails.property_photos?.length > 0 && (
                            <div className="mt-8 mb-8 text-center">
                                <div className="relative w-[500px] h-[300px] mx-auto rounded-lg shadow-md overflow-hidden">
                                    <img
                                        src={`/storage/${propertyDetails.property_photos[currentIndex]}`}
                                        alt={`Property Photo ${
                                            currentIndex + 1
                                        }`}
                                        className="w-full h-full object-cover"
                                    />

                                    <button
                                        onClick={prevPhoto}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-gray-700"
                                    >
                                        &#8592;
                                    </button>

                                    <button
                                        onClick={nextPhoto}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-gray-700"
                                    >
                                        &#8594;
                                    </button>
                                </div>

                                <div className="flex justify-center mt-4">
                                    {propertyDetails.property_photos.map(
                                        (_, index) => (
                                            <span
                                                key={index}
                                                className={`w-3 h-3 mx-1 rounded-full ${
                                                    index === currentIndex
                                                        ? "bg-blue-500"
                                                        : "bg-gray-300"
                                                }`}
                                            ></span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-800">
                            <div className="space-y-4">
                                <p>
                                    <strong>Username:</strong>{" "}
                                    {propertyDetails.username || "N/A"}
                                </p>
                                <p>
                                    <strong>Property Name:</strong>{" "}
                                    {propertyDetails.property_name}
                                </p>
                                <p>
                                    <strong>Property Type:</strong>{" "}
                                    {propertyDetails.property_type}
                                </p>
                                <p>
                                    <strong>Address:</strong>{" "}
                                    {`${
                                        propertyDetails.property_address_line_1
                                    }, ${
                                        propertyDetails.property_address_line_2 ||
                                        ""
                                    }`}
                                </p>
                                <p>
                                    <strong>Postal Code:</strong>{" "}
                                    {propertyDetails.postal_code || "N/A"}
                                </p>
                                <p>
                                    <strong>City:</strong>{" "}
                                    {propertyDetails.city}
                                </p>
                                <p>
                                    <strong>State:</strong>{" "}
                                    {propertyDetails.state}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p>
                                    <strong>Purchase:</strong>{" "}
                                    {propertyDetails.purchase}
                                </p>
                                <p>
                                    <strong>Sale Type:</strong>{" "}
                                    {propertyDetails.sale_type || "N/A"}
                                </p>
                                <p>
                                    <strong>Number of Units:</strong>{" "}
                                    {propertyDetails.number_of_units}
                                </p>
                                <p>
                                    <strong>Square Feet:</strong>{" "}
                                    {propertyDetails.square_feet || "N/A"}
                                </p>
                                <p>
                                    <strong>Price:</strong> RM{" "}
                                    {propertyDetails.price}
                                </p>
                                <p>
                                    <strong>Parking:</strong>{" "}
                                    {propertyDetails.parking || "N/A"}
                                </p>
                                <p>
                                    <strong>Amenities:</strong>{" "}
                                    {propertyDetails.amenities?.join(", ") ||
                                        "N/A"}
                                </p>
                            </div>
                        </div>
                        {propertyDetails.approval_status !== "Pending" &&
                            (propertyDetails.approval_status === "Approved" ? (
                                <div className="mt-8 mb-8 p-4 bg-green-100 text-green-800 rounded-lg">
                                    <p className="font-semibold">
                                        This property has been approved.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-8 mb-8 p-4 bg-red-100 text-red-800 rounded-lg">
                                    <p>
                                        <strong className="text-lg">
                                            Rejection Reason:
                                        </strong>
                                        <span className="font-semibold">
                                            {" "}
                                            {propertyDetails.rejection_reason ||
                                                "N/A"}
                                            .
                                        </span>
                                    </p>
                                </div>
                            ))}

                        <div className="flex justify-end mt-8 space-x-4">
                            <button
                                className={`px-2 py-1 rounded mr-2 ${
                                    isButtonDisabled(
                                        propertyDetails.approval_status,
                                        "approve"
                                    )
                                        ? "bg-gray-500 text-white cursor-not-allowed"
                                        : "bg-green-500 text-white"
                                }`}
                                style={{
                                    width: "100px",
                                    textAlign: "center",
                                }}
                                onClick={handleOpenApproveModal}
                                disabled={isButtonDisabled(
                                    propertyDetails.approval_status,
                                    "approve"
                                )}
                            >
                                Approve
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${
                                    isButtonDisabled(
                                        propertyDetails.approval_status,
                                        "reject"
                                    )
                                        ? "bg-gray-500 text-white cursor-not-allowed"
                                        : "bg-red-500 text-white"
                                }`}
                                style={{
                                    width: "100px",
                                    textAlign: "center",
                                }}
                                onClick={() => handleReject(propertyDetails.id)}
                                disabled={isButtonDisabled(
                                    propertyDetails.approval_status,
                                    "reject"
                                )}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showApproveModal && (
                <ApproveConfirmationModal
                    isOpen={showApproveModal}
                    onClose={handleCloseApproveModal}
                    onConfirm={handleConfirmApprove}
                />
            )}
            {showRejectReasonModal && (
                <RejectReasonModal 
                    isOpen={showRejectReasonModal}
                    onClose={handleCloseRejectModal}
                    onSubmit={submitRejectReason}
                />
            )}
        </>
    );
};

export default ViewPropertyModal;
