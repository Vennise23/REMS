import React, { useState } from "react";

const RejectReasonModal = ({ onClose, onSubmit }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (reason.trim() === "") {
            alert("Please provide a reason for rejection.");
        } else {
            onSubmit(reason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
                className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-2 right-6 text-gray-600 hover:text-black text-3xl font-bold"
                    onClick={onClose}
                >
                    &times;
                </button>

                {/* Modal Content */}
                <div className="p-6">
                    <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
                        Provide Rejection Reason
                    </h2>

                    {/* Reject Reason Input */}
                    <textarea
                        className="w-full p-3 border rounded-md text-gray-700"
                        placeholder="Enter rejection reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows="4"
                    ></textarea>

                    {/* Buttons Section */}
                    <div className="flex justify-between mt-4">
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            onClick={handleSubmit}
                        >
                            Submit Reason
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectReasonModal;